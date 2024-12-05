import { Injectable } from '@angular/core';
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
} from '@angular/fire/auth';
import { Observable, Subscription } from 'rxjs';
import { authState } from 'rxfire/auth';
import { inject } from '@angular/core';
import { UserService } from '../user-service/user.service';
import { ErrorService } from '../error-service/error.service';
import { RoutingService } from '../routing-service/routing.service';
import { UserData } from '../../models/user.model';
import { NotificationService } from '../notification-service/notification.service';
import { Firestore } from '@angular/fire/firestore';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  verifyBeforeUpdateEmail,
} from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authSubscription: Subscription | undefined;
  private database = getDatabase();
  constructor(
    private firestore: Firestore,
    private auth: Auth = inject(Auth),
    private userService: UserService,
    private errorService: ErrorService,
    private routingService: RoutingService,
    private notificationService: NotificationService
  ) {
    this.observeAuthChanges();

    window.addEventListener('beforeunload', this.handlePageUnload.bind(this));
  }

  /**
   * Unsubscribes from auth changes
   */
  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }

    window.removeEventListener(
      'beforeunload',
      this.handlePageUnload.bind(this)
    );
  }

  /**
   * Handles the page unload event
   */
  private async handlePageUnload(): Promise<void> {
    try {
      const currentUser = this.auth.currentUser;
      if (currentUser) await this.checkAndLogoutGuest(currentUser.uid);
    } catch (error) {
      console.error('Fehler beim HandlePageUnload:', error);
    }
  }

  /**
   * Checks if the user is a guest and logs them out if they are
   * @param userId - The ID of the user
   */
  private async checkAndLogoutGuest(userId: string): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    const userSnapshot = await getDoc(userDocRef);

    if (
      userSnapshot.exists() &&
      (userSnapshot.data() as UserData).displayName === 'Guest'
    ) {
      await this.guestLogout(userId);
    }
  }

  /**
   * Observes auth changes and updates the user profile if needed
   */
  private observeAuthChanges() {
    onAuthStateChanged(this.auth, async (user: User | null) => {
      if (!user) return;

      const userRef = doc(this.firestore, `users/${user.uid}`);
      const updatedData = { email: user.email };

      try {
        await setDoc(userRef, updatedData, { merge: true });
      } catch (error) {
        console.error('Fehler beim Aktualisieren des Benutzerprofils:', error);
      }
    });
  }

  /**
   * Checks if the email exists in Firestore
   * @param email - The email address
   * @returns Promise<boolean>
   */
  async checkEmailExistsInFirestore(email: string): Promise<boolean> {
    const usersCollection = collection(this.firestore, 'users');
    const querySnapshot = await getDocs(usersCollection);

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      if (data['email'] === email) {
        return true;
      }
    }
    return false;
  }

  /**
   * Handles the guest login
   */
  async guestLogin(): Promise<void> {
    try {
      const userCredential = await signInAnonymously(this.auth);
      await this.userService.setOnlineStatus(userCredential.user.uid, true);

      const guestUserData = new UserData(
        userCredential.user,
        'Guest'
      ).formatDisplayName();

      await this.userService.saveUserData(userCredential.user, guestUserData);

      this.routingService.navigateToMain(userCredential.user.uid);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Handles the user login
   */
  async login(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      await this.userService.setOnlineStatus(userCredential.user.uid, true);
      this.routingService.navigateToMain(userCredential.user.uid);
    } catch (error: any) {
      this.handleError(error);
    }
  }

  /**
   * Handles the google login
   */
  async googleLogin(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(this.auth, provider);

      const photoURL =
        userCredential.user.photoURL || 'assets/img/profile/placeholder.webp';

      await this.userService.saveUserData(userCredential.user, photoURL);
      await this.userService.setOnlineStatus(userCredential.user.uid, true);
      this.routingService.navigateToMain(userCredential.user.uid);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Handles the password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    const actionCodeSettings = {
      url: 'http://localhost:4200/',
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

  /**
   * Handles the password reset
   */
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

  /**
   * Handles the user registration
   */
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
      await this.userService.saveUserData(
        userCredential.user,
        new UserData(userCredential.user, displayName).formatDisplayName()
      );
      this.notificationService.showNotification('Konto erfolgreich erstellt!');
      this.routingService.navigateToMain(userCredential.user.uid);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Checks if the email exists
   * @param email - The email address
   * @returns - Promise<boolean>
   */
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const signInMethods = await fetchSignInMethodsForEmail(this.auth, email);
      return signInMethods.length > 0;
    } catch (error) {
      this.handleError(error);
      console.error('Fehler bei fetchSignInMethodsForEmail:', error);
      throw error;
    }
  }

  /**
   *  Handles the user logout
   * @returns - Promise<void>
   */
  async logout(): Promise<void> {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser) return;

      await this.handleUserLogout(currentUser);
      await this.auth.signOut();
      this.routingService.navigateToLogin();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Handles the user logout
   */
  private async handleUserLogout(currentUser: User): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${currentUser.uid}`);
    const userSnapshot = await getDoc(userDocRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data() as UserData;

      if (userData.displayName === 'Guest') {
        await this.guestLogout(currentUser.uid);
      } else {
        await this.userService.setOnlineStatus(currentUser.uid, false);
      }
    }
  }

  /**
   * Handles the guest logout
   */
  async guestLogout(userId: string): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, `users/${userId}`);
      const userSnapshot = await getDoc(userDocRef);

      if (!userSnapshot.exists()) {
        console.warn('Gastnutzer nicht gefunden.');
        return;
      }

      await this.deleteGuestData(userId);
    } catch (error) {
      console.error('Fehler beim Löschen des Gastnutzers:', error);
    }
  }

  /**
   * Deletes the guest data
   */
  private async deleteGuestData(userId: string): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, `users/${userId}`);
      await deleteDoc(userDocRef);

      const userStatusRef = ref(this.database, `status/${userId}`);
      await set(userStatusRef, null);
    } catch (error) {
      console.error('Fehler beim Löschen der Daten des Gastnutzers:', error);
      throw error;
    }
  }

  /**
   * Gets the current user
   */
  getCurrentUser(): Observable<User | null> {
    return authState(this.auth);
  }

  /**
   * Handles the error
   */
  private handleError(error: any) {
    this.errorService.logError(error);
    throw error;
  }

  /**
   * Formats the display name
   */
  formatDisplayName(name: string): string {
    const user = new UserData({} as any, name);
    return user.formatDisplayName();
  }

  /**
   *  Handles the email change
   * @param newEmail - The new email address.
   * @param password - The user's password.
   */
  async changeEmail(newEmail: string, password: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Kein Benutzer eingeloggt.');
    }

    try {
      const credential = this.getUserCredential(user.email as string, password);
      await reauthenticateWithCredential(user, credential);
      await verifyBeforeUpdateEmail(user, newEmail);
    } catch (error) {
      this.handleEmailChangeError(error);
    }
  }

  /**
   * Gets the user credential
   */
  private getUserCredential(
    email: string,
    password: string
  ): ReturnType<typeof EmailAuthProvider.credential> {
    return EmailAuthProvider.credential(email, password);
  }

  /**
   * Handles the email change error
   */
  private handleEmailChangeError(error: any): void {
    switch (error.code) {
      case 'auth/invalid-credential':
        throw new Error('Falsches Passwort');
      case 'auth/user-mismatch':
        throw new Error('Der Benutzer stimmt nicht überein.');
      case 'auth/requires-recent-login':
        throw new Error(
          'Bitte melden Sie sich erneut an, um Ihre E-Mail zu ändern.'
        );
      default:
        throw new Error('Fehler beim Ändern der E-Mail: ' + error.message);
    }
  }

  /**
   * Checks if the user is a Google user
   */
  checkIfGoogleUser() {
    const currentUser: User | null = this.auth.currentUser;

    if (currentUser) {
      const isGoogleAccount = currentUser.providerData.some(
        (provider) => provider.providerId === 'google.com'
      );

      if (isGoogleAccount) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
