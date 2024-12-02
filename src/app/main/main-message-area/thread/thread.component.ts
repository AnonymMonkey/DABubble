import { Component, Input } from '@angular/core';
import { ThreadHeaderComponent } from './thread-header/thread-header.component';
import { ThreadChatHistoryComponent } from './thread-chat-history/thread-chat-history.component';
import { ThreadNewMessageComponent } from './thread-new-message/thread-new-message.component';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [
    ThreadHeaderComponent,
    ThreadChatHistoryComponent,
    ThreadNewMessageComponent,
  ],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss',
})
export class ThreadComponent {
  @Input() currentUserId: any;
}
