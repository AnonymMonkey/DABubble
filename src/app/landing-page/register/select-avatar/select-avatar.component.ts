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

@Component({
  selector: 'app-select-avatar',
  standalone: true,
  imports: [RouterModule, MatCardModule, MatIconModule, CommonModule],
  templateUrl: './select-avatar.component.html',
  styleUrls: ['./select-avatar.component.scss'],
})
export class SelectAvatarComponent implements OnInit {
  selectedAvatar: string | null = null; // Initial kein Avatar ausgewählt
  displayName: string = ''; // Leerer String für Benutzername
  email: string = ''; // E-Mail für Registrierung
  password: string = ''; // Passwort für Registrierung

  constructor(
    private userService: UserService,
    private authService: AuthService, // AuthService für Registrierung
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

  // Weiterleitung und Registrierung abschließen
  async completeRegistration() {
    try {
      // Zuerst die Registrierung abschließen
      await this.authService.register(
        this.email,
        this.password,
        this.displayName
      );

      // Hol den aktuellen Benutzer nach der Registrierung
      const currentUser = await firstValueFrom(
        this.authService.getCurrentUser()
      );

      if (this.selectedAvatar && currentUser?.uid) {
        // Speichere das ausgewählte Avatar-Bild in Firestore unter dem aktuellen Benutzer-UID
        await this.userService.saveAvatar(currentUser.uid, this.selectedAvatar);
      }

      this.notificationService.showNotification('Konto erfolgreich erstellt!');
      // this.routingService.navigateToMain();
    } catch (error) {
      this.errorService.logError(error);
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
