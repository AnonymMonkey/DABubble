import { Component, inject, Input } from '@angular/core';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { MessageService } from '../../services/message-service/message.service';
import { PrivateChatService } from '../../services/private-chat-service/private-chat.service';

@Component({
  selector: 'app-emoji-picker',
  standalone: true,
  imports: [PickerModule],
  templateUrl: './emoji-picker.component.html',
  styleUrl: './emoji-picker.component.scss'
})
export class EmojiPickerComponent {
  @Input() message!: any;
  @Input() component: string = '';
  private messageService = inject(MessageService);
  private privateChatService = inject(PrivateChatService);

  constructor() {
  }

  addReaction(messageId: string, emoji: { shortName: string; [key: string]: any }, component: string): void {
    if (component === 'channel') {
      this.messageService.setActualMessage(this.message);
      this.messageService.addOrChangeReaction(messageId, emoji);
    } else if (component === 'privateChat') {
      this.privateChatService.setActualMessage(messageId).then(() => {
        this.privateChatService.addOrChangeReactionPrivateChat(messageId, emoji);
      }).catch(error => console.error('Fehler beim Setzen der Nachricht:', error));
    }
  }
  
  
}
