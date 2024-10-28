import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../shared/services/auth-service/auth.service';
import { RoutingService } from '../../shared/services/routing-service/routing.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../shared/services/user-service/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  public errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private routingService: RoutingService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      displayName: ['', [Validators.required, this.fullNameValidator]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
        ],
      ],
      confirmPassword: ['', Validators.required],
    });
  }

  // Validator für Vorname und Nachname
  fullNameValidator(control: any) {
    const value = control.value || '';
    return value.trim().split(/\s+/).length >= 2 ? null : { fullName: true };
  }

  // Überprüfen, ob die E-Mail bereits registriert ist
  async checkEmailExistsAndProceed() {
    const email = this.emailControl.value;

    try {
      const emailExists = await this.authService.checkEmailExistsInFirestore(
        email
      );

      if (emailExists) {
        this.errorMessage = 'Diese E-Mail-Adresse ist bereits registriert.';
      } else {
        this.errorMessage = null;
        this.proceedToSelectAvatar();
      }
    } catch (error) {
      console.error('Fehler bei der Überprüfung der E-Mail-Adresse:', error);
      this.errorMessage = 'Fehler bei der Überprüfung der E-Mail-Adresse.';
    }
  }

  // Temporäre Speicherung der Registrierungsdaten und Weiterleitung
  proceedToSelectAvatar() {
    const displayName = this.registerForm.get('displayName')?.value;
    const email = this.registerForm.get('email')?.value;
    const password = this.registerForm.get('password')?.value;

    // Daten temporär speichern
    this.userService.setTempRegistrationData({
      displayName,
      email,
    });

    // Passwort separat speichern (nicht in UserData)
    this.userService.setTempPassword(password);

    // Weiterleitung zur Avatar-Auswahl
    this.routingService.navigateToSelectAvatar();
  }

  // Zugriff auf die FormControls
  get displayNameControl(): FormControl {
    return this.registerForm.get('displayName') as FormControl;
  }

  get emailControl(): FormControl {
    return this.registerForm.get('email') as FormControl;
  }

  get passwordControl(): FormControl {
    return this.registerForm.get('password') as FormControl;
  }

  get confirmPasswordControl(): FormControl {
    return this.registerForm.get('confirmPassword') as FormControl;
  }

  // Überprüfen, ob ein Großbuchstabe vorhanden ist
  get passwordHasUppercase(): boolean {
    const password = this.passwordControl.value;
    return /[A-Z]/.test(password);
  }

  // Überprüfen, ob ein Kleinbuchstabe vorhanden ist
  get passwordHasLowercase(): boolean {
    const password = this.passwordControl.value;
    return /[a-z]/.test(password);
  }

  // Überprüfen, ob eine Zahl vorhanden ist
  get passwordHasNumber(): boolean {
    const password = this.passwordControl.value;
    return /\d/.test(password);
  }

  // Überprüfen, ob ein Sonderzeichen vorhanden ist
  get passwordHasSpecialChar(): boolean {
    const password = this.passwordControl.value;
    return /[@$!%*?&]/.test(password);
  }

  // Methode zur Navigation

  navigateToLogin() {
    this.routingService.navigateToLogin();
  }

  navigateToImprint() {
    this.routingService.navigateToImprint();
  }

  navigateToPrivacyPolicy() {
    this.routingService.navigateToPrivacyPolicy();
  }
}
