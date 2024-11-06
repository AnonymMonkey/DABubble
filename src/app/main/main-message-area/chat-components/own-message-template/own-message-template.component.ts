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

@Component({
  selector: 'app-own-message-template',
  standalone: true,
  imports: [NgClass, NgIf, DatePipe, MatIcon, MatMenu, MatMenuTrigger, OwnMessageShowComponent, OwnMessageEditComponent],
  templateUrl: './own-message-template.component.html',
  styleUrl: './own-message-template.component.scss'
})
export class OwnMessageTemplateComponent {
  @Input() message: any;
  isEmojiContainerVisible: number = 0;
  editMessageMenuOpened: boolean = false;
  messageService = inject(MessageService);
  

  constructor(public mainMessageArea: MainMessageAreaComponent, public channelService: ChannelService, public threadService: ThreadService
  ) {}
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

  setEditMessageMenuOpened(boolean: boolean) {
    this.editMessageMenuOpened = boolean;
  }
}
