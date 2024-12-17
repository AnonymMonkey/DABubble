import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { Subscription } from 'rxjs';
import { AttachmentPreviewComponent } from '../../../../shared/components/attachment-preview/attachment-preview.component';
import { EmojiPickerComponent } from '../../../../shared/components/emoji-picker/emoji-picker.component';
import { MessageReactionsComponent } from '../../../../shared/components/message-reactions/message-reactions.component';
import { UserService } from '../../../../shared/services/user-service/user.service';
import { PrivateChatService } from '../../../../shared/services/private-chat-service/private-chat.service';

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
  ],
  templateUrl: './other-thread-private-message-template.component.html',
  styleUrl: './other-thread-private-message-template.component.scss',
})
export class OtherThreadPrivateMessageTemplateComponent {
  isEmojiContainerVisible: number = 0;
  @Input() message: any = '';

  public userService = inject(UserService);
  public privateChatService = inject(PrivateChatService);
  isMenuOpen: boolean = false;
  private userDataSubscription: Subscription | undefined;
  displayName: string = '';
  photoURL: string = '';

  constructor() {}

  /**
   * Loads user data for the message's user ID when the component is initialized.
   */
  ngOnInit() {
    if (this.message) this.loadUserData(this.message.userId);
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
