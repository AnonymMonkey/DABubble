import {
  Component,
  ViewChild,
  AfterViewInit,
  ElementRef,
  OnInit,
  inject,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MessageAreaHeaderComponent } from './message-area-header/message-area-header.component';
import { MessageAreaChatHistoryComponent } from './message-area-chat-history/message-area-chat-history.component';
import { MessageAreaNewMessageComponent } from './message-area-new-message/message-area-new-message.component';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { NgClass } from '@angular/common';
import { Renderer2 } from '@angular/core';
import { ChannelService } from '../../shared/services/channel-service/channel.service';
import { ActivatedRoute } from '@angular/router';
import { ThreadComponent } from './thread/thread.component';
import { UserService } from '../../shared/services/user-service/user.service';
import { BehaviorService } from '../../shared/services/behavior-service/behavior.service';
import { Subscription } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-main-message-area',
  standalone: true,
  imports: [
    MatCardModule,
    NgClass,
    MessageAreaHeaderComponent,
    MessageAreaChatHistoryComponent,
    MessageAreaNewMessageComponent,
    MatSidenavModule,
    ThreadComponent,
  ],
  templateUrl: './main-message-area.component.html',
  styleUrls: ['./main-message-area.component.scss'],
})
export class MainMessageAreaComponent implements AfterViewInit, OnInit {
  events: string[] = [];
  opened: boolean = false;
  threadOpened: boolean = false;
  channelData: any;
  channelId!: string | null;
  public currentUserId!: string;
  behaviorService = inject(BehaviorService);
  sideNavOpened = true;
  subscription!: Subscription;
  routeSubscription!: Subscription;
  channelSubscription!: Subscription;
  sidenavOpenedsubscription!: Subscription;
  sidenavClosedsubscription!: Subscription;
  breakpointObserverSubscription!: Subscription;
  breakpointObserver = inject(BreakpointObserver);
  drawerMode: 'side' | 'over' = 'side';

  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChild('sidenav', { read: ElementRef }) sidenavElement!: ElementRef;

  constructor(
    private renderer: Renderer2,
    private channelService: ChannelService,
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  /**
   * Initialize the component and subscribe to route parameters and channel data.
   */
  ngOnInit(): void {
    this.currentUserId = this.userService.userId;
    this.channelSubscription = this.channelService.channelData$.subscribe(
      (data) => {
        this.channelData = data;
      }
    );
    this.subscriptionRoute();
    this.subscriptionSideNav();
  }

  /**
   * Subscribe to route parameters and update the channelId property
   */
  subscriptionRoute() {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const newChannelId = params.get('channelId');
      if (newChannelId !== this.channelId) {
        this.channelId = newChannelId;
        this.channelService.setChannel(this.channelId || '');
        this.closeSidenav();
      }
    });
  }

  /**
   * Subscribe to the sideNavOpened$ observable and update the sideNavOpened property
   */
  subscriptionSideNav() {
    this.subscription = this.behaviorService.sideNavOpened$.subscribe(
      (value) => {
        this.sideNavOpened = value;
      }
    );
    this.breakpointObserverSubscription = this.breakpointObserver
      .observe(['(min-width: 1250px)'])
      .subscribe((result) => {
        this.drawerMode = result.matches ? 'side' : 'over';
      });
  }

  /**
   * Unsubscribe from all subscriptions
   */
  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
    if (this.routeSubscription) this.routeSubscription.unsubscribe();
    if (this.channelSubscription) this.channelSubscription.unsubscribe();
    if (this.sidenavOpenedsubscription)
      this.sidenavOpenedsubscription.unsubscribe();
    if (this.sidenavClosedsubscription)
      this.sidenavClosedsubscription.unsubscribe();
    if (this.breakpointObserverSubscription)
      this.breakpointObserverSubscription.unsubscribe();
  }

  /**
   * Listen to sidenav events and apply styles
   */
  ngAfterViewInit() {
    this.sidenav.openedStart.subscribe(() => {
      this.renderer.setStyle(
        this.sidenavElement.nativeElement,
        'box-shadow',
        '0px 2px 2px 0px rgba(0, 0, 0, 0.078)'
      );
    });
    this.sidenav.closedStart.subscribe(() => {
      this.renderer.removeStyle(
        this.sidenavElement.nativeElement,
        'box-shadow'
      );
    });
  }

  /**
   * Open the thread sidenav
   */
  openSidenav() {
    if (this.sidenav) {
      this.sidenavElement.nativeElement.classList.remove('d-none');
      this.sidenav.open();
      this.threadOpened = true;
    }
  }

  /**
   * Close the thread sidenav
   */
  closeSidenav() {
    if (this.sidenav) {
      this.sidenav.close();
      this.threadOpened = false;
      setTimeout(
        () => this.sidenavElement.nativeElement.classList.add('d-none'),
        300
      );
    }
  }
}
