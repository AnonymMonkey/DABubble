import {
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ChannelService } from '../../../../../shared/services/channel-service/channel.service';
import { NgIf, DatePipe, NgFor } from '@angular/common';
import { ThreadService } from '../../../../../shared/services/thread-service/thread.service';
import { MainMessageAreaComponent } from '../../../main-message-area.component';
import { MessageReactionsComponent } from '../../../../../shared/components/message-reactions/message-reactions.component';
import { AttachmentPreviewComponent } from '../../../../../shared/components/attachment-preview/attachment-preview.component';
import { UserService } from '../../../../../shared/services/user-service/user.service';
import { Firestore, collection } from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';
import { CollectionReference, onSnapshot } from 'firebase/firestore';

@Component({
  selector: 'app-own-message-show',
  standalone: true,
  imports: [
    NgIf,
    DatePipe,
    MessageReactionsComponent,
    NgFor,
    AttachmentPreviewComponent,
  ],
  templateUrl: './own-message-show.component.html',
  styleUrls: ['./own-message-show.component.scss'],
})
export class OwnMessageShowComponent implements OnInit {
  @Input() message: any;
  public channelService = inject(ChannelService);
  public userService = inject(UserService);
  public threadService = inject(ThreadService);
  public mainMessageArea = inject(MainMessageAreaComponent);
  private firestore = inject(Firestore);
  displayName: string = '';
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
        this.channelService.channelId,
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
  loadThreadMessages(channelId: string, messageId: string): void {
    this.unsubscribeThreadMessages();
    const threadRef = this.getThreadReference(channelId, messageId);
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
    channelId: string,
    messageId: string
  ): CollectionReference {
    return collection(
      this.firestore,
      `channels/${channelId}/messages/${messageId}/thread`
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
        hour12: false, // 24-Stunden-Format
      };
      return date.toLocaleTimeString([], options) + ' Uhr';
    }
    return 'Keine Antworten';
  }
}
