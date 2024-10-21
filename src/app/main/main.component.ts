import { Component, inject } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { MainMessageAreaComponent } from './main-message-area/main-message-area.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { SideNavComponent } from './side-nav/side-nav.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../shared/services/user-service/user.service';
import { UserData } from '../shared/models/user.model';
import { catchError, of, Subscription } from 'rxjs';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    HeaderComponent,
    MainMessageAreaComponent,
    MatIconModule,
    MatSidenavModule,
    MatButtonModule,
    SideNavComponent,
    CommonModule,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  userId!: string;
  userData!: UserData;
  subscription!: Subscription;
  userService = inject(UserService);

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe((params) => {
      this.userId = params['uid'];
    });
    this.loadUserData();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnInit() {}

  loadUserData() {
    this.subscription = this.userService
      .getUserDataByUID(this.userId)
      .pipe(
        catchError((err) => {
          console.error('Fehler beim Abrufen der Nutzerdaten:', err);
          return of(null); // Gibt ein leeres Observable zurück, um den Fehler zu umgehen
        })
      )
      .subscribe({
        next: (data) => {
          this.userData = data;
        },
        error: (err) =>
          console.error('Fehler beim Abrufen der Nutzerdaten:', err),
      });
  }
}
