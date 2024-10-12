import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-message-area-chat-history',
  standalone: true,
  imports: [MatIcon, NgClass],
  templateUrl: './message-area-chat-history.component.html',
  styleUrls: ['./message-area-chat-history.component.scss'],
})
export class MessageAreaChatHistoryComponent {
  isEmojiContainerVisible: number = 0;

  showEmojiContainer(id: number) {
    this.isEmojiContainerVisible = id ;
  }

  hideEmojiContainer() {
    this.isEmojiContainerVisible = 0;
  }
}
