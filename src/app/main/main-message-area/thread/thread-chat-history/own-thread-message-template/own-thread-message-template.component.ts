import { Component, inject, Input, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-own-thread-message-template',
  standalone: true,
  imports: [NgClass, NgIf, MatIcon, MatMenu, MatMenuTrigger, EmojiPickerComponent, OwnThreadMessageShowComponent, OwnThreadMessageEditComponent],
  templateUrl: './own-thread-message-template.component.html',
  styleUrl: './own-thread-message-template.component.scss'
})
export class OwnThreadMessageTemplateComponent implements OnInit {
  @Input() message: any;
  photoURL: string = '';
  isEmojiContainerVisible: number = 0;
  public userService = inject(UserService);
  public messageService = inject(MessageService);
  editMessageMenuOpened: boolean = false;
  public threadService = inject(ThreadService);
  currentBorderRadius = '30px 30px 30px 30px';
  public privateChatService = inject(PrivateChatService);

  constructor() {}

  ngOnInit() {
    if (this.message) {
     this.userService.getUserDataByUID(this.message.userId).subscribe((data) => {
       this.photoURL = data.photoURL;
     });
    }
  }

  showEmojiContainer(id: number) {
    if (this.messageService.editMessageId === null) {
      this.isEmojiContainerVisible = id;
    }
  }

  hideEmojiContainer() {
    if (!this.editMessageMenuOpened) {
      this.isEmojiContainerVisible = 0;
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

  addReaction (messageId: string, emoji: any): void {}

  setEditMessageMenuOpened(boolean: boolean) {
    this.editMessageMenuOpened = boolean;
  }

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
}
