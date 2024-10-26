import { inject, Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { User } from 'firebase/auth';
import { UserData } from '../../models/user.model';
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { get, getDatabase, onDisconnect, ref, set } from 'firebase/database';
import { AuthService } from '../auth-service/auth.service'; //NOTE - Muss auskommentiert werden
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore: Firestore = inject(Firestore); // Firestore für das Speichern der Benutzerdaten
  private database = getDatabase(); // Realtime Database für den Online-Status
  private tempUserData: Partial<UserData> = {}; // Temporäre Speicherung der Registrierungsdaten
  private tempPassword: string = ''; // Temporäre Speicherung des Passworts
  public userId: string = '34gzWvEfogZ6Xn05ydewTpkOKF83'; // ID des aktuell angemeldeten Nutzers

  //NOTE - Der Constructor musste auch auskommentiert werden, da er nicht benutzt wird
  // constructor(private authService: AuthService) {}

  // Ruft alle online Nutzer aus der Realtime Database ab
  // Gibt die Daten der Nutzer zurück, die aktuell als online markiert sind
  async getOnlineUsers(): Promise<any[]> {
    const onlineUsersRef = ref(this.database, 'onlineUsers');
    const snapshot = await get(onlineUsersRef);
    if (snapshot.exists()) {
      return Object.values(snapshot.val()); // Rückgabe der Liste der Online-Nutzer
    }
    throw new Error('Keine aktiven Nutzer gefunden');
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
  async setOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    const userStatusRef = ref(this.database, `status/${userId}`);

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
}
