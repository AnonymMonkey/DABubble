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
  styleUrls: ['./register.component.scss', './register.component_media.scss'],
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

  /**
   * initialises the component
   */
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
      acceptTerms: [false, Validators.requiredTrue],
    });
  }

  /**
   * checks if the full name is valid
   * @param control - the control
   * @returns - the validation result
   */
  fullNameValidator(control: any) {
    const value = control.value || '';
    return value.trim().split(/\s+/).length >= 2 ? null : { fullName: true };
  }

  /**
   * checks if the email exists and proceed to select avatar
   */
  async checkEmailExistsAndProceed() {
    const email = this.emailControl.value;

    try {
      const emailExists = await this.authService.checkEmailExistsInFirestore(
        email
      );

      this.checkEmailExists(emailExists);
    } catch (error) {
      console.error('Fehler bei der Überprüfung der E-Mail-Adresse:', error);
      this.errorMessage = 'Fehler bei der Überprüfung der E-Mail-Adresse.';
    }
  }

  /**
   * checks if the email exists and proceed to select avatar
   * @param emailExists - the email exists
   */
  checkEmailExists(emailExists: boolean) {
    if (emailExists) {
      this.errorMessage = 'Diese E-Mail-Adresse ist bereits registriert.';
    } else {
      this.errorMessage = null;
      this.proceedToSelectAvatar();
    }
  }

  /**
   * Proceeds to select avatar
   */
  proceedToSelectAvatar() {
    const displayName = this.registerForm.get('displayName')?.value;
    const email = this.registerForm.get('email')?.value;
    const password = this.registerForm.get('password')?.value;

    this.userService.setTempRegistrationData({
      displayName,
      email,
    });

    this.userService.setTempPassword(password);

    this.routingService.navigateToSelectAvatar();
  }

  /**
   * returns the displayNameControl
   */
  get displayNameControl(): FormControl {
    return this.registerForm.get('displayName') as FormControl;
  }

  /**
   * returns the emailControl
   */
  get emailControl(): FormControl {
    return this.registerForm.get('email') as FormControl;
  }

  /**
   * returns the passwordControl
   */
  get passwordControl(): FormControl {
    return this.registerForm.get('password') as FormControl;
  }

  /**
   * returns the confirmPasswordControl
   */
  get confirmPasswordControl(): FormControl {
    return this.registerForm.get('confirmPassword') as FormControl;
  }

  /**
   * returns the acceptTermsControl
   */
  get acceptTermsControl(): FormControl {
    return this.registerForm.get('acceptTerms') as FormControl;
  }

  /**
   * checks if the password contains at least one uppercase letter
   * @returns -
   */
  get passwordHasUppercase(): boolean {
    const password = this.passwordControl.value;
    return /[A-Z]/.test(password);
  }

  /**
   * checks if the password contains at least one lowercase letter
   * @returns -
   */
  get passwordHasLowercase(): boolean {
    const password = this.passwordControl.value;
    return /[a-z]/.test(password);
  }

  /**
   * checks if the password contains at least one number
   * @returns -
   */
  get passwordHasNumber(): boolean {
    const password = this.passwordControl.value;
    return /\d/.test(password);
  }

  /**
   * checks if the password contains at least one special character
   * @returns -
   */
  get passwordHasSpecialChar(): boolean {
    const password = this.passwordControl.value;
    return /[@$!%*?&]/.test(password);
  }

  /**
   * navigates to the login page
   */
  navigateToLogin() {
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
