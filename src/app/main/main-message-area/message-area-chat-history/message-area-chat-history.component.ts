import { CommonModule, NgClass, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ThreadComponent } from '../thread/thread.component';
import { MainMessageAreaComponent } from '../main-message-area.component';

@Component({
  selector: 'app-message-area-chat-history',
  standalone: true,
  imports: [MatIcon, NgClass, MatSidenavModule, NgFor, CommonModule, ThreadComponent, MainMessageAreaComponent],
  templateUrl: './message-area-chat-history.component.html',
  styleUrls: ['./message-area-chat-history.component.scss'],
})
export class MessageAreaChatHistoryComponent {
  isEmojiContainerVisible: number = 0;

  constructor(public mainMessageArea: MainMessageAreaComponent) {}
  showEmojiContainer(id: number) {
    this.isEmojiContainerVisible = id;
  }

  hideEmojiContainer() {
    this.isEmojiContainerVisible = 0;
  }
}
