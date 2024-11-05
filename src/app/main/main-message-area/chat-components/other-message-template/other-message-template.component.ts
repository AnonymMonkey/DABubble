import { Component, Input } from '@angular/core';
import { MainMessageAreaComponent } from '../../main-message-area.component';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChannelService } from '../../../../shared/services/channel-service/channel.service';
import { ThreadService } from '../../../../shared/services/thread-service/thread.service';
import { MatIcon } from '@angular/material/icon';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';

@Component({
  selector: 'app-other-message-template',
  standalone: true,
  imports: [NgClass, DatePipe, NgIf, NgFor, MatIcon, PickerModule, EmojiComponent],
  templateUrl: './other-message-template.component.html',
  styleUrl: './other-message-template.component.scss'
})
export class OtherMessageTemplateComponent {
  isEmojiContainerVisible: number = 0;
  emojis: string = '';
  @Input() message: any = '';

  constructor(public mainMessageArea: MainMessageAreaComponent, public channelService: ChannelService, public threadService: ThreadService) {}

  showEmojiContainer(id: number) {
    this.isEmojiContainerVisible = id;
  }

  hideEmojiContainer() {
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

  addEmoji(emoji: string) {
    // this.mainMessageArea.addEmoji(emoji);
  }
}
