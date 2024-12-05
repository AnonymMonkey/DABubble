import { inject, Injectable } from '@angular/core';
import { Firestore, collection, docData } from '@angular/fire/firestore';
import { collectionData } from '@angular/fire/firestore';
import { User } from 'firebase/auth';
import { UserData } from '../../models/user.model';
import { arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { DataSnapshot, getDatabase, set } from 'firebase/database';
import { onDisconnect, onValue, ref } from 'firebase/database';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ProfileInfoDialogComponent } from '../../profile-info-dialog/profile-info-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DocumentData } from 'rxfire/firestore/interfaces';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore: Firestore = inject(Firestore);
  private database = getDatabase();
  private tempUserData: Partial<UserData> = {};
  private tempPassword: string = '';
  public userId!: string;
  private dialog = inject(MatDialog);
  private allUserDataSubject = new BehaviorSubject<any[]>([]);
  allUserData$ = this.allUserDataSubject.asObservable();
  private userDataSubject = new BehaviorSubject<any>(null);
  userData$ = this.userDataSubject.asObservable();
  public route: ActivatedRoute = inject(ActivatedRoute);
  private userDataMap = new Map<string, UserData>();
  private userDataMapSubject = new BehaviorSubject<Map<string, UserData>>(
    this.userDataMap
  );
  get userDataMap$() {
    return this.userDataMapSubject.asObservable();
  }
  allUsersOnlineStatus$: { userId: string; online: boolean }[] = [];
  constructor() {
    this.loadAllUserData();
    this.loadAllUserDataToMap();
    this.listenToUserDataChanges();
  }

  /**
   * Loads all user data from Firestore
   */
  loadAllUserData(): void {
    const userCollection = collection(this.firestore, 'users');
    collectionData(userCollection, { idField: 'id' }).subscribe((data) => {
      this.allUserDataSubject.next(data);
    });
  }

  /**
   * Loads all user data from Firestore and maps it to the userDataMap
   */
  loadAllUserDataToMap(): void {
    this.fetchUsersFromFirestore().subscribe((users: UserData[]) => {
      this.updateUserDataMap(users);
    });
  }

  /**
   * Fetches user data from Firestore and maps it to UserData objects.
   * @returns {Observable<UserData[]>} An observable emitting an array of UserData.
   */
  private fetchUsersFromFirestore(): Observable<UserData[]> {
    const userCollection = collection(this.firestore, 'users');
    return collectionData(userCollection, { idField: 'uid' }).pipe(
      map((docs: DocumentData[]) =>
        docs.map((doc) => this.mapDocumentToUserData(doc))
      )
    );
  }

  /**
   * Maps a Firestore document to a UserData object.
   * @param {DocumentData} doc - The Firestore document.
   * @returns {UserData} The mapped UserData object.
   */
  private mapDocumentToUserData(doc: DocumentData): UserData {
    return new UserData(
      {
        uid: doc['uid'],
        email: doc['email'],
        displayName: doc['displayName'],
        photoURL: doc['photoURL'],
      } as User,
      doc['displayName'],
      doc['channels']
    );
  }

  /**
   * Updates the internal user data map and notifies observers.
   * @param {UserData[]} users - An array of UserData objects.
   */
  private updateUserDataMap(users: UserData[]): void {
    users.forEach((user) => this.userDataMap.set(user.uid, user));
    this.userDataMapSubject.next(new Map(this.userDataMap));
  }

  /**
   * Loads user data by UID.
   * @param {string} uid - The UID of the user.
   */
  loadUserDataByUID(uid: string): void {
    const userDoc = doc(this.firestore, `users/${uid}`);
    docData(userDoc, { idField: 'id' }).subscribe((data) => {
      this.userDataSubject.next(data);
    });
  }

  /**
   * Listens to changes in user data and updates the userDataMap accordingly.
   */
  listenToUserDataChanges(): void {
    const userCollection = collection(this.firestore, 'users');
    onSnapshot(userCollection, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const userId = change.doc.id;
        const userData = change.doc.data() as UserData;
        if (change.type === 'added' || change.type === 'modified') {
          this.userDataMap.set(userId, userData);
        } else if (change.type === 'removed') {
          this.userDataMap.delete(userId);
        }
        this.userDataMapSubject.next(new Map(this.userDataMap));
      });
    });
  }

  /**
   * Returns the user data for a given user ID.
   * @param {string} userId - The ID of the user.
   * @returns {UserData | null} The user data or null if not found.
   */
  getUserDataById(
    userId: string
  ): { photoURL: string; displayName: string } | null {
    return this.userDataMapSubject.getValue().get(userId) || null;
  }

  /**
   * Returns the user data for a given user ID, or a default value if not found.
   * @param {string} userId - The ID of the user.
   * @returns {UserData} The user data or a default value if not found.
   */
  getUserDataOrFallback(userId: string): {
    photoURL: string;
    displayName: string;
  } {
    return (
      this.getUserDataById(userId) || {
        photoURL: 'src/assets/img/profile/placeholder-img.webp',
        displayName: 'Gast',
      }
    );
  }

  /**
   * Returns an observable that emits an array of user online statuses.
   * @returns {Observable<{ userId: string; online: boolean }[]>} An observable emitting an array of user online statuses.
   */
  getAllUsersOnlineStatus(): Observable<{ userId: string; online: boolean }[]> {
    return new Observable<{ userId: string; online: boolean }[]>((observer) => {
      const onlineUsersRef = ref(this.database, 'status');
      const handleSnapshot = (snapshot: DataSnapshot) => {
        const usersOnlineStatus = this.mapSnapshotToOnlineStatus(snapshot);
        observer.next(usersOnlineStatus);
      };
      const handleError = (error: any) => observer.error(error);
      onValue(onlineUsersRef, handleSnapshot, handleError);
    });
  }

  /**
   * Maps a Firebase snapshot to an array of user online statuses.
   * @param {DataSnapshot} snapshot - The snapshot from Firebase.
   * @returns {Array<{ userId: string; online: boolean }>} The mapped user statuses.
   */
  private mapSnapshotToOnlineStatus(snapshot: DataSnapshot): {
    userId: string;
    online: boolean;
  }[] {
    const usersOnlineStatus: { userId: string; online: boolean }[] = [];
    snapshot.forEach((childSnapshot) => {
      usersOnlineStatus.push({
        userId: childSnapshot.key as string,
        online: childSnapshot.val().online,
      });
    });
    return usersOnlineStatus;
  }

  /**
   * Returns an observable that emits the user data for a given user ID.
   * @param {string} userId - The ID of the user.
   * @returns {Observable<UserData>} An observable emitting the user data.
   */
  getUserDataByUID(userId: string): Observable<UserData> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    return docData(userDocRef).pipe(
      map((docSnapshot: any) => {
        if (!docSnapshot) {
          throw new Error(`Benutzer mit ID ${userId} nicht gefunden`);
        }
        return docSnapshot as UserData;
      }),
      catchError(() => {
        return of({} as UserData);
      })
    );
  }

  /**
   * Sets temporary registration data.
   */
  setTempRegistrationData(data: Partial<UserData>) {
    this.tempUserData = { ...this.tempUserData, ...data };
  }

  /**
   * Sets the temporary password.
   */
  setTempPassword(password: string) {
    this.tempPassword = password;
  }

  /**
   * Returns the temporary registration data.
   * @returns {Partial<UserData>}
   */
  getTempRegistrationData(): Partial<UserData> {
    return this.tempUserData;
  }

  /**
   * Returns the temporary password.
   * @returns {string}
   */
  getTempPassword(): string {
    return this.tempPassword;
  }

  /**
   * A function to save user data to Firestore.
   */
  async saveUserData(
    user: User,
    displayName?: string,
    photoURL?: string
  ): Promise<void> {
    const userRef = doc(this.firestore, `users/${user.uid}`);
    const userSnapshot = await getDoc(userRef);
    let existingData: Partial<UserData> = {};
    if (userSnapshot.exists()) {
      existingData = userSnapshot.data() as Partial<UserData>;
    }
    const userData = new UserData(user, displayName);
    userData.lastLogin = serverTimestamp();
    userData.photoURL = photoURL || userData.photoURL;
    userData.displayName = userData.formatDisplayName();
    userData.channels = existingData.channels || userData.channels;
    userData.privateChat = existingData.privateChat || userData.privateChat;
    return setDoc(userRef, { ...userData }, { merge: true });
  }

  /**
   * A function to save an avatar URL to Firestore.
   * @param {string} userId - The ID of the user.
   * @param {string} avatarUrl - The URL of the avatar image.
   */
  async saveAvatar(userId: string, avatarUrl: string): Promise<void> {
    if (!avatarUrl) return;
    try {
      await setDoc(
        doc(this.firestore, `users/${userId}`),
        { photoURL: avatarUrl },
        { merge: true }
      );
    } catch (error) {
      console.error('Fehler beim Speichern des Avatars:', error);
      throw error;
    }
  }

  /**
   * A function to set the online status of a user in the database.
   * @param {string} userId - The ID of the user.
   * @param {boolean} isOnline - The online status of the user.
   * @param {boolean} onReload - Whether to set the online status on reload.
   */
  async setOnlineStatus(
    userId: string,
    isOnline: boolean,
    onReload: boolean = false
  ): Promise<void> {
    const userStatusRef = ref(this.database, `status/${userId}`);
    if (onReload) isOnline = true;
    await set(userStatusRef, {
      online: isOnline,
      lastOnline: isOnline ? null : new Date().toISOString(),
    });
    if (isOnline) {
      onDisconnect(userStatusRef).set({
        online: false,
        lastOnline: new Date().toISOString(),
      });
    }
  }

  /**
   * Initializes the user ID based on the route parameters.
   */
  initializeUserId(): void {
    this.route.paramMap.subscribe((params) => {
      const uid = params.get('uid');
      if (uid) {
        this.userId = uid;
      } else {
        console.error('Keine UID in der URL gefunden.');
      }
    });
  }

  /**
   * Checks the online status of a user.
   * @param {string} userId - The ID of the user.
   * @returns {boolean} - True if the user is online, false otherwise.
   */
  checkUserOnlineStatus(userId: string): boolean {
    const userStatus = this.allUsersOnlineStatus$.find(
      (status) => status.userId === userId
    );
    return userStatus ? userStatus.online : false;
  }

  /**
   * Returns the email address of a user based on their UID.
   * @param {string} uid - The UID of the user.
   * @returns {string} - The email address of the user.
   */
  getUserEmail(uid: string): string {
    const user = this.allUserDataSubject
      .getValue()
      .find((user) => user.id === uid);
    return user ? user.email : '';
  }

  /**
   * Returns the photo URL of a user based on their UID.
   * @param {string} uid - The UID of the user.
   * @returns {string} - The photo URL of the user.
   */
  getPhotoURL(uid: string): string {
    const user = this.allUserDataSubject
      .getValue()
      .find((user) => user.id === uid);
    return user ? user.photoURL : '';
  }

  /**
   * Returns the display name of a user based on their UID.
   * @param {string} uid - The UID of the user.
   * @returns {string} - The display name of the user.
   */
  getDisplayName(uid: string): string {
    const user = this.allUserDataSubject
      .getValue()
      .find((user) => user.id === uid);
    return user ? user.displayName : '';
  }

  /**
   * Updates the display name of a user in Firestore.
   * @param {string} uid - The UID of the user.
   * @param {string} newName - The new display name for the user.
   */
  saveNewProfileName(uid: string, newName: string) {
    const updatedData: any = {};
    updatedData.displayName = newName;
    return setDoc(doc(this.firestore, `users/${uid}`), updatedData, {
      merge: true,
    });
  }

  /**
   * Opens the profile info dialog for a specific user.
   * @param {string} userId - The UID of the user.
   */
  openProfileInfo(userId: any): void {
    this.getUserDataByUID(userId).subscribe(
      (userData) => {
        const dialogRef = this.dialog.open(ProfileInfoDialogComponent, {
          data: {
            userId: userData.uid,
            userName: userData.displayName,
            userPhotoURL: userData.photoURL,
            email: userData.email,
          },
        });
      },
      (error) => {
        console.error('Fehler beim Abrufen der Benutzerdaten:', error);
      }
    );
  }

  /**
   * Adds a new channel to a user's channels in Firestore.
   * @param {string} userId - The UID of the user.
   * @param {string} channelId - The ID of the channel.
   */
  addNewChannelToUser(userId: string, channelId: string): void {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    updateDoc(userDocRef, { channels: arrayUnion(channelId) });
  }
}
