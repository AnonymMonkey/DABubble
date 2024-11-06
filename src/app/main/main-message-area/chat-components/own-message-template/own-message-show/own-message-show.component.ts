import { Component, Input } from '@angular/core';
import { MainMessageAreaComponent } from '../../../main-message-area.component';
import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChannelService } from '../../../../../shared/services/channel-service/channel.service';
import { ThreadService } from '../../../../../shared/services/thread-service/thread.service';
import { MatIcon } from '@angular/material/icon';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-own-message-show',
  standalone: true,
  imports: [
    NgClass,
    DatePipe,
    NgIf,
    NgFor,
    MatIcon,
    PickerModule,
    EmojiComponent,
    AsyncPipe
  ],
  templateUrl: './own-message-show.component.html',
  styleUrl: './own-message-show.component.scss',
})
export class OwnMessageShowComponent {
  @Input() message: any;
  @Input() temporaryMessageContent: string = ''; // Neuen Input für temporären Text

  public isEmojiContainerVisible: number = 0;
  public emojis: string = '';
  
  public threadMessages$: Observable<any[]> = new Observable();

  constructor(
    public mainMessageArea: MainMessageAreaComponent,
    public channelService: ChannelService,
    public threadService: ThreadService,
    public firestore: Firestore
  ) {}

  get threadKeys(): string[] {
    return Object.keys(this.message?.thread || {});
  }
  
  showEmojiContainer(id: number) {
    this.isEmojiContainerVisible = id;
  }

  hideEmojiContainer() {
    this.isEmojiContainerVisible = 0;
  }

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
  

  addEmoji(emoji: string) {
    // this.mainMessageArea.addEmoji(emoji);
  }
}
