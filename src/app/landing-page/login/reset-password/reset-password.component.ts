import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../shared/services/auth-service/auth.service';
import { CommonModule } from '@angular/common';
import { ErrorService } from '../../../shared/services/error-service/error.service';
import { RoutingService } from '../../../shared/services/routing-service/routing.service';
import { NotificationService } from '../../../shared/services/notification-service/notification.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    RouterModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: [
    './reset-password.component.scss',
    './reset-password.component_media.scss',
  ],
})
export class ResetPasswordComponent {
  // Abhängigkeiten über `inject` beziehen
  private authService = inject(AuthService);
  private errorService = inject(ErrorService);
  private notificationService = inject(NotificationService);
  private routingService = inject(RoutingService);

  email = new FormControl('', [Validators.required, Validators.email]); // FormControl für E-Mail mit Validierung
  errorMessage: string = '';
  successMessage: string = '';

  // Funktion zum Senden der Passwort-Zurücksetzen-E-Mail
  async sendPasswordResetEmail() {
    if (this.email.invalid) {
      this.errorMessage = 'Bitte eine gültige E-Mail-Adresse eingeben.';
      return;
    }

    try {
      await this.authService.sendPasswordResetEmail(this.email.value!);
      this.notificationService.showNotification(
        'E-Mail zum Zurücksetzen des Passworts gesendet.'
      );
      this.goBack();
    } catch (error) {
      this.errorService.logError(error); // Fehler über den ErrorService behandeln
      this.errorMessage =
        'Fehler beim Senden der E-Mail. Versuchen Sie es später erneut.';
    }
  }

  // Zurück zur Login-Seite
  goBack() {
    this.routingService.navigateToLogin();
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
