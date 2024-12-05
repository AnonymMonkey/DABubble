import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../shared/services/user-service/user.service';
import { AuthService } from '../../../shared/services/auth-service/auth.service';
import { NotificationService } from '../../../shared/services/notification-service/notification.service';
import { RoutingService } from '../../../shared/services/routing-service/routing.service';
import { UserData } from '../../../shared/models/user.model';
import { firstValueFrom } from 'rxjs';
import { ErrorService } from '../../../shared/services/error-service/error.service';
import { getStorage } from '@angular/fire/storage';
import { StorageService } from '../../../shared/services/storage-service/storage.service';

@Component({
  selector: 'app-select-avatar',
  standalone: true,
  imports: [RouterModule, MatCardModule, MatIconModule, CommonModule],
  templateUrl: './select-avatar.component.html',
  styleUrls: [
    './select-avatar.component.scss',
    './select-avatar.component_media.scss',
  ],
})
export class SelectAvatarComponent implements OnInit {
  storage = getStorage();
  selectedAvatar: string | null = null;
  displayName: string = '';
  email: string = '';
  password: string = '';
  isUploading = false;
  tempStoragePath: string | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private storageService: StorageService,
    private notificationService: NotificationService,
    private routingService: RoutingService,
    private errorService: ErrorService
  ) {}

  /**
   * Initialises the component
   */
  ngOnInit() {
    const tempData = this.userService.getTempRegistrationData();
    this.displayName = tempData.displayName
      ? this.formatDisplayName(tempData.displayName)
      : '';
    this.email = tempData.email || '';
    this.password = this.userService.getTempPassword();
  }

  /**
   * Formats the display name
   * @param name - The name
   * @returns - The formatted display name
   */
  formatDisplayName(name: string): string {
    const user = new UserData({} as any, name);
    return user.formatDisplayName();
  }

  /**
   * selects an avatar
   * @param avatar - The avatar
   */
  selectAvatar(avatar: string) {
    this.selectedAvatar = avatar;
  }

  /**
   * uploads an avatar
   * @param event - The event
   */
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!this.isImageFile(file)) {
        console.error('Nur Bilder können hochgeladen werden.');
        return;
      }

      this.isUploading = true;
      await this.uploadAvatar(file);
    }
  }

  /**
   * checks if the file is an image
   * @param file - The file
   * @returns - true if the file is an image
   */
  private isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  /**
   * uploads the avatar
   * @param file - The file
   */
  private async uploadAvatar(file: File): Promise<void> {
    try {
      const email = this.email;
      const path = `users/${email}/uploads/${file.name}`;
      this.selectedAvatar = await this.storageService.uploadFileRawPath(
        path,
        file
      );
    } catch (error) {
      console.error('Fehler beim Hochladen des Avatars:', error);
    } finally {
      this.isUploading = false;
    }
  }

  /**
   * completes the registration
   */
  async completeRegistration() {
    try {
      await this.registerUser();
      const currentUser = await this.getCurrentUser();

      if (this.shouldSaveAvatar(currentUser)) {
        await this.saveUserAvatar(currentUser.uid);
      }

      this.notificationService.showNotification('Konto erfolgreich erstellt!');
    } catch (error) {
      this.handleRegistrationError(error);
    }
  }

  /**
   * registers the user
   */
  private async registerUser(): Promise<void> {
    await this.authService.register(
      this.email,
      this.password,
      this.displayName
    );
  }

  /**
   * gets the current user
   * @returns - The current user
   */
  private async getCurrentUser(): Promise<any> {
    return firstValueFrom(this.authService.getCurrentUser());
  }

  /**
   * checks if the user should save the avatar
   * @param currentUser - The current user
   * @returns - boolean
   */
  private shouldSaveAvatar(currentUser: any): boolean {
    return this.selectedAvatar && currentUser?.uid;
  }

  /**
   * saves the avatar
   * @param uid - The UID
   */
  private async saveUserAvatar(uid: string): Promise<void> {
    if (this.selectedAvatar) {
      await this.userService.saveAvatar(uid, this.selectedAvatar);
    } else {
      console.warn('Kein Avatar ausgewählt. Avatar wird nicht gespeichert.');
    }
  }

  /**
   * handles the registration error
   * @param error - The error
   */
  private handleRegistrationError(error: any): void {
    this.errorService.logError(error);
    console.error('Fehler bei der Registrierung:', error);
  }

  /**
   * navigates to the login page
   */
  navigateToLogin() {
    this.routingService.navigateToLogin();
  }

  /**
   * navigates to the register page
   */
  navigateToRegister() {
    this.routingService.navigateToRegister();
  }

  /**
   * navigates to the imprint page
   */
  navigateToImprint() {
    this.routingService.navigateToImprint();
  }

  /**
   * navigates to the privacy policy page
   */
  navigateToPrivacyPolicy() {
    this.routingService.navigateToPrivacyPolicy();
  }
}
