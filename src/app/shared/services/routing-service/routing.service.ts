import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { BehaviorSubject, filter, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoutingService {
  private currentRouteSource = new BehaviorSubject<Params | null>(null);
  currentRoute$ = this.currentRouteSource.asObservable();

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.getRouteParams(this.activatedRoute))
      )
      .subscribe((params) => {
        this.currentRouteSource.next(params);
      });
  }

  /**
   *  Returns the params of the current route
   * @param route - The activated route
   * @returns - The params of the current route
   */
  private getRouteParams(route: ActivatedRoute): Params {
    let currentRoute = route;
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }
    return currentRoute.snapshot.params;
  }

  /**
   * Navigates to the login page
   */
  navigateToLogin(): void {
    this.router.navigate(['/']);
  }

  /**
   * Navigates to the reset password page
   */
  navigateToResetPassword(): void {
    this.router.navigate(['/reset-password']);
  }

  /**
   * Navigates to the new password page
   */
  navigateToNewPassword(): void {
    this.router.navigate(['/new-password']);
  }

  /**
   * Navigates to the register page
   */
  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  /**
   * Navigates to the select avatar page
   */
  navigateToSelectAvatar(): void {
    this.router.navigate(['/select-avatar']);
  }

  /**
   * Navigates to the main page
   * @param uid
   */
  navigateToMain(uid: string): void {
    this.router.navigate(['/main/' + uid]);
  }

  /**
   * Navigates to the imprint page
   */
  navigateToImprint(): void {
    this.router.navigate(['/imprint']);
  }

  /**
   * Navigates to the privacy policy page
   */
  navigateToPrivacyPolicy(): void {
    this.router.navigate(['/privacy-policy']);
  }
}
