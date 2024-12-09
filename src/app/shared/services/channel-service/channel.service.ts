import { inject, Injectable } from '@angular/core';
import { Firestore, doc, docData, collection } from '@angular/fire/firestore';
import {
  BehaviorSubject,
  Observable,
  Subscription,
  catchError,
  forkJoin,
  from,
  map,
  mergeMap,
  of,
  shareReplay,
  switchMap,
  tap,
  toArray,
} from 'rxjs';
import { Channel } from '../../models/channel.model';
import {
  arrayUnion,
  DocumentReference,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { MatDialog } from '@angular/material/dialog';
import { ProfileInfoDialogComponent } from '../../profile-info-dialog/profile-info-dialog.component';
import { ChannelMessage } from '../../models/channel-message.model';
import { UserService } from '../user-service/user.service';
import { collectionData } from 'rxfire/firestore';
import { MessageService } from '../message-service/message.service';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private currentChannelSubject = new BehaviorSubject<Channel | undefined>(
    undefined
  );
  public currentChannel$ = this.currentChannelSubject.asObservable();
  public channelId: string = '';
  public actualThread: Array<string> = [];
  private userService = inject(UserService);
  loading: boolean = true;
  private messageService = inject(MessageService);
  private channelDataMap = new Map<string, Channel>();
  private channelDataMapSubject = new BehaviorSubject<Map<string, Channel>>(
    this.channelDataMap
  );
  private channelDataMapSubscription: Subscription | undefined;
  private channelSubscription: Subscription | undefined;
  private userDataSubscription: Subscription | undefined;
  public addMemberMenu: boolean = false;

  /**
   * Getter for the channelDataMap observable
   * @returns The observable of the channelDataMap
   */
  get channelDataMap$() {
    return this.channelDataMapSubject.asObservable();
  }
  private usersData: BehaviorSubject<Map<string, any>> = new BehaviorSubject(
    new Map()
  );
  public channelData$: Observable<Channel | undefined> =
    this.currentChannel$.pipe(shareReplay(1));

  /**
   * Constructor of the ChannelService, that loads all channels and their messages.
   * @param firestore The Firestore instance to use.
   * @param dialog The MatDialog instance to use.
   */
  constructor(private firestore: Firestore, public dialog: MatDialog) {
    this.loadAllChannels();
    this.listenToChannelChanges();
  }

  /**
   * Unsubscribes from subscriptions when the component is destroyed.
   */
  ngOnDestroy(): void {
    this.channelDataMapSubscription?.unsubscribe();
    this.channelSubscription?.unsubscribe();
    this.userDataSubscription?.unsubscribe();
  }

  /**
   * Loads all channels and their messages, storing them in a Map and notifying subscribers.
   */
  loadAllChannels(): void {
    const channelCollection = collection(this.firestore, 'channels');
    this.channelDataMapSubscription = collectionData(channelCollection, {
      idField: 'channelId',
    }).subscribe({
      next: async (data) => {
        await this.loadAndStoreChannels(data);
        this.channelDataMapSubject.next(new Map(this.channelDataMap));
      },
      error: (error) => console.error('Error loading channels:', error),
    });
  }

  /**
   * Loads and stores channels and their messages.
   * @param data The data of all channels retrieved from Firestore.
   */
  private async loadAndStoreChannels(data: any[]): Promise<void> {
    for (const channelData of data) {
      const messages = await this.loadMessages(channelData['channelId']);
      const channel = new Channel(
        channelData['admin'],
        channelData['channelId'],
        channelData['channelName'],
        channelData['description'],
        channelData['members'],
        messages,
        channelData['usersLeft']
      );
      this.channelDataMap.set(channel.channelId, channel);
    }
  }

  /**
   * Loads messages for a given channel from Firestore.
   * @param channelId The ID of the channel whose messages are to be loaded.
   * @returns A promise that resolves to an object of messages, indexed by message IDs.
   */
  private async loadMessages(
    channelId: string
  ): Promise<{ [messageId: string]: ChannelMessage }> {
    const messagesSnapshot = await this.fetchMessages(channelId);
    return this.mapMessages(messagesSnapshot);
  }

  /**
   * Fetches messages from Firestore.
   * @param channelId The ID of the channel whose messages to fetch.
   * @returns A snapshot of messages in the channel.
   */
  private async fetchMessages(channelId: string): Promise<any> {
    const messagesCollection = collection(
      this.firestore,
      `channels/${channelId}/messages`
    );
    return await getDocs(messagesCollection);
  }

  /**
   * Maps the messages snapshot to a dictionary of ChannelMessages.
   * @param {any} messagesSnapshot - The snapshot of the messages from Firestore.
   * @returns {Object} A dictionary where the keys are message IDs and the values are ChannelMessage objects.
   */
  private mapMessages(messagesSnapshot: any): {
    [messageId: string]: ChannelMessage;
  } {
    const messagesArray = this.extractMessages(messagesSnapshot);
    return this.reduceMessagesToMap(messagesArray);
  }

  /**
   * Extracts messages from the Firestore snapshot.
   * @param {any} messagesSnapshot - The snapshot containing messages.
   * @returns {Object[]} An array of message objects.
   */
  private extractMessages(messagesSnapshot: any): {
    id: string;
    content: string;
    userId: string;
    timestamp: string;
    attachmentUrls: string[];
    reactions: any[];
  }[] {
    return messagesSnapshot.docs.map((doc: any) => {
      const data = doc.data();
      return { id: doc.id, ...data };
    });
  }

  /**
   * Reduces the array of message objects into a dictionary of ChannelMessage objects.
   * @param {Object[]} messagesArray - The array of message objects.
   * @returns {Object} A dictionary where the keys are message IDs and the values are ChannelMessage objects.
   */
  private reduceMessagesToMap(messagesArray: any[]): {
    [messageId: string]: ChannelMessage;
  } {
    return messagesArray.reduce((acc, message) => {
      acc[message.id] = new ChannelMessage(
        message.content,
        message.userId,
        message.id,
        message.timestamp,
        message.attachmentUrls,
        message.reactions
      );
      return acc;
    }, {} as { [messageId: string]: ChannelMessage });
  }

  /**
   * Listens to changes in channels and updates the channelDataMap accordingly.
   * @returns void
   */
  listenToChannelChanges(): void {
    const channelCollection = collection(this.firestore, 'channels');
    onSnapshot(channelCollection, (snapshot) => {
      snapshot
        .docChanges()
        .forEach((change) => this.processChannelChange(change));
    });
  }

  /**
   * Processes changes to a channel and updates the channelDataMap.
   * @param change - The document change event.
   */
  private processChannelChange(change: any): void {
    const channelId = change.doc.id;
    const channelData = change.doc.data();
    if (change.type === 'added' || change.type === 'modified') {
      const updatedChannel = new Channel(
        channelData['admin'],
        channelId,
        channelData['channelName'],
        channelData['description'],
        channelData['members'],
        channelData['messages'],
        channelData['usersLeft']
      );
      this.channelDataMap.set(channelId, updatedChannel);
    } else if (change.type === 'removed') this.channelDataMap.delete(channelId);
    this.channelDataMapSubject.next(new Map(this.channelDataMap));
  }

  /**
   * Sets the current channel and loads its messages.
   * @param channelId The ID of the channel to set.
   */
  setChannel(channelId: string): void {
    if (channelId !== this.channelId) this.loading = true;
    this.channelId = channelId;
    this.messageService.loadMessagesForChannel(channelId);
    this.channelSubscription = this.getChannelById(channelId).subscribe({
      next: (channel) => {
        this.currentChannelSubject.next(channel);
      },
      error: (error) => {
        console.error('Fehler beim Laden des Channels:', error);
      },
    });
    setTimeout(() => {
      this.loading = false;
    }, 2000);
  }

  /**
   * Loads a channel by its ID from Firestore.
   * @param channelId The ID of the channel to load.
   * @returns An observable that emits the loaded channel or `undefined` if not found.
   */
  getChannelById(channelId: string): Observable<Channel | undefined> {
    const channelDocRef = doc(this.firestore, `channels/${channelId}`);
    return docData(channelDocRef).pipe(
      map((docSnapshot: any) => {
        if (docSnapshot) {
          const channelData = docSnapshot as {
            admin: { userId: string };
            channelName: string;
            description: string;
            members: string[];
            messages: { [messageId: string]: any };
            usersLeft: string[];
          };
          return new Channel(
            channelData.admin,
            channelId,
            channelData.channelName,
            channelData.description,
            channelData.members,
            channelData.messages,
            channelData.usersLeft
          );
        } else {
          return undefined;
        }
      })
    );
  }

  /**
   * Retrieves user data for an array of user IDs.
   * @param members An array of user IDs.
   * @returns An observable that emits an array of user data.
   */
  getUsersData(members: { userId: string }[]): Observable<any[]> {
    const userRequests = members.map((member) =>
      this.userService.getUserDataByUID(member.userId).pipe(
        catchError((error) => {
          console.error('Benutzer nicht gefunden:', member.userId);
          return of(null);
        })
      )
    );
    return forkJoin(userRequests);
  }

  /**
   * Retrieves all channels from Firestore.
   * @returns An observable that emits an array of channels.
   */
  getChannels(): Observable<Channel[]> {
    const channelsCollection = collection(this.firestore, 'channels');
    return from(getDocs(channelsCollection)).pipe(
      map((channelSnapshot) =>
        channelSnapshot.docs.map((doc) => {
          const channelData = doc.data() as {
            admin: { userId: string };
            channelName: string;
            description: string;
            members: { userId: string }[];
            messages: { [messageId: string]: ChannelMessage };
          };
          return new Channel(
            channelData.admin,
            doc.id,
            channelData.channelName,
            channelData.description,
            channelData.members.map((member) => member.userId),
            channelData.messages
          );
        })
      )
    );
  }

  /**
   * Creates a new channel in Firestore and updates the associated users.
   * @param {Partial<Channel>} channelData - Data for the channel to be created.
   * @returns {Observable<string>} Observable emitting the new channel ID.
   */
  createChannel(channelData: Partial<Channel>): Observable<string> {
    const channelCollection = collection(this.firestore, 'channels');
    const newChannelRef = doc(channelCollection);
    const channelObject = this.prepareChannelObject(
      channelData,
      newChannelRef.id
    );
    return this.addChannelToFirestore(newChannelRef, channelObject).pipe(
      switchMap(() => {
        return this.updateUsersWithChannel(
          channelData.members!,
          newChannelRef.id
        );
      }),
      map(() => {
        console.log('Returning newChannelRef.id:', newChannelRef.id);
        return newChannelRef.id;
      }),
      catchError((error) => {
        console.error('Error in createChannel:', error);
        throw error;
      })
    );
  }

  /**
   * Prepares the channel object by adding the generated channel ID.
   * @param {Partial<Channel>} channelData - Channel data.
   * @param {string} channelId - The generated channel ID.
   * @returns {object} The prepared channel object.
   */
  prepareChannelObject(channelData: Partial<Channel>, channelId: string) {
    return {
      ...JSON.parse(JSON.stringify(channelData)),
      channelId: channelId,
    };
  }

  /**
   * Adds the channel document to Firestore.
   * @param {DocumentReference} newChannelRef - Reference to the new channel document.
   * @param {object} channelObject - The channel data to be stored.
   * @returns {Observable<void>} Observable indicating the result of the Firestore operation.
   */
  addChannelToFirestore(
    newChannelRef: DocumentReference,
    channelObject: object
  ): Observable<void> {
    return from(setDoc(newChannelRef, channelObject));
  }

  /**
   * Updates each user's channels list by adding the new channel ID.
   * @param {string[]} userIds - Array of user IDs to update.
   * @param {string} channelId - The new channel ID to add to each user.
   * @returns {Observable<void[]>} Observable indicating the result of all user updates.
   */
  updateUsersWithChannel(
    userIds: string[],
    channelId: string
  ): Observable<void[]> {
    console.log('updateUsersWithChannel called');
    const updateUserObservables = userIds.map((userId) => {
      const userDocRef = doc(this.firestore, `users/${userId}`);
      return from(
        updateDoc(userDocRef, {
          channels: arrayUnion(channelId),
        })
      );
    });

    return from(updateUserObservables).pipe(
      tap(() => console.log('updateDoc called for user')),
      mergeMap((observable) => observable),
      toArray(),
      tap(() => console.log('All users updated successfully'))
    );
  }

  /**
   * Sets the actual thread data.
   * @param threadData An array of thread data.
   */
  setActualThread(threadData: Array<string>): void {
    this.actualThread = threadData;
  }

  /**
   * Opens the profile info dialog for a user.
   * @param user The user object to open the dialog for.
   */
  openProfileInfo(user: any): void {
    const dialogRef = this.dialog.open(ProfileInfoDialogComponent, {
      data: {
        userId: user.userId,
        userName: user.userName,
        userPhotoURL: user.photoURL,
        email: user.email,
      },
    });
  }

  /**
   * Updates the description of a channel.
   * @param channelId The ID of the channel to update.
   * @param newDescription The new description to set.
   * @returns An observable that emits the updated channel.
   */
  updateChannelDescription(
    channelId: string,
    newDescription: string
  ): Observable<void> {
    const channelDocRef = doc(this.firestore, `channels/${channelId}`);
    return from(updateDoc(channelDocRef, { description: newDescription })).pipe(
      switchMap(() => this.getChannelById(channelId)),
      map((updatedChannel) => {
        this.currentChannelSubject.next(updatedChannel);
      })
    );
  }

  /**
   * Updates the name of a channel.
   * @param channelId The ID of the channel to update.
   * @param newName The new name to set.
   * @returns A Promise<void>
   */
  updateChannelName(channelId: string, newName: string): Promise<void> {
    const channelDocRef = doc(this.firestore, `channels/${channelId}`);
    return updateDoc(channelDocRef, { channelName: newName });
  }

  /**
   * Retrieves the members of a channel.
   * @param channelId The ID of the channel.
   * @returns An observable that emits an array of user IDs.
   */
  getChannelMembers(channelId: string): Observable<string[]> {
    const channelDocRef = doc(this.firestore, `channels/${channelId}`);
    return docData(channelDocRef).pipe(
      map((docSnapshot: any) => {
        if (docSnapshot) {
          const channelData = docSnapshot as {
            members: string[];
          };
          return channelData.members || [];
        } else {
          return [];
        }
      })
    );
  }

  /**
   * Loads user data for a channel.
   * @param members An array of user IDs.
   * @param usersLeft An optional array of user IDs that left the channel.
   */
  loadUsersDataForChannel(members: string[], usersLeft?: string[]): void {
    const allUserIds = new Set([...members, ...(usersLeft || [])]);
    const currentUsersMap = this.usersData.value;
    allUserIds.forEach((userId) => {
      if (!currentUsersMap.has(userId)) {
        this.userDataSubscription = this.userService
          .getUserDataByUID(userId)
          .subscribe({
            next: (userData) => {
              if (userData) {
                currentUsersMap.set(userId, userData);
                this.usersData.next(new Map(currentUsersMap));
              }
            },
          });
      }
    });
  }

  /**
   * A function that returns an Observable of the usersData Map
   * @returns An Observable of the usersData Map
   */
  getUsersDataObservable(): Observable<Map<string, any>> {
    return this.usersData.asObservable().pipe();
  }

  /**
   * A function that adds a user to a channel
   * @param userId The ID of the user to add
   * @param channelId The ID of the channel to add the user to
   * @returns A Promise<void>
   */
  addUserToChannel(userId: string, channelId: string): Promise<void> {
    const channelDocRef = doc(this.firestore, `channels/${channelId}`);
    return updateDoc(channelDocRef, {
      members: arrayUnion(userId),
    });
  }
}
