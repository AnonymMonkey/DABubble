import { Component, Input } from '@angular/core';
import { DatePipe, NgClass, NgIf } from '@angular/common';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';

@Component({
  selector: 'app-own-private-message-template',
  standalone: true,
  imports: [DatePipe, NgClass, EmojiComponent],
  templateUrl: './own-private-message-template.component.html',
  styleUrl: './own-private-message-template.component.scss'
})
export class OwnPrivateMessageTemplateComponent {
  @Input() message: any;
  isEmojiContainerVisible: number = 0;


  constructor() {}
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

  addReaction (messageId: string, emoji: any): void {}
}