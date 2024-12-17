import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCard, MatCardModule } from '@angular/material/card';
import { PrivateChatHeaderComponent } from './private-chat-header/private-chat-header.component';
import { PrivateChatPlaceholderComponent } from './private-chat-placeholder/private-chat-placeholder.component';
import { MessageAreaNewMessageComponent } from '../main-message-area/message-area-new-message/message-area-new-message.component';
import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import { UserService } from '../../shared/services/user-service/user.service';
import { PrivateChatHistoryComponent } from './private-chat-history/private-chat-history.component';
import {
  catchError,
  from,
  Observable,
  of,
  Subscription,
  switchMap,
} from 'rxjs';
import { PrivateChatService } from '../../shared/services/private-chat-service/private-chat.service';
import { BehaviorService } from '../../shared/services/behavior-service/behavior.service';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { ThreadPrivateChatComponent } from './thread-private-chat/thread-private-chat.component';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-private-chat',
  templateUrl: './private-chat.component.html',
  styleUrls: ['./private-chat.component.scss'],
  standalone: true,
  imports: [
    MatCard,
    NgIf,
    MatCardModule,
    PrivateChatHeaderComponent,
    PrivateChatPlaceholderComponent,
    PrivateChatHistoryComponent,
    MessageAreaNewMessageComponent,
    AsyncPipe,
    CommonModule,
    MatSidenav,
    MatSidenavModule,
    ThreadPrivateChatComponent,
  ],
})
export class PrivateChatComponent implements OnInit {
  privateChat$!: Observable<any>;
  hasMessages: boolean = false;
  behaviorService = inject(BehaviorService);
  sideNavOpened = true;
  opened: boolean = false;
  currentUserId = this.userService.userId;
  subscription!: Subscription;
  routeSubscription!: Subscription;
  @ViewChild('sidenavPrivateChat') sidenav!: MatSidenav;
  @ViewChild('sidenavPrivateChat', { read: ElementRef })
  sidenavElement!: ElementRef;
  threadOpened: boolean = false;
  breakpointObserverSubscription!: Subscription;
  breakpointObserver = inject(BreakpointObserver);
  drawerMode: 'side' | 'over' = 'side';

  /**
   * Clean up subscriptions on component destroy.
   */
  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
    if (this.routeSubscription) this.routeSubscription.unsubscribe();
  }

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private privateChatService: PrivateChatService,
    private firestore: Firestore
  ) {}

  /**
   * Initializes the component by subscribing to route parameters and fetching private chat data.
   */
  ngOnInit(): void {
    this.hasMessages = false;
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

    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const privateChatId = params.get('privateChatId');
      if (privateChatId) {
        this.privateChatService.setPrivateChatId(privateChatId);
      }
    });
  
    this.privateChat$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const privateChatId = params.get('privateChatId');
        const currentUserId = this.userService.userId;
        if (privateChatId) {
          const messagesCollectionRef = collection(
            this.firestore,
            `users/${currentUserId}/privateChat/${privateChatId}/messages`
          );
  
          return new Observable((observer) => {
            const unsubscribe = onSnapshot(
              messagesCollectionRef,
              (querySnapshot) => {
                if (!querySnapshot.empty) {
                  const messagesArray = querySnapshot.docs.map((doc) =>
                    doc.data()
                  );
                  this.hasMessages = messagesArray.length > 0;
                  observer.next({
                    privateChatId,
                    messages: messagesArray,
                  });
                } else {
                  this.hasMessages = false;
                  observer.next({
                    privateChatId,
                    messages: [],
                  });
                }
              }
            );
  
            return () => unsubscribe();
          });
        } else {
          console.error('Keine privateChatId in den Routenparametern gefunden');
          this.hasMessages = false;
          return of({ privateChatId: null, messages: [] }); // Leeres Array zurückgeben
        }
      })
    );
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
