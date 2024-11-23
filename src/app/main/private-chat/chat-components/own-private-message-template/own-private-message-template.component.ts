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
import { deleteField, doc, updateDoc } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
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
  styleUrl: './own-private-message-template.component.scss',
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
  showEmojiContainer(id: number) {
    if (this.messageService.editMessageId === null) {
      this.isEmojiContainerVisible = id;
    }
  }

  hideEmojiContainer() {
    if (!this.editMessageMenuOpened && !this.isMenuOpen) {
      this.isEmojiContainerVisible = 0;
    }
  }

  onMenuOpened() {
    this.isMenuOpen = true;
  }

  onMenuClosed() {
    this.isMenuOpen = false;
    this.isEmojiContainerVisible = 0;
  }

  getLastReplyTime(messages: any[]): string {
    // Nimm die letzte Nachricht aus dem Array
    const lastMessage = messages[messages.length - 1];

    if (lastMessage && lastMessage.time) {
      // Formatiere die Zeit (Hier anpassen, falls nötig)
      const date = new Date(lastMessage.time);
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // Für 24-Stunden-Format, ändern auf true für 12-Stunden-Format
      };
      return date.toLocaleTimeString([], options) + ' Uhr';
    }

    return 'Keine Antworten'; // Falls keine Nachrichten vorhanden sind
  }

  setEditMessageMenuOpened(boolean: boolean) {
    this.editMessageMenuOpened = boolean;
  }

  toggleBorder(menuType: string) {
    switch (menuType) {
      case 'deleteMessage':
        this.currentBorderRadius = '0px 30px 30px 30px';
        break;
      case 'editMessage':
        this.currentBorderRadius = '0px 30px 30px 30px';
        break;
      case 'emoji':
        this.currentBorderRadius = '30px 30px 30px 30px';
        break;
      default:
        this.currentBorderRadius = '0px 30px 30px 30px';
    }
    document.documentElement.style.setProperty(
      '--border-radius',
      this.currentBorderRadius
    );
  }

  async deleteMessage(message: any) {
    const privateChatId = this.privateChatService.privateChatId;
    const path = `privateChats/${privateChatId}/messages/${message.messageId}`;
    if (message.attachmentUrls && message.attachmentUrls.length > 0) {
      for (const url of message.attachmentUrls) {
        this.storageService.deleteSpecificFile(url);
      }
    }
    this.messageService.deleteMessage(privateChatId!, message.messageId);
  }
}
