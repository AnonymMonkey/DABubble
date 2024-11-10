import { Component, inject, Input } from '@angular/core';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { MessageService } from '../../services/message-service/message.service';

@Component({
  selector: 'app-emoji-picker',
  standalone: true,
  imports: [PickerModule],
  templateUrl: './emoji-picker.component.html',
  styleUrl: './emoji-picker.component.scss'
})
export class EmojiPickerComponent {
  @Input() message!: any;
  private messageService = inject(MessageService);

  constructor() {}

  addReaction(messageId: string, emoji: string): void {
    this.messageService.setActualMessage(this.message);
    this.messageService.addOrChangeReaction(messageId, emoji);
  }
}
