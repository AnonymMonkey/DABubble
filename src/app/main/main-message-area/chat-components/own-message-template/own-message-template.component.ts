import { Component, inject, Input, OnChanges, OnInit } from '@angular/core';
import { MainMessageAreaComponent } from '../../main-message-area.component';
import { DatePipe, NgClass, NgIf } from '@angular/common';
import { ChannelService } from '../../../../shared/services/channel-service/channel.service';
import { ThreadService } from '../../../../shared/services/thread-service/thread.service';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { OwnMessageShowComponent } from './own-message-show/own-message-show.component';
import { OwnMessageEditComponent } from './own-message-edit/own-message-edit.component';
import { MessageService } from '../../../../shared/services/message-service/message.service';
import { EmojiPickerComponent } from '../../../../shared/components/emoji-picker/emoji-picker.component';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { UserService } from '../../../../shared/services/user-service/user.service';
import { StorageService } from '../../../../shared/services/storage-service/storage.service';

@Component({
  selector: 'app-own-message-template',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    MatIcon,
    EmojiComponent,
    MatMenu,
    MatMenuTrigger,
    OwnMessageShowComponent,
    OwnMessageEditComponent,
    EmojiPickerComponent,
  ],
  templateUrl: './own-message-template.component.html',
  styleUrl: './own-message-template.component.scss',
})
export class OwnMessageTemplateComponent implements OnChanges, OnInit {
  @Input() message: any;
  isEmojiContainerVisible: number = 0;
  editMessageMenuOpened: boolean = false;
  messageService = inject(MessageService);
  userService = inject(UserService);
  currentBorderRadius = '30px 30px 30px 30px';
  isDataLoaded: boolean = false;
  emojiContainerVisible: { [messageId: string]: boolean } = {};
  menuOpenStatus: { [messageId: string]: boolean } = {};
  photoURL: string = '';

  get threadKeys(): string[] {
    return Object.keys(this.message?.thread || {});
  }

  constructor(
    public mainMessageArea: MainMessageAreaComponent,
    public channelService: ChannelService,
    public threadService: ThreadService,
    public storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.isDataLoaded = true;

    if (this.message) {
      this.userService
        .getUserDataByUID(this.message.userId)
        .subscribe((data) => {
          this.photoURL = data.photoURL;
        });
    }
  }

  ngOnChanges(): void {
    if (this.messageService.editMessageId !== this.message.id) {
      this.emojiContainerVisible[this.message.messageId] = false;
    }
  }

  isMenuOpen(messageId: string): boolean {
    return !!this.menuOpenStatus[messageId];
  }

  toggleHoverEffect() {
    return this.isDataLoaded;
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

  onMenuOpened(messageId: string): void {
    this.menuOpenStatus[messageId] = true;
    this.emojiContainerVisible[messageId] = true;
  }

  onMenuClosed(messageId: string): void {
    this.menuOpenStatus[messageId] = false;
    this.hideEmojiContainer(messageId);
  }

  // Neuer Logikteil
  keepEmojiContainerVisible(messageId: string): void {
    if (!this.menuOpenStatus[messageId]) {
      this.emojiContainerVisible[messageId] = true;
    }
  }

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

  setEditMessageMenuOpened(value: boolean, messageId: string) {
    this.editMessageMenuOpened = value;

    if (!value) {
      // Zustand des Emoji-Containers vollständig zurücksetzen
      this.emojiContainerVisible[messageId] = false;
    }
  }

  addReaction(messageId: string, emoji: any): void {
    let path =
      'channels/' + this.channelService.channelId + '/messages/' + messageId;
    this.messageService.setActualMessage(this.message);
    this.messageService.addOrChangeReactionChannelOrThread(emoji, path);
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

  deleteMessage(message: any) {
    const path = `channels/${this.channelService.channelId}/messages/${message.messageId}`;
    if (message.attachmentUrls && message.attachmentUrls.length > 0) {
      for (const url of message.attachmentUrls) {
        this.storageService.deleteSpecificFile(url);
      }
    }
    this.messageService.deleteMessageInThreadOrChannel(path);
  }
}
