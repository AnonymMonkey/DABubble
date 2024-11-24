import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  docData,
} from '@angular/fire/firestore';
import { User } from 'firebase/auth';
import { UserData } from '../../models/user.model';
import {
  arrayUnion,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  get,
  getDatabase,
  off,
  onDisconnect,
  onValue,
  ref,
  set,
} from 'firebase/database';
import { AuthService } from '../auth-service/auth.service'; //NOTE - Muss auskommentiert werden
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ProfileInfoDialogComponent } from '../../profile-info-dialog/profile-info-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { RoutingService } from '../routing-service/routing.service';
import { DocumentData } from 'rxfire/firestore/interfaces';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore: Firestore = inject(Firestore); // Firestore für das Speichern der Benutzerdaten
  private database = getDatabase(); // Realtime Database für den Online-Status
  private tempUserData: Partial<UserData> = {}; // Temporäre Speicherung der Registrierungsdaten
  private tempPassword: string = ''; // Temporäre Speicherung des Passworts
  public userId!: string; // ID des aktuell angemeldeten Nutzers
  private dialog = inject(MatDialog);

  //REVIEW - Hier versuche ich die Daten zentral in diesem service zu speichern,
  // sodass jede Komponente darauf zugreifen kann.

  private allUserDataSubject = new BehaviorSubject<any[]>([]);
  allUserData$ = this.allUserDataSubject.asObservable();
  private userDataSubject = new BehaviorSubject<any>(null); // Zum Speichern der Benutzerdaten
  userData$ = this.userDataSubject.asObservable(); // Observable für andere Komponenten
  public route: ActivatedRoute = inject(ActivatedRoute);

  private userDataMap = new Map<string, UserData>(); // Zentrale Map für Benutzerdaten
  private userDataMapSubject = new BehaviorSubject<Map<string, UserData>>(
    this.userDataMap
  ); // Observable für Updates

  get userDataMap$() {
    return this.userDataMapSubject.asObservable();
  }

  allUsersOnlineStatus$: { userId: string; online: boolean }[] = [];

  constructor(private routingService: RoutingService) {
    this.loadAllUserData();
    this.loadAllUserDataToMap();
    this.listenToUserDataChanges();
  }

  loadAllUserData(): void {
    const userCollection = collection(this.firestore, 'users'); // Referenz zur Collection 'users'
    collectionData(userCollection, { idField: 'id' }).subscribe((data) => {
      this.allUserDataSubject.next(data); // Daten in das BehaviorSubject laden
    });
  }

  loadAllUserDataToMap(): void {
    const userCollection = collection(this.firestore, 'users');

    collectionData(userCollection, { idField: 'uid' })
      .pipe(
        map((docs: DocumentData[]) =>
          docs.map(
            (doc) =>
              new UserData(
                {
                  uid: doc['uid'],
                  email: doc['email'],
                  displayName: doc['displayName'],
                  photoURL: doc['photoURL'],
                  // channels: doc['channels'],
                } as User,
                doc['displayName'],
                doc['channels']
              )
          )
        )
      )
      .subscribe((data: UserData[]) => {
        data.forEach((user) => this.userDataMap.set(user.uid, user));
        this.userDataMapSubject.next(new Map(this.userDataMap));
      });
  }

  loadUserDataByUID(uid: string): void {
    const userDoc = doc(this.firestore, `users/${uid}`); // Referenz auf das spezifische Dokument
    docData(userDoc, { idField: 'id' }).subscribe((data) => {
      this.userDataSubject.next(data); // Setzt die Benutzerdaten
    });
  }

  listenToUserDataChanges(): void {
    const userCollection = collection(this.firestore, 'users'); // Referenz zur 'users'-Collection

    onSnapshot(userCollection, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const userId = change.doc.id; // Die ID des betroffenen Benutzers
        const userData = change.doc.data() as UserData; // Die aktualisierten Daten

        if (change.type === 'added' || change.type === 'modified') {
          // Nutzer hinzufügen oder aktualisieren
          this.userDataMap.set(userId, userData);
        } else if (change.type === 'removed') {
          // Nutzer aus der Map entfernen
          this.userDataMap.delete(userId);
        }

        // Die Map nur dann aktualisieren, wenn es Änderungen gibt
        this.userDataMapSubject.next(new Map(this.userDataMap));
      });
    });
  }

  getUserDataById(
    userId: string
  ): { photoURL: string; displayName: string } | null {
    return this.userDataMapSubject.getValue().get(userId) || null;
  }

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

  getAllUsersOnlineStatus(): Observable<{ userId: string; online: boolean }[]> {
    const onlineUsersRef = ref(this.database, 'status');
    return new Observable<{ userId: string; online: boolean }[]>((observer) => {
      onValue(
        onlineUsersRef,
        (snapshot) => {
          const usersOnlineStatus: { userId: string; online: boolean }[] = [];
          snapshot.forEach((childSnapshot) => {
            usersOnlineStatus.push({
              userId: childSnapshot.key as string,
              online: childSnapshot.val().online,
            });
          });
          observer.next(usersOnlineStatus); // Aktueller Status für alle Nutzer zurückgeben
        },
        (error) => {
          observer.error(error); // Fehlerbehandlung
        }
      );
    });
  }

  //NOTE - Hier habe ich die vorherige Funktion in eine Observable umgeformt
  getUserDataByUID(userId: string): Observable<UserData> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    return docData(userDocRef).pipe(
      map((docSnapshot: any) => {
        if (!docSnapshot) {
          throw new Error(`Benutzer mit ID ${userId} nicht gefunden`); // Fehler werfen, wenn der Benutzer nicht existiert
        }
        return docSnapshot as UserData;
      }),
      catchError((error) => {
        console.error('Fehler beim Abrufen der Benutzerdaten:', error);
        return of({} as UserData); // Rückgabe eines leeren Objekts als Standardwert
      })
    );
  }

  // Temporäre Registrierungsdaten speichern
  // Diese Funktion wird verwendet, um während des Registrierungsprozesses Daten temporär zu speichern
  setTempRegistrationData(data: Partial<UserData>) {
    this.tempUserData = { ...this.tempUserData, ...data };
  }

  // Temporäres Passwort speichern
  // Das Passwort wird separat gespeichert, da es nicht in Firestore abgelegt wird
  setTempPassword(password: string) {
    this.tempPassword = password;
  }

  // Temporäre Registrierungsdaten abrufen
  getTempRegistrationData(): Partial<UserData> {
    return this.tempUserData;
  }

  // Temporäres Passwort abrufen
  getTempPassword(): string {
    return this.tempPassword;
  }

  // Speichert oder aktualisiert die Benutzerdaten in Firestore
  // Beinhaltet optional das Profilbild (photoURL)
  async saveUserData(
    user: User,
    displayName?: string,
    photoURL?: string
  ): Promise<void> {
    const userRef = doc(this.firestore, `users/${user.uid}`);
    const userSnapshot = await getDoc(userRef);

    // Typisiere `existingData` als teilweise `UserData`
    let existingData: Partial<UserData> = {};
    if (userSnapshot.exists()) {
      existingData = userSnapshot.data() as Partial<UserData>;
    }

    const userData = new UserData(user, displayName);
    userData.lastLogin = serverTimestamp();
    userData.photoURL = photoURL || userData.photoURL;
    userData.displayName = userData.formatDisplayName();

    // Überprüfe, ob Channels und privateChats bereits existieren und übernehme sie, falls vorhanden
    userData.channels = existingData.channels || userData.channels;
    userData.privateChat = existingData.privateChat || userData.privateChat;

    return setDoc(userRef, { ...userData }, { merge: true });
  }

  // Speichert den Avatar (Profilbild) eines Benutzers in Firestore
  async saveAvatar(userId: string, avatarUrl: string): Promise<void> {
    if (!avatarUrl) {
      console.error('Kein Avatar-URL bereitgestellt!');
      return;
    }

    try {
      await setDoc(
        doc(this.firestore, `users/${userId}`),
        { photoURL: avatarUrl },
        { merge: true } // Verhindert, dass andere Daten überschrieben werden
      );
      console.log('Avatar-URL erfolgreich gespeichert:', avatarUrl);
    } catch (error) {
      console.error('Fehler beim Speichern des Avatars:', error);
      throw error;
    }
  }

  // Setzt den Online-Status des Benutzers in der Realtime Database
  async setOnlineStatus(
    userId: string,
    isOnline: boolean,
    onReload: boolean = false
  ): Promise<void> {
    const userStatusRef = ref(this.database, `status/${userId}`);

    // Wenn die Methode aufgrund eines Reloads aufgerufen wird, setzen wir den Online-Status auf true
    if (onReload) {
      isOnline = true;
    }

    // Setzt den Online-Status und den Zeitpunkt der letzten Online-Aktivität
    await set(userStatusRef, {
      online: isOnline,
      lastOnline: isOnline ? null : new Date().toISOString(),
    });

    // Falls die Verbindung unterbrochen wird, wird der Nutzer als offline markiert
    if (isOnline) {
      onDisconnect(userStatusRef).set({
        online: false,
        lastOnline: new Date().toISOString(),
      });
    }
  }

  //NOTE - Hier wird die UID des aktuell angemeldeten Nutzers in der variable userId gespeichert.
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

  checkUserOnlineStatus(userId: string): boolean {
    const userStatus = this.allUsersOnlineStatus$.find(
      (status) => status.userId === userId
    );
    return userStatus ? userStatus.online : false;
  }

  getUserEmail(uid: string): string {
    const user = this.allUserDataSubject
      .getValue()
      .find((user) => user.id === uid);
    return user ? user.email : '';
  }

  getPhotoURL(uid: string): string {
    const user = this.allUserDataSubject
      .getValue()
      .find((user) => user.id === uid);
    return user ? user.photoURL : '';
  }

  getDisplayName(uid: string): string {
    const user = this.allUserDataSubject
      .getValue()
      .find((user) => user.id === uid);
    return user ? user.displayName : '';
  }

  saveNewProfileName(uid: string, newName: string) {
    const updatedData: any = {};
    updatedData.displayName = newName;
    return setDoc(
      doc(this.firestore, `users/${uid}`),
      updatedData,
      { merge: true } // Verhindert, dass andere Daten überschrieben werden
    );
  }

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

  addNewChannelToUser(userId: string, channelId: string): void {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    updateDoc(userDocRef, { channels: arrayUnion(channelId) }); // Hinzufügen des Kanales zum Benutzer
  }
}
