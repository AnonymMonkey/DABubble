import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, inject, Input, SimpleChanges } from '@angular/core';
import { UserService } from '../../../../../shared/services/user-service/user.service';
import { MessageReactionsComponent } from '../../../../../shared/components/message-reactions/message-reactions.component';
import { AttachmentPreviewComponent } from '../../../../../shared/components/attachment-preview/attachment-preview.component';
import { ChannelService } from '../../../../../shared/services/channel-service/channel.service';
import { PrivateChatComponent } from '../../../private-chat.component';
import { CollectionReference, Firestore } from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';
import { collection, onSnapshot } from 'firebase/firestore';
import { ThreadPrivateChatService } from '../../../../../shared/services/thread-private-chat/thread-private-chat.service';

@Component({
  selector: 'app-own-private-message-show',
  standalone: true,
  imports: [
    DatePipe,
    MessageReactionsComponent,
    NgIf,
    NgFor,
    AttachmentPreviewComponent,
  ],
  templateUrl: './own-private-message-show.component.html',
  styleUrls: [
    './own-private-message-show.component.scss',
  ],
})
export class OwnPrivateMessageShowComponent {
  @Input() message: any;
  @Input() displayName: string = '';
  public channelService = inject(ChannelService);
  public userService = inject(UserService);
  public threadService = inject(ThreadPrivateChatService);
  public privateChat = inject(PrivateChatComponent);
  private firestore = inject(Firestore);
  public threadMessages$: Observable<any[]> | undefined;
  private userDataSubscription: Subscription | undefined;
  public threadMessages: any[] = [];
  private threadMessagesSubscription: Subscription | undefined;
  public threadInfo: Map<string, { count: number; lastReplyDate: string }> =
    new Map();

  constructor() {}

  /**
   * Initializes the component and loads user data for the message author.
   */
  ngOnInit(): void {
    if (this.message) this.loadUserData(this.message.userId);
  }

  /**
   * Loads thread messages when the message changes.
   * @param changes - The changes object.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['message'] &&
      changes['message'].currentValue?.messageId !==
        changes['message'].previousValue?.messageId
    )
      this.loadThreadMessages(
        this.message.messageId
      );
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
    if (this.threadMessagesSubscription)
      this.threadMessagesSubscription.unsubscribe();
  }

  /**
   * Loads thread messages for a given channel and message.
   * @param channelId - The ID of the channel.
   * @param messageId - The ID of the message.
   */
  loadThreadMessages(messageId: string): void {
    this.unsubscribeThreadMessages();
    const threadRef = this.getThreadReference(messageId);
    this.subscribeToThreadMessages(threadRef, messageId);
  }

  /**
   * Unsubscribes from the existing thread messages subscription.
   */
  private unsubscribeThreadMessages(): void {
    if (this.threadMessagesSubscription) {
      this.threadMessagesSubscription.unsubscribe();
    }
  }

  /**
   * Gets the Firestore reference for thread messages.
   * @param channelId - The ID of the channel.
   * @param messageId - The ID of the message.
   * @returns A Firestore collection reference.
   */
  private getThreadReference(
    messageId: string
  ): CollectionReference {
    return collection(
      this.firestore,
      `users/${this.userService.userId}/privateChat/${this.threadService.privateChatId}/messages/${messageId}/thread`
    );
  }

  /**
   * Subscribes to changes in the thread messages collection.
   * @param threadRef - The Firestore reference to the thread messages.
   * @param messageId - The ID of the message.
   */
  private subscribeToThreadMessages(
    threadRef: CollectionReference,
    messageId: string
  ): void {
    onSnapshot(threadRef, (snapshot) => {
      const messages = snapshot.docs.map((doc) => doc.data());
      if (this.shouldUpdateThreadMessages(messages)) {
        this.updateThreadMessages(messages, messageId);
      }
    });
  }

  /**
   * Checks if the thread messages should be updated.
   * @param messages - The new list of thread messages.
   * @returns True if the messages should be updated, otherwise false.
   */
  private shouldUpdateThreadMessages(messages: any[]): boolean {
    return messages.length !== this.threadMessages.length;
  }

  /**
   * Updates the thread messages and thread information.
   * @param messages - The new list of thread messages.
   * @param messageId - The ID of the message.
   */
  private updateThreadMessages(messages: any[], messageId: string): void {
    this.threadMessages = messages;
    const lastReplyDate = this.getLastReplyTime();
    this.threadInfo.set(messageId, {
      count: messages.length,
      lastReplyDate: lastReplyDate,
    });
  }

  /**
   * Returns the last reply time for the given thread messages.
   * @returns The last reply time as a string.
   */
  getLastReplyTime(): string {
    if (this.threadMessages.length === 0) return 'Keine Antworten';
    const lastMessage = this.threadMessages[this.threadMessages.length - 1];
    if (lastMessage && lastMessage.time) {
      const date = new Date(lastMessage.time);
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      };
      return date.toLocaleTimeString([], options) + ' Uhr';
    }
    return 'Keine Antworten';
  }
}
