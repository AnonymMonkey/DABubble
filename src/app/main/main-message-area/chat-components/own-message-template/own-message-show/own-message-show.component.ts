import { Component, inject, Input } from '@angular/core';
import { ChannelService } from '../../../../../shared/services/channel-service/channel.service';
import { NgIf, DatePipe, NgFor } from '@angular/common';
import { ThreadService } from '../../../../../shared/services/thread-service/thread.service';
import { MainMessageAreaComponent } from '../../../main-message-area.component';
import { MessageReactionsComponent } from '../../../../../shared/components/message-reactions/message-reactions.component';
import { AttachmentPreviewComponent } from '../../../../../shared/components/attachment-preview/attachment-preview.component';
import { UserService } from '../../../../../shared/services/user-service/user.service';

@Component({
  selector: 'app-own-message-show',
  standalone: true,
  imports: [NgIf, DatePipe, MessageReactionsComponent, NgFor, AttachmentPreviewComponent],
  templateUrl: './own-message-show.component.html',
  styleUrl: './own-message-show.component.scss'
})
export class OwnMessageShowComponent {
  @Input() message: any;
  public channelService = inject(ChannelService);
  public userService = inject(UserService);
  public threadService = inject(ThreadService);
  public mainMessageArea = inject(MainMessageAreaComponent);
  get threadKeys(): string[] {
    return Object.keys(this.message?.thread || {});
  }
  
  constructor() {}

  getLastReplyTime(thread: { [key: string]: any }): string {
    // Extrahiere die Nachrichten aus dem Objekt (Werte des Objekts)
    const messages = Object.values(thread);
  
    // Nimm die letzte Nachricht aus dem Array der Nachrichten
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
