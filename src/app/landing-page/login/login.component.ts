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
  styleUrl: './login.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent {
  email = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [Validators.required]);
  errorMessage: string | null = null;
  showAnimation: boolean = false;

  constructor(
    private authService: AuthService,
    private errorService: ErrorService,
    private routingService: RoutingService
  ) {
    const animationPlayed = sessionStorage.getItem('animationPlayed');
    this.showAnimation = !animationPlayed;

    if (!animationPlayed) {
      sessionStorage.setItem('animationPlayed', 'true');
    }
  }

  async login() {
    // Überprüfen, ob beide Felder gültige Eingaben haben
    if (this.email.invalid || this.password.invalid) {
      this.errorMessage = 'Bitte gültige E-Mail und Passwort eingeben.';
      return;
    }

    try {
      // Versuche den Benutzer anzumelden
      await this.authService.login(this.email.value!, this.password.value!);
      this.errorMessage = null; // Fehlermeldung zurücksetzen, falls vorher eine angezeigt wurde
      // Weiterleitung nach erfolgreichem Login
      // this.routingService.navigateToMain();
    } catch (error: any) {
      this.errorService.logError(error); // Fehler wird protokolliert
      this.errorMessage = 'Benutzername oder Passwort ist falsch.'; // Allgemeine Fehlermeldung
    }
  }

  async googleLogin() {
    try {
      await this.authService.googleLogin();
      // this.routingService.navigateToMain();
    } catch (error: any) {
      this.errorService.logError(error);
      this.errorMessage = error.message;
    }
  }

  async guestLogin() {
    try {
      await this.authService.guestLogin();
      // this.routingService.navigateToMain();
    } catch (error: any) {
      this.errorService.logError(error);
      this.errorMessage = error.message;
    }
  }
  // Methode zur Navigation zum Passwort-Reset
  navigateToResetPassword() {
    this.routingService.navigateToResetPassword();
  }

  // Methode zur Navigation zur Registrierung
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
