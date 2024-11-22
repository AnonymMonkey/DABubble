import { Component, inject, Input } from '@angular/core';
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
    EmojiPickerComponent,  ],
  templateUrl: './own-message-template.component.html',
  styleUrl: './own-message-template.component.scss',
})
export class OwnMessageTemplateComponent {
  @Input() message: any;
  isEmojiContainerVisible: number = 0;
  editMessageMenuOpened: boolean = false;
  messageService = inject(MessageService);
  userService = inject(UserService);
  currentBorderRadius = '30px 30px 30px 30px';
  isDataLoaded: boolean = false;
  emojiContainerVisible: { [messageId: string]: boolean } = {};
  hideTimeouts: { [messageId: string]: any } = {};
  menuOpenStatus: { [messageId: string]: boolean } = {};
  photoURL: string = '';

  get threadKeys(): string[] {
    return Object.keys(this.message?.thread || {});
  }

  constructor(
    public mainMessageArea: MainMessageAreaComponent,
    public channelService: ChannelService,
    public threadService: ThreadService
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

  isMenuOpen(messageId: string): boolean {
    return !!this.menuOpenStatus[messageId];
  }

  toggleHoverEffect() {
    return this.isDataLoaded;
  }

  hideEmojiContainer(messageId: string) {
    if (
      !this.editMessageMenuOpened &&
      !this.menuOpenStatus[messageId]
    ) {
      this.emojiContainerVisible[messageId] = false;
    }
  }
  
  scheduleHideEmojiContainer(messageId: string) {
    clearTimeout(this.hideTimeouts[messageId]);
    this.hideTimeouts[messageId] = setTimeout(() => {
      this.hideEmojiContainer(messageId);
    }, 200); // Optionaler Timeout, um sicherzustellen, dass keine Konflikte auftreten.
  }
  
  showEmojiContainer(messageId: string) {
    clearTimeout(this.hideTimeouts[messageId]);
    this.emojiContainerVisible[messageId] = true;
  }
  
  onMenuOpened(messageId: string): void {
    this.menuOpenStatus[messageId] = true;
    this.emojiContainerVisible[messageId] = true;
  }
  
  onMenuClosed(messageId: string): void {
    this.menuOpenStatus[messageId] = false;
    this.scheduleHideEmojiContainer(messageId);
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

  setEditMessageMenuOpened(value: boolean) {
    this.editMessageMenuOpened = value;
  }

  addReaction(messageId: string, emoji: any): void {
    this.messageService.setActualMessage(this.message);
    this.messageService.addOrChangeReaction(messageId, emoji);
  }

  toggleBorder(menuType: string) {
    switch (menuType) {
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

}
