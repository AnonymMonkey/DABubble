import { Component, inject, Input } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { UserService } from '../../../../shared/services/user-service/user.service';
import { OwnPrivateMessageEditComponent } from './own-private-message-edit/own-private-message-edit.component';
import { MessageService } from '../../../../shared/services/message-service/message.service';
import { OwnPrivateMessageShowComponent } from './own-private-message-show/own-private-message-show.component';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { EmojiPickerComponent } from '../../../../shared/components/emoji-picker/emoji-picker.component';
import { MatIcon } from '@angular/material/icon';
import { ThreadService } from '../../../../shared/services/thread-service/thread.service';
import { PrivateChatService } from '../../../../shared/services/private-chat-service/private-chat.service';
import { StorageService } from '../../../../shared/services/storage-service/storage.service';

@Component({
  selector: 'app-own-private-message-template',
  standalone: true,
  imports: [
    NgClass,
    EmojiComponent,
    OwnPrivateMessageEditComponent,
    NgIf,
    OwnPrivateMessageShowComponent,
    MatMenu,
    EmojiPickerComponent,
    MatMenuTrigger,
    MatIcon,
  ],
  templateUrl: './own-private-message-template.component.html',
  styleUrls: [
    './own-private-message-template.component.scss',
  ],
})
export class OwnPrivateMessageTemplateComponent {
  @Input() message: any;
  @Input() displayName: string = '';
  @Input() photoURL: string = '';
  isEmojiContainerVisible: number = 0;
  public userService = inject(UserService);
  public messageService = inject(MessageService);
  private storageService = inject(StorageService);
  editMessageMenuOpened: boolean = false;
  public threadService = inject(ThreadService);
  currentBorderRadius = '0px 30px 30px 30px';
  public privateChatService = inject(PrivateChatService);
  isMenuOpen: boolean = false;

  constructor() {}

  /**
   * Show the emoji container if the message is not being edited.
   * @param id - The ID of the message.
   */
  showEmojiContainer(id: number) {
    if (this.messageService.editMessageId === null) {
      this.isEmojiContainerVisible = id;
    }
  }

  /**
   * Hide the emoji container if the message is not being edited.
   */
  hideEmojiContainer() {
    if (!this.editMessageMenuOpened && !this.isMenuOpen) {
      this.isEmojiContainerVisible = 0;
    }
  }

  /**
   * Set the isMenuOpen property to true when the menu is opened.
   */
  onMenuOpened() {
    this.isMenuOpen = true;
  }

  /**
   * Set the isMenuOpen property to false when the menu is closed.
   */
  onMenuClosed() {
    this.isMenuOpen = false;
    this.isEmojiContainerVisible = 0;
  }

  /**
   * Get the last reply time from the messages array.
   * @param messages - The messages array.
   * @returns The last reply time as a string.
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

  /**
   * Set the editMessageMenuOpened property to the given boolean value.
   * @param boolean - The boolean value to set the property to.
   */
  setEditMessageMenuOpened(boolean: boolean) {
    this.editMessageMenuOpened = boolean;
  }

  /**
   * Toggle the border radius of the message container.
   * @param menuType - The type of the menu.
   */
  toggleBorder(menuType: string) {
    if (menuType === 'deleteMessage' || menuType === 'editMessage') {
      this.currentBorderRadius = '0px 30px 30px 30px';
    } else if (menuType === 'emoji') {
      this.currentBorderRadius = '30px 30px 30px 30px';
    } else {
      this.currentBorderRadius = '0px 30px 30px 30px';
    }
    document.documentElement.style.setProperty(
      '--border-radius',
      this.currentBorderRadius
    );
  }

  /**
   * Delete a message.
   * @param message - The message to delete.
   */
  async deleteMessage(message: any) {
    const privateChatId = this.privateChatService.privateChatId;
    if (message.attachmentUrls && message.attachmentUrls.length > 0) {
      for (const url of message.attachmentUrls) {
        this.storageService.deleteSpecificFile(url);
      }
    }
    this.messageService.deleteMessage(privateChatId!, message.messageId);
  }
}
