import { Component } from '@angular/core';
import { ThreadHeaderComponent } from './thread-header/thread-header.component';
import { MessageAreaChatHistoryComponent } from '../message-area-chat-history/message-area-chat-history.component';
import { MessageAreaNewMessageComponent } from '../message-area-new-message/message-area-new-message.component';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [ThreadHeaderComponent, MessageAreaChatHistoryComponent, MessageAreaNewMessageComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

}
