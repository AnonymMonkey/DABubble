import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { SideNavComponent } from './side-nav/side-nav.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UserService } from '../shared/services/user-service/user.service';
import { UserData } from '../shared/models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    HeaderComponent,
    MatIconModule,
    MatSidenavModule,
    MatButtonModule,
    SideNavComponent,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent implements OnInit, OnDestroy{
  userId!: string;
  userData!: UserData;
  subscription!: Subscription;
  userService = inject(UserService);
  private userDataSubscription: Subscription | undefined;

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe((params) => {
      this.userId = params['uid'];
      this.userService.userId = this.userId;
    });
  }

  ngOnInit() {
    this.userService.loadAllUserData();
    this.userService.loadUserDataByUID(this.userId);
    // this.userService.userData$.subscribe((data) => {
    //   this.userData = data; // Empfange die Benutzerdaten
    // });

    this.loadUserData(this.userId);

    this.checkUserStatusOnReload(this.userId);
  }

  loadUserData(userId: string): void {
    this.userDataSubscription = this.userService.userDataMap$.subscribe(
      (userDataMap) => {
        const userData = userDataMap.get(userId);
        if (userData) {
          this.userData = userData;
        }
      }
    );
  }

  // Beispielaufruf beim Reload
  async checkUserStatusOnReload(userId: string): Promise<void> {
    await this.userService.setOnlineStatus(userId, true, true); // Hier wird onReload auf true gesetzt
  }

  ngOnDestroy(): void {
    if (this.userDataSubscription) {
      this.userDataSubscription.unsubscribe(); // Verhindert Speicherlecks
    }
  }
}
