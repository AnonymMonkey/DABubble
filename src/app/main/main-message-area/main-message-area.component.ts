import { Component } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import { MessageAreaHeaderComponent } from './message-area-header/message-area-header.component';
import { MessageAreaChatHistoryComponent } from './message-area-chat-history/message-area-chat-history.component';
import { MessageAreaNewMessageComponent } from './message-area-new-message/message-area-new-message.component';


@Component({
  selector: 'app-main-message-area',
  standalone: true,
  imports: [MatCardModule, MessageAreaHeaderComponent, MessageAreaChatHistoryComponent, MessageAreaNewMessageComponent],
  templateUrl: './main-message-area.component.html',
  styleUrl: './main-message-area.component.scss'
})
export class MainMessageAreaComponent {

}
