import { Component, inject, Input, SimpleChanges } from '@angular/core';
import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { UserService } from '../../../../shared/services/user-service/user.service';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { EmojiPickerComponent } from '../../../../shared/components/emoji-picker/emoji-picker.component';
import { MessageReactionsComponent } from '../../../../shared/components/message-reactions/message-reactions.component';
import { PrivateChatService } from '../../../../shared/services/private-chat-service/private-chat.service';
import { AttachmentPreviewComponent } from '../../../../shared/components/attachment-preview/attachment-preview.component';
import { PrivateChatComponent } from '../../private-chat.component';
import { ThreadPrivateChatService } from '../../../../shared/services/thread-private-chat/thread-private-chat.service';
import { Observable } from 'rxjs';
import { Firestore } from '@angular/fire/firestore';
import { collection } from 'firebase/firestore';
import { collectionData } from 'rxfire/firestore';

@Component({
  selector: 'app-other-private-message-template',
  standalone: true,
  imports: [
    NgClass,
    NgFor,
    AttachmentPreviewComponent,
    DatePipe,
    EmojiComponent,
    MatIcon,
    MatMenu,
    MatMenuTrigger,
    EmojiPickerComponent,
    MessageReactionsComponent,
    NgIf,
    AsyncPipe,
  ],
  templateUrl: './other-private-message-template.component.html',
  styleUrls: ['./other-private-message-template.component.scss'],
})
export class OtherPrivateMessageTemplateComponent {
  isEmojiContainerVisible: number = 0;
  @Input() message: any = '';
  @Input() displayName: string = '';
  @Input() photoURL: string = '';
  isMenuOpen: boolean = false;
  public userService = inject(UserService);
  public privateChatService = inject(PrivateChatService);
  public threadService = inject(ThreadPrivateChatService);
  public privateChat = inject(PrivateChatComponent);
  public threadMessages$: Observable<any[]> | undefined;

  constructor(private firestore: Firestore) {}

  /**
   * Initializes the component and loads user data for the message author.
   */
  ngOnInit(): void {
    if (this.message) this.loadThreadMessages(this.message.messageId);
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
      this.loadThreadMessages(this.message.messageId);
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
   * A method to show the emoji container.
   */
  showEmojiContainer(id: number) {
    this.isEmojiContainerVisible = id;
  }

  /**
   * A method to hide the emoji container.
   */
  hideEmojiContainer() {
    if (!this.isMenuOpen) {
      this.isEmojiContainerVisible = 0;
    }
  }

  /**
   * A method to open the menu.
   */
  menuOpened() {
    this.isMenuOpen = true;
  }

  /**
   * A method to close the menu.
   */
  menuClosed() {
    this.isMenuOpen = false;
    this.isEmojiContainerVisible = 0;
  }

  /**
   * A method to get the last reply time.
   * @param messages The messages to get the last reply time from.
   * @returns The last reply time.
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
