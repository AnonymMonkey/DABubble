import { Component, Input, OnInit } from '@angular/core';
import { ThreadHeaderComponent } from './thread-header/thread-header.component';
import { MessageAreaNewMessageComponent } from '../message-area-new-message/message-area-new-message.component';
import { ThreadChatHistoryComponent } from './thread-chat-history/thread-chat-history.component';
import { ChannelMessage } from '../../../shared/models/channel-message.model';
import { Observable } from 'rxjs';
import { ThreadService } from '../../../shared/services/thread-service/thread.service';
import { ThreadNewMessageComponent } from './thread-new-message/thread-new-message.component';


@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [ThreadHeaderComponent, ThreadChatHistoryComponent, ThreadNewMessageComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent implements OnInit {
  @Input() currentUserId: any;
  actualMessage$: Observable<ChannelMessage | null>;

  constructor(private threadService: ThreadService) {
    this.actualMessage$ = this.threadService.actualMessage$;
  }

  ngOnInit(): void {}
}
