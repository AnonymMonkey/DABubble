import { Component, inject, Input } from '@angular/core';
import { DatePipe, NgClass, NgIf } from '@angular/common';
import { UserService } from '../../../../shared/services/user-service/user.service';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { EmojiPickerComponent } from '../../../../shared/components/emoji-picker/emoji-picker.component';
import { MessageReactionsComponent } from '../../../../shared/components/message-reactions/message-reactions.component';

@Component({
  selector: 'app-other-private-message-template',
  standalone: true,
  imports: [NgClass, DatePipe, EmojiComponent, MatIcon, MatMenu, MatMenuTrigger, EmojiPickerComponent, MessageReactionsComponent, NgIf],
  templateUrl: './other-private-message-template.component.html',
  styleUrl: './other-private-message-template.component.scss'
})
export class OtherPrivateMessageTemplateComponent {
  isEmojiContainerVisible: number = 0;
  @Input() message: any = '';
  @Input() displayName: string = '';
  @Input() photoURL: string = '';
  public userService = inject(UserService);

  constructor() {}

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

  addReaction(messageId: string, emoji: any) {
    // this.userService.addReaction(messageId, emoji);
  }
}
