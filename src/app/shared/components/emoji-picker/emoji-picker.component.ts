import { Component, inject, Input } from '@angular/core';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { MessageService } from '../../services/message-service/message.service';
import { PrivateChatService } from '../../services/private-chat-service/private-chat.service';
import { ThreadService } from '../../services/thread-service/thread.service';
import { ChannelService } from '../../services/channel-service/channel.service';

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
  private channelService = inject(ChannelService);
  private threadService = inject(ThreadService);

  constructor() {
  }

  addReaction(messageId: string, emoji: { shortName: string; [key: string]: any }, component: string): void {
    if (component === 'channel') {
      const channelPath = 'channels/' + this.channelService.channelId + '/messages/' + messageId;
      const threadPath = 'channels/' + this.channelService.channelId  + '/messages/' + this.threadService.actualMessageSubject.value?.messageId + '/thread/' + messageId;
      if (messageId.startsWith('msg_')) {
        this.messageService.setActualMessage(this.message);
        this.messageService.addOrChangeReactionChannelOrThread(emoji, channelPath);
      } else if (messageId.startsWith('thread_')) {
        this.messageService.setActualMessage(this.message);
        this.messageService.addOrChangeReactionChannelOrThread(emoji, threadPath);
      }
    } else if (component === 'privateChat') {
      this.privateChatService.setActualMessage(messageId).then(() => {
        this.privateChatService.addOrChangeReactionPrivateChat(messageId, emoji);
      }).catch(error => console.error('Fehler beim Setzen der Nachricht:', error));
    }
  }
  
}
