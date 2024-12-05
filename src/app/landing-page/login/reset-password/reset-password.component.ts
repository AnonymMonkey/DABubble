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
  private authService = inject(AuthService);
  private errorService = inject(ErrorService);
  private notificationService = inject(NotificationService);
  private routingService = inject(RoutingService);

  email = new FormControl('', [Validators.required, Validators.email]);
  errorMessage: string = '';
  successMessage: string = '';

  /**
   * sends a password reset email
   * @returns - Promise<void>
   */
  async sendPasswordResetEmail() {
    if (this.isEmailInvalid()) {
      this.setErrorMessage('Bitte eine gültige E-Mail-Adresse eingeben.');
      return;
    }

    try {
      await this.performPasswordReset();
      this.handlePasswordResetSuccess();
    } catch (error) {
      this.handlePasswordResetError(error);
    }
  }

  /**
   * checks if email is invalid
   * @returns - boolean
   */
  private isEmailInvalid(): boolean {
    return this.email.invalid;
  }

  /**
   * sets the error message
   * @param message - The message
   */
  private setErrorMessage(message: string): void {
    this.errorMessage = message;
  }

  /**
   * performs the password reset
   * @returns - Promise<void>
   */
  private async performPasswordReset(): Promise<void> {
    await this.authService.sendPasswordResetEmail(this.email.value!);
  }

  /**
   * handles the success of the password reset
   */
  private handlePasswordResetSuccess(): void {
    this.notificationService.showNotification(
      'E-Mail zum Zurücksetzen des Passworts gesendet.'
    );
    this.goBack();
  }

  /**
   * handles the error of the password reset
   * @param error - The error
   */
  private handlePasswordResetError(error: any): void {
    this.errorService.logError(error);
    this.setErrorMessage(
      'Fehler beim Senden der E-Mail. Versuchen Sie es später erneut.'
    );
  }

  /**
   * navigates back to the login page
   */
  goBack() {
    this.routingService.navigateToLogin();
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
