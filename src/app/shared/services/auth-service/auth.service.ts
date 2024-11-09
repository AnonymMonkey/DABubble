import { Injectable, OnInit } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  confirmPasswordReset,
  fetchSignInMethodsForEmail,
  User,
  updateEmail,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { authState } from 'rxfire/auth';
import { inject } from '@angular/core';
import { UserService } from '../user-service/user.service';
import { ErrorService } from '../error-service/error.service';
import { RoutingService } from '../routing-service/routing.service';
import { UserData } from '../../models/user.model';
import { NotificationService } from '../notification-service/notification.service';
import { Firestore } from '@angular/fire/firestore';
import { collection, getDocs } from 'firebase/firestore';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  verifyBeforeUpdateEmail,
} from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private firestore: Firestore,
    private auth: Auth = inject(Auth),
    private userService: UserService,
    private errorService: ErrorService,
    private routingService: RoutingService,
    private notificationService: NotificationService
  ) {}

  async checkEmailExistsInFirestore(email: string): Promise<boolean> {
    const usersCollection = collection(this.firestore, 'users');
    const querySnapshot = await getDocs(usersCollection);

    // Durchlaufe alle Dokumente und prüfe, ob die E-Mail existiert
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      if (data['email'] === email) {
        return true; // E-Mail gefunden
      }
    }
    return false; // E-Mail nicht gefunden
  }

  // Anmeldung als Gastnutzer
  // Benutzer wird anonym in Firebase authentifiziert
  // Online-Status wird auf true gesetzt und der Nutzer zur Hauptseite geleitet
  async guestLogin(): Promise<void> {
    try {
      const userCredential = await signInAnonymously(this.auth);
      await this.userService.setOnlineStatus(userCredential.user.uid, true); // Setzt den Online-Status auf online
      this.routingService.navigateToMain(userCredential.user.uid); // Navigiert zur Hauptseite
    } catch (error) {
      this.handleError(error);
    }
  }

  // Anmeldung mit E-Mail und Passwort
  // Authentifiziert den Benutzer, speichert die Daten in der Firestore und setzt den Online-Status
  async login(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      //NOTE - Beim login brauchen wir keinen neuen User erstellen, die alten daten werden dan überschrieben

      // const formattedDisplayName = new UserData(
      //   userCredential.user
      // ).formatDisplayName();

      // await this.userService.saveUserData(
      //   userCredential.user,
      //   formattedDisplayName
      // );
      await this.userService.setOnlineStatus(userCredential.user.uid, true); // Setzt den Online-Status auf online
      this.routingService.navigateToMain(userCredential.user.uid); // Navigiert zur Hauptseite
    } catch (error: any) {
      this.handleError(error);
    }
  }

  // Anmeldung über Google-Login
  // Authentifiziert den Benutzer über Google, speichert dessen Profilbild und setzt den Online-Status
  async googleLogin(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(this.auth, provider);

      const googleProfilePhotoURL =
        userCredential.user.photoURL || 'assets/img/profile/placeholder.webp'; // Google-Profilbild oder Platzhalter verwenden

      await this.userService.saveUserData(
        userCredential.user,
        googleProfilePhotoURL
      );
      await this.userService.setOnlineStatus(userCredential.user.uid, true); // Setzt den Online-Status auf online
      this.routingService.navigateToMain(userCredential.user.uid); // Navigiert zur Hauptseite
    } catch (error) {
      this.handleError(error);
    }
  }

  // Passwort-Zurücksetzen E-Mail senden
  // Sendet eine E-Mail mit einem Link zum Zurücksetzen des Passworts
  async sendPasswordResetEmail(email: string): Promise<void> {
    const actionCodeSettings = {
      url: 'http://localhost:4200/new-password', // Link zur Seite zum Zurücksetzen des Passworts
      handleCodeInApp: true,
    };

    try {
      await firebaseSendPasswordResetEmail(
        this.auth,
        email,
        actionCodeSettings
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  // Bestätigen des Zurücksetzens des Passworts
  // Nimmt den oobCode aus der E-Mail und setzt das neue Passwort
  async confirmPasswordReset(
    oobCode: string,
    newPassword: string
  ): Promise<void> {
    try {
      await confirmPasswordReset(this.auth, oobCode, newPassword);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Registrierung mit E-Mail und Passwort
  // Registriert einen neuen Benutzer, speichert dessen Daten und leitet ihn zur Hauptseite weiter
  async register(
    email: string,
    password: string,
    displayName: string
  ): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const formattedDisplayName = new UserData(
        userCredential.user,
        displayName
      ).formatDisplayName();

      // Speichert die Benutzerdaten in Firestore
      await this.userService.saveUserData(
        userCredential.user,
        formattedDisplayName
      );
      this.notificationService.showNotification('Konto erfolgreich erstellt!'); // Zeigt eine Erfolgsbenachrichtigung an
      this.routingService.navigateToMain(userCredential.user.uid); // Navigiert zur Hauptseite
    } catch (error) {
      this.handleError(error);
    }
  }

  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const signInMethods = await fetchSignInMethodsForEmail(this.auth, email);
      return signInMethods.length > 0; // Gibt true zurück, wenn die E-Mail existiert
    } catch (error) {
      this.handleError(error);
      console.error('Fehler bei fetchSignInMethodsForEmail:', error);
      throw error;
    }
  }

  // Benutzer abmelden
  // Setzt den Online-Status auf offline und meldet den Benutzer ab
  async logout(): Promise<void> {
    try {
      const currentUser = this.auth.currentUser;

      if (currentUser) {
        try {
          await this.userService.setOnlineStatus(currentUser.uid, false); // Setzt den Online-Status auf offline
        } catch (statusError) {
          console.error('Fehler beim Setzen des Online-Status:', statusError);
        }
      }

      await this.auth.signOut(); // Meldet den Benutzer ab
      this.routingService.navigateToLogin(); // Navigiert zur Login-Seite
    } catch (error) {
      this.handleError(error);
    }
  }

  // Aktuellen authentifizierten Benutzer abrufen
  // Gibt ein Observable des aktuellen Authentifizierungszustands zurück
  getCurrentUser(): Observable<User | null> {
    return authState(this.auth); // Observable für den Authentifizierungsstatus
  }

  // Fehlerbehandlung
  // Leitet Fehler an den ErrorService weiter und gibt sie an den Aufrufer zurück
  private handleError(error: any) {
    this.errorService.logError(error); // Loggt den Fehler
    throw error; // Gibt den Fehler an den Aufrufer zurück
  }

  formatDisplayName(name: string): string {
    const user = new UserData({} as any, name); // Erstelle ein UserData-Objekt mit dem Namen
    return user.formatDisplayName(); // Rufe die Formatierungsfunktion auf
  }

  async changeEmail(newEmail: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      console.error('Kein Benutzer eingeloggt.');
      return;
    }
    try {
      await verifyBeforeUpdateEmail(user, newEmail);
      console.log(
        'Eine Bestätigungs-E-Mail wurde an die neue E-Mail-Adresse gesendet.'
      );
    } catch (error) {
      console.error('Fehler beim Ändern der E-Mail:', error);
    }
  }
}
