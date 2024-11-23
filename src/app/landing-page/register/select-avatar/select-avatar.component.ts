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
  styleUrls: ['./select-avatar.component.scss'],
})
export class SelectAvatarComponent implements OnInit {
  storage = getStorage();
  selectedAvatar: string | null = null; // Initial kein Avatar ausgewählt
  displayName: string = ''; // Leerer String für Benutzername
  email: string = ''; // E-Mail für Registrierung
  password: string = ''; // Passwort für Registrierung
  isUploading = false; // Status des Uploads
  tempStoragePath: string | null = null; // Temporärer Speicherpfad

  constructor(
    private userService: UserService,
    private authService: AuthService, // AuthService für Registrierung
    private storageService: StorageService,
    private notificationService: NotificationService,
    private routingService: RoutingService,
    private errorService: ErrorService
  ) {}

  ngOnInit() {
    const tempData = this.userService.getTempRegistrationData();
    this.displayName = tempData.displayName
      ? this.formatDisplayName(tempData.displayName)
      : ''; // Name formatieren
    this.email = tempData.email || '';
    this.password = this.userService.getTempPassword(); // Passwort getrennt abrufen
  }

  // Funktion zur Formatierung des Namens mithilfe der Methode aus UserData
  formatDisplayName(name: string): string {
    const user = new UserData({} as any, name); // Erstelle ein UserData-Objekt mit dem Namen
    return user.formatDisplayName(); // Rufe die Formatierungsfunktion auf
  }

  // Methode zum Auswählen eines Avatars
  selectAvatar(avatar: string) {
    this.selectedAvatar = avatar;
  }

  // Datei auswählen und temporär hochladen
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        console.error('Nur Bilder können hochgeladen werden.');
        return;
      }

      this.isUploading = true;

      try {
        // Nutze die E-Mail direkt im Pfad
        const email = this.email; // Ohne Änderungen
        const path = `users/${email}/uploads/${file.name}`;

        // Datei hochladen
        this.selectedAvatar = await this.storageService.uploadFileRawPath(
          path,
          file
        );
        console.log('Avatar hochgeladen:', this.selectedAvatar);
      } catch (error) {
        console.error('Fehler beim Hochladen des Avatars:', error);
      } finally {
        this.isUploading = false;
      }
    }
  }

  /*   async uploadAvatar(file: File): Promise<string> {
    try {
      const email = this.userService.getTempRegistrationData().email;
      const path = `temp/${email}/uploads/${file.name}`;
      const downloadUrl = await this.storageService.uploadFile(path, file);

      console.log('Avatar hochgeladen:', downloadUrl);
      return file.name; // Rückgabe: nur der Dateiname
    } catch (error) {
      console.error('Fehler beim Hochladen des Avatars:', error);
      throw error;
    }
  } */

  // Registrierung abschließen
  async completeRegistration() {
    try {
      await this.authService.register(
        this.email,
        this.password,
        this.displayName
      );
      const currentUser = await firstValueFrom(
        this.authService.getCurrentUser()
      );

      if (this.selectedAvatar && currentUser?.uid) {
        // Speichere die temporäre Avatar-URL direkt in Firestore
        await this.userService.saveAvatar(currentUser.uid, this.selectedAvatar);
        console.log(
          'Avatar erfolgreich in Firestore gespeichert:',
          this.selectedAvatar
        );
      }

      this.notificationService.showNotification('Konto erfolgreich erstellt!');
    } catch (error) {
      this.errorService.logError(error);
      console.error('Fehler bei der Registrierung:', error);
    }
  }

  // Navigation zurück zur Registrierung
  navigateToRegister() {
    this.routingService.navigateToRegister();
  }

  // Methode zur Navigation zum Impressum
  navigateToImprint() {
    this.routingService.navigateToImprint();
  }

  // Methode zur Navigation zur Datenschutz-Seite
  navigateToPrivacyPolicy() {
    this.routingService.navigateToPrivacyPolicy();
  }
}
