import { Component, Input } from '@angular/core';
import { MainMessageAreaComponent } from '../../main-message-area.component';
import { DatePipe, NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-other-message-template',
  standalone: true,
  imports: [NgClass, DatePipe, NgIf],
  templateUrl: './other-message-template.component.html',
  styleUrl: './other-message-template.component.scss'
})
export class OtherMessageTemplateComponent {
  isEmojiContainerVisible: number = 0;
  @Input() message: any = '';

  constructor(public mainMessageArea: MainMessageAreaComponent) {}

  showEmojiContainer(id: number) {
    this.isEmojiContainerVisible = id;
    // console.log(this.message.thread.messages.length);
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
}
