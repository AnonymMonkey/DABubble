import { CommonModule, NgClass, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ThreadComponent } from '../thread/thread.component';
import { MainMessageAreaComponent } from '../main-message-area.component';
import { OtherMessageTemplateComponent } from '../chat-components/other-message-template/other-message-template.component';
import { OwnMessageTemplateComponent } from '../chat-components/own-message-template/own-message-template.component';

@Component({
  selector: 'app-message-area-chat-history',
  standalone: true,
  imports: [MatIcon, NgClass, NgFor, MatSidenavModule, NgFor, CommonModule, ThreadComponent, MainMessageAreaComponent, OtherMessageTemplateComponent, OwnMessageTemplateComponent],
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
