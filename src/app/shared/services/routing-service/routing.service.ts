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

  private getRouteParams(route: ActivatedRoute): Params {
    let currentRoute = route;
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }
    return currentRoute.snapshot.params;
  }

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

  //NOTE - hier habe ich die uid von aktuellem User eingebunden, somit haben wir für jeden User eine individuelle main
  navigateToMain(uid: string): void {
    this.router.navigate(['/main/' + uid]);
  }

  navigateToImprint(): void {
    this.router.navigate(['/imprint']);
  }

  navigateToPrivacyPolicy(): void {
    this.router.navigate(['/privacy-policy']);
  }
}
