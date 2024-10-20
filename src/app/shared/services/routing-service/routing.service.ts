import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RoutingService {
  constructor(private router: Router) {}

  navigateToLogin(): void {
    this.router.navigate(['/']);
  }

  navigateToResetPassword(): void {
    this.router.navigate(['/reset-password']);
  }

  navigateToNewPassword(): void {
    this.router.navigate(['/new-password']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToSelectAvatar(): void {
    this.router.navigate(['/select-avatar']);
  }

  navigateToMain(uid: string): void {
    this.router.navigate(['/main/' + uid]);
  }

  navigateToImprint(): void {
    this.router.navigate(['/imprint']);
  }

  navigateToPrivacyPolicy(): void {
    this.router.navigate(['/privacy policy']);
  }
}
