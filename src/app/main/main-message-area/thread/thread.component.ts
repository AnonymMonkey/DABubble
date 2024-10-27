import { Component } from '@angular/core';
import { ThreadHeaderComponent } from './thread-header/thread-header.component';
import { MessageAreaNewMessageComponent } from '../message-area-new-message/message-area-new-message.component';
import { ThreadChatHistoryComponent } from './thread-chat-history/thread-chat-history.component';


@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [ThreadHeaderComponent, MessageAreaNewMessageComponent, ThreadChatHistoryComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

}
