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
import { Channel } from '../shared/models/channel.model';
import { ChannelService } from '../shared/services/channel-service/channel.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { BehaviorService } from '../shared/services/behavior-service/behavior.service';

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
export class MainComponent implements OnInit, OnDestroy {
  userId!: string;
  userData!: UserData;
  userService = inject(UserService);
  allChannelsData = new Map<string, Channel>();
  private allChannelsSubject = new BehaviorSubject<Map<string, Channel>>(
    this.allChannelsData
  );
  allChannelsData$ = this.allChannelsSubject.asObservable();
  public channelService = inject(ChannelService);
  private userDataSubscription: Subscription | undefined;
  private channelSubscription: Subscription | undefined;
  breakpointObserver = inject(BreakpointObserver);
  drawerMode: 'side' | 'over' = 'side';
  sideNavOpened = true;
  behaviorService = inject(BehaviorService);

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe((params) => {
      this.userId = params['uid'];
      this.userService.userId = this.userId;
    });
  }

  ngOnInit() {
    this.userService.loadAllUserData();
    this.userService.loadUserDataByUID(this.userId);
    this.loadUserData(this.userId);
    this.checkUserStatusOnReload(this.userId);

    this.breakpointObserver
      .observe(['(min-width: 992px)'])
      .subscribe((result) => {
        this.drawerMode = result.matches ? 'side' : 'over';
      });
  }

  loadUserData(userId: string): void {
    this.userDataSubscription = this.userService.userDataMap$.subscribe(
      (userDataMap) => {
        const userData = userDataMap.get(userId);
        if (userData) {
          this.userData = userData;
          this.loadAllChannelsData();
        }
      }
    );
  }

  loadAllChannelsData(): void {
    this.channelSubscription = this.channelService.channelDataMap$.subscribe(
      (channels) => {
        const userChannels = new Map<string, Channel>();
        this.userData.channels.forEach((channelId) => {
          const channel = channels.get(channelId);
          if (channel) {
            userChannels.set(channelId, channel);
          }
        });
        this.allChannelsData = userChannels;
      }
    );
  }

  // Beispielaufruf beim Reload
  async checkUserStatusOnReload(userId: string): Promise<void> {
    await this.userService.setOnlineStatus(userId, true, true); // Hier wird onReload auf true gesetzt
  }

  ngOnDestroy(): void {
    if (this.userDataSubscription) {
      this.userDataSubscription.unsubscribe();
    }
    if (this.channelSubscription) {
      // Subscription für channels auch beenden
      this.channelSubscription.unsubscribe();
    }
  }

  setNavBehavior() {
    this.behaviorService.setValue(this.sideNavOpened);
  }
}
