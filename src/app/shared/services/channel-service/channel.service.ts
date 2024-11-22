import { inject, Injectable } from '@angular/core';
import { Firestore, doc, docData, collection } from '@angular/fire/firestore';
import {
  BehaviorSubject,
  Observable,
  catchError,
  distinctUntilChanged,
  forkJoin,
  from,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { Channel } from '../../models/channel.model';
import { arrayUnion, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { MatDialog } from '@angular/material/dialog';
import { ProfileInfoDialogComponent } from '../../profile-info-dialog/profile-info-dialog.component';
import { UserData } from '../../models/user.model';
import { ChannelMessage } from '../../models/channel-message.model';
import { UserService } from '../user-service/user.service';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private currentChannelSubject = new BehaviorSubject<Channel | undefined>(
    undefined
  ); // BehaviorSubject
  public currentChannel$ = this.currentChannelSubject.asObservable(); // Observable für Komponenten
  public channelId: string = '';
  public actualThread: Array<string> = []; // Daten des aktuell ausgewählten Threads
  private userService = inject(UserService);
  loading: boolean = true;

  private usersData: BehaviorSubject<Map<string, any>> = new BehaviorSubject(
    new Map()
  );

  // Neues Observable für Channel-Daten
  public channelData$: Observable<Channel | undefined> = this.currentChannel$.pipe(
    shareReplay(1) // Verhindert, dass bei jedem Wechsel des Channels die Daten neu geladen werden müssen
  );
  

  constructor(private firestore: Firestore, public dialog: MatDialog) {}

  // Methode zum Laden eines Channels und Speichern im Subject
  setChannel(channelId: string): void {
    this.channelId = channelId;
    this.loading = true; // Ladezustand aktivieren
    this.getChannelById(channelId).subscribe({
      next: (channel) => {
        this.currentChannelSubject.next(channel); // Channel setzen
        this.loading = false; // Ladezustand deaktivieren
      },
      error: (error) => {
        console.error('Fehler beim Laden des Channels:', error);
        this.loading = false; // Ladezustand deaktivieren bei Fehler
      },
    });
  }

  // Methode zur Abfrage eines Channels anhand der ID
  getChannelById(channelId: string): Observable<Channel | undefined> {
    const channelDocRef = doc(this.firestore, `channels/${channelId}`);
    return docData(channelDocRef).pipe(
      map((docSnapshot: any) => {
        if (docSnapshot) {
          const channelData = docSnapshot as {
            admin: { userId: string };
            channelName: string;
            description: string;
            members: string[]; // Jetzt als string[]
            messages: { [messageId: string]: any };
            usersLeft: string[];
          };

          return new Channel(
            channelData.admin,
            channelId,
            channelData.channelName,
            channelData.description,
            channelData.members, // Direkt als string[] übergeben
            channelData.messages,
            channelData.usersLeft
          );
        } else {
          return undefined; // Rückgabe `undefined`, falls keine Daten vorhanden sind
        }
      })
    );
  }

  // Methode zum Abrufen der Benutzerdaten
  getUsersData(members: { userId: string }[]): Observable<any[]> {
    const userRequests = members.map((member) =>
      this.userService.getUserDataByUID(member.userId).pipe(
        catchError((error) => {
          console.error('Benutzer nicht gefunden:', member.userId);
          return of(null); // Gibt null zurück, falls der Benutzer nicht gefunden wird
        })
      )
    );
    return forkJoin(userRequests); // Wartet, bis alle Benutzerdaten abgerufen wurden
  }

  getChannels(): Observable<Channel[]> {
    const channelsCollection = collection(this.firestore, 'channels');
    return from(getDocs(channelsCollection)).pipe(
      map((channelSnapshot) =>
        channelSnapshot.docs.map((doc) => {
          const channelData = doc.data() as {
            admin: { userId: string }; // Nur userId gespeichert
            channelName: string;
            description: string;
            members: { userId: string }[]; // Nur userId gespeichert
            messages: { [messageId: string]: ChannelMessage };
          };

          // Erstelle eine neue Instanz von Channel und gib sie zurück
          return new Channel(
            channelData.admin, // Nur userId weitergeben
            doc.id, // Verwende die ID des Dokuments
            channelData.channelName,
            channelData.description,
            channelData.members.map((member) => member.userId), // Nur userIds weitergeben
            channelData.messages
          );
        })
      )
    );
  }

  // Funktion fürs Erstellen eines neuen Channels
  createChannel(channelData: Partial<Channel>): Observable<string> {
    const channelCollection = collection(this.firestore, 'channels');
    const newChannelRef = doc(channelCollection);

    const channelObject = {
      ...JSON.parse(JSON.stringify(channelData)),
      channelId: newChannelRef.id,
    };

    return from(setDoc(newChannelRef, channelObject)).pipe(
      switchMap(() => {
        const userIds = channelData.members || [];
        const updateUserObservables = userIds.map((userId) => {
          const userDocRef = doc(this.firestore, `users/${userId}`);
          return from(
            updateDoc(userDocRef, {
              channels: arrayUnion(newChannelRef.id), // Channel ID zu den Benutzern hinzufügen
            })
          );
        });

        return from(Promise.all(updateUserObservables)).pipe(
          map(() => newChannelRef.id)
        );
      })
    );
  }

  setActualThread(threadData: Array<string>): void {
    this.actualThread = threadData;
  }

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

  updateChannelName(channelId: string, newName: string): Promise<void> {
    const channelDocRef = doc(this.firestore, `channels/${channelId}`);
    return updateDoc(channelDocRef, { channelName: newName });
  }

  getChannelMembers(channelId: string): Observable<string[]> {
    const channelDocRef = doc(this.firestore, `channels/${channelId}`);
    return docData(channelDocRef).pipe(
      map((docSnapshot: any) => {
        if (docSnapshot) {
          // Extrahiere die Mitglieder aus den Channel-Daten
          const channelData = docSnapshot as {
            members: string[]; // Mitglieder als Array von User-IDs
          };
          return channelData.members || []; // Rückgabe der Mitglieder oder ein leeres Array, falls keine vorhanden sind
        } else {
          return []; // Falls kein Channel gefunden wurde, ein leeres Array zurückgeben
        }
      }),
      catchError((error) => {
        console.error('Fehler beim Abrufen der Mitglieder:', error);
        return of([]); // Im Falle eines Fehlers ein leeres Array zurückgeben
      })
    );
  }

  // ChannelService
  loadUsersDataForChannel(members: string[], usersLeft?: string[]): void {
    const allUserIds = new Set([...members, ...(usersLeft || [])]);

    // Greife auf die aktuelle Map zu
    const currentUsersMap = this.usersData.value;

    allUserIds.forEach((userId) => {
      if (!currentUsersMap.has(userId)) {
        this.userService.getUserDataByUID(userId).subscribe({
          next: (userData) => {
            if (userData) {
              // Aktualisiere die Map und setze den neuen Zustand
              currentUsersMap.set(userId, userData);
              this.usersData.next(new Map(currentUsersMap)); // Erstelle eine neue Map-Instanz
            }
          },
          error: (err) =>
            console.error(`Fehler beim Laden von Benutzer ${userId}:`, err),
        });
      }
    });
  }

  // ChannelService
  getUsersDataObservable(): Observable<Map<string, any>> {
    return this.usersData.asObservable().pipe();
  }


  addUserToChannel(userId: string, channelId: string): Promise<void> {
    const channelDocRef = doc(this.firestore, `channels/${channelId}`);
    return updateDoc(channelDocRef, {
      members: arrayUnion(userId),
    });
  }
}
