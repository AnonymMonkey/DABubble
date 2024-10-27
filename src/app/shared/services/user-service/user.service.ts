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
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import {
  get,
  getDatabase,
  onDisconnect,
  onValue,
  ref,
  set,
} from 'firebase/database';
import { AuthService } from '../auth-service/auth.service'; //NOTE - Muss auskommentiert werden
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore: Firestore = inject(Firestore); // Firestore für das Speichern der Benutzerdaten
  private database = getDatabase(); // Realtime Database für den Online-Status
  private tempUserData: Partial<UserData> = {}; // Temporäre Speicherung der Registrierungsdaten
  private tempPassword: string = ''; // Temporäre Speicherung des Passworts
  public userId: string = ''; // ID des aktuell angemeldeten Nutzers

  //REVIEW - Hier versuche ich die Daten zentral in diesem service zu speichern,
  // sodass jede Komponente darauf zugreifen kann.

  private allUserDataSubject = new BehaviorSubject<any[]>([]);
  allUserData$ = this.allUserDataSubject.asObservable();
  private userDataSubject = new BehaviorSubject<any>(null); // Zum Speichern der Benutzerdaten
  userData$ = this.userDataSubject.asObservable(); // Observable für andere Komponenten
  public route: ActivatedRoute = inject(ActivatedRoute);

  //NOTE - Hier wird die UID des aktuell angemeldeten Nutzers in der variable userId gespeichert.
  ngOnInit(): void {
    this.initializeUserId();
  }

  allUsersOnlineStatus$: { userId: string; online: boolean }[] = [];

  loadAllUserData(): void {
    const userCollection = collection(this.firestore, 'users'); // Referenz zur Collection 'users'
    collectionData(userCollection, { idField: 'id' }).subscribe((data) => {
      this.allUserDataSubject.next(data); // Daten in das BehaviorSubject laden
    });
  }

  loadUserDataByUID(uid: string): void {
    const userDoc = doc(this.firestore, `users/${uid}`); // Referenz auf das spezifische Dokument
    docData(userDoc, { idField: 'id' }).subscribe((data) => {
      this.userDataSubject.next(data); // Setzt die Benutzerdaten
    });
  }

  //REVIEW - Ende

  //NOTE - Der Constructor musste auch auskommentiert werden, da er nicht benutzt wird
  // constructor(private authService: AuthService) {}

  //NOTE - Hier musste ich auskommentieren, da ein Promise die Daten nur einmalig zurückgegeben wird
  // Ruft alle online Nutzer aus der Realtime Database ab
  // Gibt die Daten der Nutzer zurück, die aktuell als online markiert sind
  // async getOnlineUsers(): Promise<any[]> {
  //   const onlineUsersRef = ref(this.database, 'onlineUsers');
  //   const snapshot = await get(onlineUsersRef);
  //   if (snapshot.exists()) {
  //     return Object.values(snapshot.val()); // Rückgabe der Liste der Online-Nutzer
  //   }
  //   throw new Error('Keine aktiven Nutzer gefunden');
  // }

  // getOnlineUsers(): Observable<any[]> {
  //   const onlineUsersRef = ref(this.database, 'status');
  //   return new Observable<any[]>((observer) => {
  //     onValue(onlineUsersRef, (snapshot) => {
  //       if (snapshot.exists()) {
  //         observer.next(Object.values(snapshot.val())); // Rückgabe der Liste der Online-Nutzer
  //       } else {
  //         observer.error('Keine aktiven Nutzer gefunden');
  //       }
  //     });
  //   });
  // }

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

  //NOTE - Musste ich auskommentieren, da ein Promise die Daten nur einmalig lädt
  // Ruft die Daten eines Nutzers anhand seiner UID aus Firestore ab
  // async getUserDataByUID(uid: string): Promise<any> {
  //   const userDocRef = doc(this.firestore, `users/${uid}`);
  //   const userDoc = await getDoc(userDocRef);
  //   if (userDoc.exists()) {
  //     return userDoc.data(); // Rückgabe der Daten des angeforderten Nutzers
  //   }
  //   throw new Error('Nutzer nicht gefunden');
  // }

  //NOTE - Hier habe ich die vorherige Funktion in eine Observable umgeformt
  getUserDataByUID(uid: string): Observable<any> {
    return new Observable((observer) => {
      const userDocRef = doc(this.firestore, `users/${uid}`);

      // Listener für Echtzeit-Aktualisierungen
      const unsubscribe = onSnapshot(
        userDocRef,
        (userDoc) => {
          if (userDoc.exists()) {
            observer.next(userDoc.data()); // Gibt die Daten des Nutzers in Echtzeit zurück
          } else {
            observer.error('Nutzer nicht gefunden');
          }
        },
        (error) => {
          observer.error(error);
        }
      );

      // Bereinigen des Listeners, wenn das Observable abgeschlossen ist
      return () => unsubscribe();
    });
  }

  //NOTE - Problem tritt auf, da sich auth.service und user.service überschneiden
  // Ruft die Daten des aktuell authentifizierten Nutzers ab
  // Benötigt den AuthService, um den aktuellen Benutzer zu ermitteln

  // async getCurrentUserData(): Promise<any> {
  //   const currentUser = await this.authService.getCurrentUser().toPromise();
  //   if (currentUser?.uid) {
  //     const userDocRef = doc(this.firestore, `users/${currentUser.uid}`);
  //     const userDoc = await getDoc(userDocRef);
  //     if (userDoc.exists()) {
  //       return userDoc.data(); // Rückgabe der Daten des aktuellen Benutzers
  //     }
  //   }
  //   throw new Error('Nutzer nicht gefunden oder nicht angemeldet');
  // }

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
    const userData = new UserData(user, displayName);
    userData.lastLogin = serverTimestamp(); // Aktualisiert den letzten Login-Zeitpunkt

    // Verwendet das übergebene Profilbild, falls verfügbar
    userData.photoURL = photoURL || userData.photoURL; // Bevorzugt das Google-Profilbild, falls vorhanden

    // Formatiert den Benutzernamen vor dem Speichern
    userData.displayName = userData.formatDisplayName();

    return setDoc(
      doc(this.firestore, `users/${user.uid}`),
      { ...userData },
      { merge: true } // Zusammenführen mit bestehenden Daten, um nichts zu überschreiben
    );
  }

  // Speichert den Avatar (Profilbild) eines Benutzers in Firestore
  async saveAvatar(userId: string, avatarUrl: string): Promise<void> {
    if (!avatarUrl) {
      console.error('Kein Avatar-URL bereitgestellt!');
      return;
    }
    return setDoc(
      doc(this.firestore, `users/${userId}`),
      { photoURL: avatarUrl }, // Speichert das ausgewählte Profilbild
      { merge: true } // Verhindert, dass andere Daten überschrieben werden
    );
  }

  // Setzt den Online-Status des Benutzers in der Realtime Database
  async setOnlineStatus(userId: string, isOnline: boolean, onReload: boolean = false): Promise<void> {
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
}
