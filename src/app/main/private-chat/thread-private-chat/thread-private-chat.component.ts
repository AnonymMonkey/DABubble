import { Component, Input } from '@angular/core';
import { ThreadPrivateChatHeaderComponent } from './thread-private-chat-header/thread-private-chat-header.component';
import { ThreadPrivateChatHistoryComponent } from './thread-private-chat-history/thread-private-chat-history.component';
import { ThreadNewMessageComponent } from '../../main-message-area/thread/thread-new-message/thread-new-message.component';
import { ThreadPrivateChatNewMessageComponent } from './thread-private-chat-new-message/thread-private-chat-new-message.component';

@Component({
  selector: 'app-thread-private-chat',
  standalone: true,
  imports: [ThreadPrivateChatHeaderComponent, ThreadPrivateChatHistoryComponent, ThreadPrivateChatNewMessageComponent],
  templateUrl: './thread-private-chat.component.html',
  styleUrl: './thread-private-chat.component.scss'
})
export class ThreadPrivateChatComponent {
  @Input() currentUserId: any
}
