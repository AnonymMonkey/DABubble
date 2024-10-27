import { Component } from '@angular/core';
import { MessageAreaNewMessageComponent } from '../main-message-area/message-area-new-message/message-area-new-message.component';
import { MatCardModule } from '@angular/material/card';
import { MessageAreaChatHistoryComponent } from '../main-message-area/message-area-chat-history/message-area-chat-history.component';
import { NewMessageHeaderComponent } from './new-message-header/new-message-header.component';

@Component({
  selector: 'app-new-message-placeholder',
  standalone: true,
  imports: [MessageAreaNewMessageComponent, MatCardModule, MessageAreaChatHistoryComponent, NewMessageHeaderComponent],
  templateUrl: './new-message-placeholder.component.html',
  styleUrl: './new-message-placeholder.component.scss'
})
export class NewMessagePlaceholderComponent {

}
