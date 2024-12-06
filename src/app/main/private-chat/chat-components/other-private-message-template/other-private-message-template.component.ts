import { Component, inject, Input } from '@angular/core';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { UserService } from '../../../../shared/services/user-service/user.service';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { EmojiPickerComponent } from '../../../../shared/components/emoji-picker/emoji-picker.component';
import { MessageReactionsComponent } from '../../../../shared/components/message-reactions/message-reactions.component';
import { PrivateChatService } from '../../../../shared/services/private-chat-service/private-chat.service';
import { AttachmentPreviewComponent } from '../../../../shared/components/attachment-preview/attachment-preview.component';

@Component({
  selector: 'app-other-private-message-template',
  standalone: true,
  imports: [NgClass, NgFor, AttachmentPreviewComponent, DatePipe, EmojiComponent, MatIcon, MatMenu, MatMenuTrigger, EmojiPickerComponent, MessageReactionsComponent, NgIf],
  templateUrl: './other-private-message-template.component.html',
  styleUrls: ['./other-private-message-template.component.scss', './other-private-message-template.component_media.scss',],
})
export class OtherPrivateMessageTemplateComponent {
  isEmojiContainerVisible: number = 0;
  @Input() message: any = '';
  @Input() displayName: string = '';
  @Input() photoURL: string = '';
  isMenuOpen: boolean = false;
  public userService = inject(UserService);
  public privateChatService = inject(PrivateChatService);

  constructor() {}

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
