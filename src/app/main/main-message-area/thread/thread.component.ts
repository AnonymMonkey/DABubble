import { Component } from '@angular/core';
import { ThreadHeaderComponent } from './thread-header/thread-header.component';
import { MessageAreaChatHistoryComponent } from '../message-area-chat-history/message-area-chat-history.component';
import { OwnMessageTemplateComponent } from '../chat-components/own-message-template/own-message-template.component';
import { OtherMessageTemplateComponent } from '../chat-components/other-message-template/other-message-template.component';
import { MessageAreaNewMessageComponent } from '../message-area-new-message/message-area-new-message.component';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [ThreadHeaderComponent, MessageAreaNewMessageComponent, MessageAreaChatHistoryComponent, OwnMessageTemplateComponent, OtherMessageTemplateComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

}
