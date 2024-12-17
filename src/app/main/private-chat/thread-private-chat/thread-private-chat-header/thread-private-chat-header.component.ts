import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { PrivateChatComponent } from '../../private-chat.component';
import { UserService } from '../../../../shared/services/user-service/user.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-thread-private-chat-header',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './thread-private-chat-header.component.html',
  styleUrl: './thread-private-chat-header.component.scss'
})
export class ThreadPrivateChatHeaderComponent {

isMenuOpened: boolean = false;
  currentUserId: string = '';
  public chatUserId: string | undefined = '';
  chatUserName: string | undefined;
  chatUserPhotoURL: string | undefined;
  private routeSubscription: Subscription | undefined;
  private userDataSubscription: Subscription | undefined;
  constructor(public privateChat: PrivateChatComponent, private userService: UserService, private route: ActivatedRoute) {}


  /**
   * Initialize the component and subscribe to route parameters oninit.
   */
  ngOnInit() {
    this.currentUserId = this.userService.userId;
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const privateChatId = params.get('privateChatId');
      if (privateChatId) {
        const userIds = privateChatId.split('_');
        const foundUserId = userIds.find((id) => id !== this.currentUserId);
        this.chatUserId = foundUserId ? foundUserId : this.currentUserId;
        if (this.chatUserId) this.loadChatUserData();
      }
    });
  }

  /**
   * Unsubscribes from subscriptions when the component is destroyed.
   */
  ngOnDestroy(): void {
    if (this.routeSubscription) this.routeSubscription.unsubscribe();
    if (this.userDataSubscription) this.userDataSubscription.unsubscribe();
  }

  /**
   * Load the chat user data from the user service.
   */
  private loadChatUserData() {
    if (this.chatUserId) {
      this.userDataSubscription = this.userService.getUserDataByUID(this.chatUserId).subscribe({
        next: (userData) => {
          this.chatUserName = userData?.displayName;
          this.chatUserPhotoURL = userData?.photoURL;
        },
        error: (error) =>
          console.error('Fehler beim Abrufen der Benutzerdaten:', error),
      });
    }
  }
}
