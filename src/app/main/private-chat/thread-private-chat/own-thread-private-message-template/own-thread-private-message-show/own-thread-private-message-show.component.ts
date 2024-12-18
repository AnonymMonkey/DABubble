import { Component, inject, Input, SimpleChanges } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { MessageReactionsComponent } from '../../../../../shared/components/message-reactions/message-reactions.component';
import { AttachmentPreviewComponent } from '../../../../../shared/components/attachment-preview/attachment-preview.component';
import { UserService } from '../../../../../shared/services/user-service/user.service';
import { DocumentReference, Firestore } from '@angular/fire/firestore';
import { collection, doc } from 'firebase/firestore';
import { ThreadPrivateChatService } from '../../../../../shared/services/thread-private-chat/thread-private-chat.service';
import { docData } from 'rxfire/firestore';

@Component({
  selector: 'app-own-thread-private-message-show',
  standalone: true,
  imports: [
    NgIf,
    DatePipe,
    MessageReactionsComponent,
    NgFor,
    AttachmentPreviewComponent,
    AsyncPipe,
  ],
  templateUrl: './own-thread-private-message-show.component.html',
  styleUrl: './own-thread-private-message-show.component.scss',
})
export class OwnThreadPrivateMessageShowComponent {
  @Input() message: any;
  public displayName: string = '';
  public userService = inject(UserService);
  private userDataSubscription: Subscription | undefined;
  private messageSubscription: Subscription | undefined;
  private firestore = inject(Firestore);
  public message$: Observable<any> | undefined;
  get threadKeys(): string[] {
    return Object.keys(this.message?.thread || {});
  }

  constructor(private threadService: ThreadPrivateChatService) {}

  /**
   * Initialize the component and load user data.
   */
  ngOnInit() {
    if (this.message) this.loadUserData(this.message.userId);
  }

  /**
   * Subscribes to new message data for a given message ID.
   * @param messageId - The ID of the message to subscribe to.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['message'] && changes['message'].currentValue) {
      const currentMessageId = changes['message'].currentValue.messageId;
      const previousMessageId = changes['message'].previousValue?.messageId;
      if (currentMessageId !== previousMessageId) {
        this.subscribeNewMessage(currentMessageId);
      }
    }
  }

  /**
   * Subscribes to new message data for a given message ID.
   * @param messageId - The ID of the message to subscribe to.
   */
  subscribeNewMessage(messageId: string): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    const messageRef: DocumentReference = doc(
      this.firestore,
      `users/${this.userService.userId}/privateChat/${this.threadService.privateChatId}/messages/${messageId}`
    );
    this.message$ = docData(messageRef, { idField: 'id' });
    this.messageSubscription = this.message$.subscribe((message) => {});
  }

  /**
   * Loads user data for the given user ID.
   * @param userId - The ID of the user to load data for.
   */
  loadUserData(userId: string): void {
    this.userDataSubscription = this.userService.userDataMap$.subscribe(
      (userDataMap) => {
        const userData = userDataMap.get(userId);
        if (userData) this.displayName = userData.displayName;
        else this.displayName = 'Gast';
      }
    );
  }

  /**
   * Clean up subscriptions on component destroy.
   */
  ngOnDestroy(): void {
    if (this.userDataSubscription) this.userDataSubscription.unsubscribe();
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }
}
