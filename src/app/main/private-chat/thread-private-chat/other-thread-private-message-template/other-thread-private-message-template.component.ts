import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, inject, Input, SimpleChanges } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { Observable, Subscription } from 'rxjs';
import { AttachmentPreviewComponent } from '../../../../shared/components/attachment-preview/attachment-preview.component';
import { EmojiPickerComponent } from '../../../../shared/components/emoji-picker/emoji-picker.component';
import { MessageReactionsComponent } from '../../../../shared/components/message-reactions/message-reactions.component';
import { UserService } from '../../../../shared/services/user-service/user.service';
import { PrivateChatService } from '../../../../shared/services/private-chat-service/private-chat.service';
import { collection, doc, DocumentReference } from 'firebase/firestore';
import { collectionData, docData } from 'rxfire/firestore';
import { Firestore } from '@angular/fire/firestore';
import { ThreadPrivateChatService } from '../../../../shared/services/thread-private-chat/thread-private-chat.service';

@Component({
  selector: 'app-other-thread-private-message-template',
  standalone: true,
  imports: [
    NgClass,
    NgFor,
    AttachmentPreviewComponent,
    DatePipe,
    MatIcon,
    MatMenu,
    MatMenuTrigger,
    EmojiPickerComponent,
    MessageReactionsComponent,
    NgIf,
    AsyncPipe,
  ],
  templateUrl: './other-thread-private-message-template.component.html',
  styleUrl: './other-thread-private-message-template.component.scss',
})
export class OtherThreadPrivateMessageTemplateComponent {
  isEmojiContainerVisible: number = 0;
  @Input() message: any = '';
  private messageSubscription: Subscription | undefined;
  public userService = inject(UserService);
  public privateChatService = inject(PrivateChatService);
  isMenuOpen: boolean = false;
  private userDataSubscription: Subscription | undefined;
  displayName: string = '';
  photoURL: string = '';

  public message$: Observable<any> | undefined;
  public threadMessages$: Observable<any[]> | undefined;

  constructor(
    private firestore: Firestore,
    private threadService: ThreadPrivateChatService
  ) {}

  /**
   * Loads user data for the message's user ID when the component is initialized.
   */
  ngOnInit() {
    if (this.message) this.loadUserData(this.message.userId);
  }

  /**
   * Loads thread messages when the message changes.
   * @param changes - The changes object.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['message'] && changes['message'].currentValue) {
      const currentMessageId = changes['message'].currentValue.messageId;
      const previousMessageId = changes['message'].previousValue?.messageId;
      if (currentMessageId !== previousMessageId) {
        this.loadThreadMessages(currentMessageId);
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
   * Loads thread messages for a given message ID.
   * @param messageId - The ID of the message to load thread messages for.
   */
  loadThreadMessages(messageId: string): void {
    const threadRef = collection(
      this.firestore,
      `users/${this.userService.userId}/privateChat/${this.threadService.privateChatId}/messages/${messageId}/thread`
    );
    this.threadMessages$ = collectionData(threadRef, { idField: 'id' });
  }

  /**
   * Loads user data for the given user ID.
   * @param userId - The ID of the user to load data for.
   */
  loadUserData(userId: string): void {
    this.userDataSubscription = this.userService.userDataMap$.subscribe(
      (userDataMap) => {
        const userData = userDataMap.get(userId);
        if (userData) {
          this.photoURL = userData.photoURL;
          this.displayName = userData.displayName;
        } else {
          this.photoURL = 'assets/img/profile/placeholder-img.webp';
          this.displayName = 'Gast';
        }
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

  /**
   * Handles when the menu is opened.
   */
  menuOpened(): void {
    this.isMenuOpen = true;
  }

  /**
   * Handles when the menu is closed.
   */
  menuClosed(): void {
    this.isMenuOpen = false;
    this.isEmojiContainerVisible = 0;
  }

  /**
   * Handles when the menu is clicked.
   */
  menuClicked(): void {
    this.isEmojiContainerVisible = 0;
  }

  /**
   * Shows the emoji container for the given message ID.
   * @param id - The ID of the message to show the emoji container for.
   */
  showEmojiContainer(id: number): void {
    this.isEmojiContainerVisible = id;
  }

  /**
   * Hides the emoji container if the menu is not open.
   */
  hideEmojiContainer(): void {
    if (!this.isMenuOpen) this.isEmojiContainerVisible = 0;
  }

  /**
   * Returns the last reply time of the given messages.
   * @param messages - The messages to get the last reply time from.
   * @returns The last reply time in the format "HH:mm Uhr".
   */
  getLastReplyTime(messages: any[]): string {
    const lastMessage = messages[messages.length - 1];
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
