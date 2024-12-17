import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-thread-private-chat-history',
  standalone: true,
  imports: [],
  templateUrl: './thread-private-chat-history.component.html',
  styleUrl: './thread-private-chat-history.component.scss'
})
export class ThreadPrivateChatHistoryComponent {
  @Input() currentUserId: any;
}
