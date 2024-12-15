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
import { BreakpointObserver } from '@angular/cdk/layout';
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
})
export class MainComponent implements OnInit, OnDestroy {
  userId!: string;
  userData!: UserData;
  userService = inject(UserService);
  allChannelsData = new Map<string, Channel>();
  allExistingChannelNames: string[] = [];
  private allChannelsSubject = new BehaviorSubject<Map<string, Channel>>(
    this.allChannelsData
  );
  allChannelsData$ = this.allChannelsSubject.asObservable();
  public channelService = inject(ChannelService);
  private userDataSubscription: Subscription | undefined;
  private channelSubscription: Subscription | undefined;
  breakpointObserver = inject(BreakpointObserver);
  drawerMode: 'side' | 'over' = 'side';
  mobileVersion: boolean = false;
  sideNavOpened = true;
  behaviorService = inject(BehaviorService);
  sideNavBehaviorSubscription!: Subscription;
  breakpointSubscription!: Subscription;
  existingChannelSubscription!: Subscription;

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe((params) => {
      this.userId = params['uid'];
      this.userService.userId = this.userId;
    });
  }

  /**
   * Initialize the component and load user data.
   */
  ngOnInit() {
    this.userService.loadAllUserData();
    this.userService.loadUserDataByUID(this.userId);
    this.existingChannelNames();
    this.loadUserData(this.userId);
    this.checkUserStatusOnReload(this.userId);
    this.breakpointSubscription = this.subscribeBreakpointObserver();
    this.sideNavBehaviorSubscription = this.subscribeSideNavBehavior();
  }

  /**
   * Subscribe to the sideNavOpened$ observable and update the sideNavOpened property.
   */
  subscribeSideNavBehavior(): Subscription {
    return this.behaviorService.sideNavOpened$.subscribe((value) => {
      this.sideNavOpened = value;
    });
  }

  /**
   * Subscribe to breakpoint changes and update the drawerMode and mobileVersion properties.
   */
  subscribeBreakpointObserver(): Subscription {
    return this.breakpointObserver
      .observe(['(min-width: 1250px)'])
      .subscribe((result) => {
        this.drawerMode = result.matches ? 'side' : 'over';
        this.mobileVersion = !result.matches;
      });
  }

  /**
   * Load user data for the given user ID.
   * @param {string} userId - The ID of the user.
   */
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

  /**
   * Load all channel data for the current user from the channel service.
   */
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

  existingChannelNames() {
    this.existingChannelSubscription = this.channelService.channelDataMap$
      .pipe()
      .subscribe((channels) => {
        this.allExistingChannelNames = Array.from(channels.values()).map(
          (channel) => channel.channelName
        );
      });
  }

  /**
   * Check the online status of the user on reload.
   * @param {string} userId - The ID of the user.
   */
  async checkUserStatusOnReload(userId: string): Promise<void> {
    await this.userService.setOnlineStatus(userId, true, true);
  }

  /**
   * Unsubscribe from all subscriptions.
   */
  ngOnDestroy(): void {
    if (this.userDataSubscription) {
      this.userDataSubscription.unsubscribe();
    }
    if (this.channelSubscription) {
      this.channelSubscription.unsubscribe();
    }
    if (this.sideNavBehaviorSubscription) {
      this.sideNavBehaviorSubscription.unsubscribe();
    }
    if (this.breakpointSubscription) {
      this.breakpointSubscription.unsubscribe();
    }
    if (this.existingChannelSubscription) {
      this.existingChannelSubscription.unsubscribe();
    }
  }

  /**
   * Set the sideNavOpened property and update the sideNavOpened$ observable.
   */
  setNavBehavior() {
    this.behaviorService.setValue(this.sideNavOpened);
  }

  /**
   * Close the side navigation on mobile devices.
   */
  closeSideNavOnMobile() {
    if (this.mobileVersion) {
      this.sideNavOpened = false;
      this.behaviorService.setValue(this.sideNavOpened);
    }
  }
}
