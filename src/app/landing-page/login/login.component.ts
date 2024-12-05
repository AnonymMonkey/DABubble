import { Component, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { AuthService } from '../../shared/services/auth-service/auth.service';
import { RoutingService } from '../../shared/services/routing-service/routing.service';
import { ErrorService } from '../../shared/services/error-service/error.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss', './login.component_media.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent {
  email = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [Validators.required]);
  errorMessage: string | null = null;
  showAnimation: boolean = true;

  constructor(
    private authService: AuthService,
    private errorService: ErrorService,
    private routingService: RoutingService
  ) {
    const animationPlayed = sessionStorage.getItem('animationPlayed');
    this.showAnimation = !animationPlayed;

    if (!animationPlayed) {
      sessionStorage.setItem('animationPlayed', 'true');

      setTimeout(() => {
        this.showAnimation = false;
      }, 3500);
    }
  }

  /**
   * Performs the login
   * @returns - Promise<void>
   */
  async login() {
    if (this.email.invalid || this.password.invalid) {
      this.errorMessage = 'Bitte gültige E-Mail und Passwort eingeben.';
      return;
    }

    try {
      await this.authService.login(this.email.value!, this.password.value!);
      this.errorMessage = null;
    } catch (error: any) {
      this.errorService.logError(error);
      this.errorMessage = 'Benutzername oder Passwort ist falsch.';
    }
  }

  /**
   * Performs the google login
   */
  async googleLogin() {
    try {
      await this.authService.googleLogin();
    } catch (error: any) {
      this.errorService.logError(error);
      this.errorMessage = error.message;
    }
  }

  /**
   * Performs the guest login
   */
  async guestLogin() {
    try {
      await this.authService.guestLogin();
    } catch (error: any) {
      this.errorService.logError(error);
      this.errorMessage = error.message;
    }
  }

  /**
   * Navigates to the reset password page
   */
  navigateToResetPassword() {
    this.routingService.navigateToResetPassword();
  }

  /**
   * Navigates to the register page
   */
  navigateToRegister() {
    this.routingService.navigateToRegister();
  }

  /**
   * Navigates to the imprint page
   */
  navigateToImprint() {
    this.routingService.navigateToImprint();
  }

  /**
   * Navigates to the privacy policy page
   */
  navigateToPrivacyPolicy() {
    this.routingService.navigateToPrivacyPolicy();
  }
}
