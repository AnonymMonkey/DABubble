import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { EmojiPickerComponent } from '../../../../../shared/components/emoji-picker/emoji-picker.component';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { NgClass, NgIf } from '@angular/common';
import { UserService } from '../../../../../shared/services/user-service/user.service';
import { MessageService } from '../../../../../shared/services/message-service/message.service';
import { ThreadService } from '../../../../../shared/services/thread-service/thread.service';
import { PrivateChatService } from '../../../../../shared/services/private-chat-service/private-chat.service';
import { OwnThreadMessageShowComponent } from './own-thread-message-show/own-thread-message-show.component';
import { OwnThreadMessageEditComponent } from './own-thread-message-edit/own-thread-message-edit.component';
import { ChannelService } from '../../../../../shared/services/channel-service/channel.service';
import { StorageService } from '../../../../../shared/services/storage-service/storage.service';
import { MainMessageAreaComponent } from '../../../main-message-area.component';

@Component({
  selector: 'app-own-thread-message-template',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    MatIcon,
    MatMenu,
    MatMenuTrigger,
    EmojiPickerComponent,
    OwnThreadMessageShowComponent,
    OwnThreadMessageEditComponent,
  ],
  templateUrl: './own-thread-message-template.component.html',
  styleUrl: './own-thread-message-template.component.scss',
})
export class OwnThreadMessageTemplateComponent implements OnInit, OnChanges {
  @Input() message: any;
  photoURL: string = '';
  isEmojiContainerVisible: number = 0;
  public userService = inject(UserService);
  public messageService = inject(MessageService);
  editMessageMenuOpened: boolean = false;
  public threadService = inject(ThreadService);
  private channelService = inject(ChannelService);
  private storageService = inject(StorageService);
  currentBorderRadius = '30px 30px 30px 30px';
  public privateChatService = inject(PrivateChatService);
  emojiContainerVisible: { [messageId: string]: boolean } = {};
  menuOpenStatus: { [messageId: string]: boolean } = {};

  constructor(private mainMessageArea: MainMessageAreaComponent
  ) {}

  ngOnInit() {
    if (this.message) {
      this.userService
        .getUserDataByUID(this.message.userId)
        .subscribe((data) => {
          this.photoURL = data.photoURL;
        });
    }
  }

  showEmojiContainer(messageId: string) {
    if (this.messageService.editMessageId !== messageId) {
      this.emojiContainerVisible[messageId] = true;
    }
  }

  hideEmojiContainer(messageId: string) {
    if (
      this.messageService.editMessageId !== messageId &&
      !this.menuOpenStatus[messageId]
    ) {
      this.emojiContainerVisible[messageId] = false;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['message'] && !changes['message'].firstChange) {
      this.handleMessageChange(changes['message'].currentValue);
    }
  }

  onMenuOpened(messageId: string): void {
    this.menuOpenStatus[messageId] = true;
    this.emojiContainerVisible[messageId] = true;
  }

  onMenuClosed(messageId: string): void {
    this.menuOpenStatus[messageId] = false;
    this.hideEmojiContainer(messageId);
  }

  // Eine Methode, die auf Änderungen reagiert
  handleMessageChange(newMessage: any) {
    // Füge deine Logik hinzu, wenn die Nachricht geändert wurde
    if (newMessage && newMessage.userId) {
      this.userService.getUserDataByUID(newMessage.userId).subscribe((data) => {
        this.photoURL = data.photoURL;
      });
    }
  }

  setEditMessageMenuOpened(value: boolean, messageId: string) {
    this.editMessageMenuOpened = value;

    if (!value) {
      // Zustand des Emoji-Containers vollständig zurücksetzen
      this.emojiContainerVisible[messageId] = false;
    }
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

  addReaction(messageId: string, emoji: any): void {}

  toggleBorder(menuType: string) {
    switch (menuType) {
      case 'editMessage':
        this.currentBorderRadius = '0px 30px 30px 30px';
        break;
      default:
        this.currentBorderRadius = '0px 30px 30px 30px';
    }
    document.documentElement.style.setProperty(
      '--border-radius',
      this.currentBorderRadius
    );
  }

  deleteMessage(message: any) {
    const channelPath = `channels/${this.channelService.channelId}/messages/${message.messageId}`;
    const threadPath = `channels/${this.channelService.channelId}/messages/${this.threadService.actualMessageSubject.value?.messageId}/thread/${message.messageId}`;
    if (message.attachmentUrls && message.attachmentUrls.length > 0) {
      for (const url of message.attachmentUrls) {
        this.storageService.deleteSpecificFile(url);
      }
    }
    if (this.message.messageId.startsWith('thread_')) {
      this.messageService.deleteMessageInThreadOrChannel(threadPath);
    } else if (this.message.messageId.startsWith('msg_')) {
      this.messageService.deleteMessageInThreadOrChannel(channelPath);
      this.mainMessageArea.closeSidenav();
    }
  }
}
