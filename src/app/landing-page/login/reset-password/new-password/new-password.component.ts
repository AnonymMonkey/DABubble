import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../../shared/services/auth-service/auth.service';
import { CommonModule } from '@angular/common';
import { RoutingService } from '../../../../shared/services/routing-service/routing.service';

@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [
    RouterModule,
    MatCardModule,
    MatIconModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './new-password.component.html',
  styleUrls: [
    './new-password.component.scss',
    './new-password.component_media.scss',
  ],
})
export class NewPasswordComponent implements OnInit {
  newPasswordForm!: FormGroup;
  oobCode: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private routingService: RoutingService
  ) {}

  /**
   * initialises the component
   */
  ngOnInit(): void {
    this.oobCode = this.route.snapshot.queryParamMap.get('oobCode');
    this.newPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    });
  }

  /**
   * checks if the password contains at least one uppercase letter
   */
  get passwordHasUppercase(): boolean {
    const password = this.newPasswordControl.value;
    return /[A-Z]/.test(password);
  }

  /**
   * checks if the password contains at least one lowercase letter
   */
  get passwordHasLowercase(): boolean {
    const password = this.newPasswordControl.value;
    return /[a-z]/.test(password);
  }

  /**
   * checks if the password contains at least one number
   */
  get passwordHasNumber(): boolean {
    const password = this.newPasswordControl.value;
    return /\d/.test(password);
  }

  /**
   * checks if the password contains at least one special character
   */
  get passwordHasSpecialChar(): boolean {
    const password = this.newPasswordControl.value;
    return /[@$!%*?&]/.test(password);
  }

  /**
   * returns the newPasswordControl
   */
  get newPasswordControl(): FormControl {
    return this.newPasswordForm.get('newPassword') as FormControl;
  }

  /**
   * returns the confirmPasswordControl
   */
  get confirmPasswordControl(): FormControl {
    return this.newPasswordForm.get('confirmPassword') as FormControl;
  }

  /**
   * changes the password
   */
  async changePassword() {
    if (this.newPasswordForm.valid && this.oobCode) {
      const newPassword = this.newPasswordControl.value;
      const confirmPassword = this.confirmPasswordControl.value;

      if (newPassword === confirmPassword) {
        try {
          await this.authService.confirmPasswordReset(
            this.oobCode,
            newPassword
          );
        } catch (error: any) {
          console.error('Fehler:', error);
        }
      }
    }
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
