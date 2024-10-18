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
  styleUrls: ['./new-password.component.scss'],
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

  ngOnInit(): void {
    this.oobCode = this.route.snapshot.queryParamMap.get('oobCode');
    this.newPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    });
  }

  // Überprüfen, ob ein Großbuchstabe vorhanden ist
  get passwordHasUppercase(): boolean {
    const password = this.newPasswordControl.value;
    return /[A-Z]/.test(password);
  }

  // Überprüfen, ob ein Kleinbuchstabe vorhanden ist
  get passwordHasLowercase(): boolean {
    const password = this.newPasswordControl.value;
    return /[a-z]/.test(password);
  }

  // Überprüfen, ob eine Zahl vorhanden ist
  get passwordHasNumber(): boolean {
    const password = this.newPasswordControl.value;
    return /\d/.test(password);
  }

  // Überprüfen, ob ein Sonderzeichen vorhanden ist
  get passwordHasSpecialChar(): boolean {
    const password = this.newPasswordControl.value;
    return /[@$!%*?&]/.test(password);
  }

  // Hilfsmethode zum Typ-Casting im Template
  get newPasswordControl(): FormControl {
    return this.newPasswordForm.get('newPassword') as FormControl;
  }

  get confirmPasswordControl(): FormControl {
    return this.newPasswordForm.get('confirmPassword') as FormControl;
  }

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

  // Methode zur Navigation zum Passwort-Reset
  navigateToLogin() {
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
