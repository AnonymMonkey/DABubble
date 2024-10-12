import { Component, ViewChild } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import { MessageAreaHeaderComponent } from './message-area-header/message-area-header.component';
import { MessageAreaChatHistoryComponent } from './message-area-chat-history/message-area-chat-history.component';
import { MessageAreaNewMessageComponent } from './message-area-new-message/message-area-new-message.component';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { NgIf } from '@angular/common';
import { ThreadComponent } from './thread/thread.component';


@Component({
  selector: 'app-main-message-area',
  standalone: true,
  imports: [MatCardModule, NgIf, ThreadComponent, MessageAreaHeaderComponent, MessageAreaChatHistoryComponent, MessageAreaNewMessageComponent, MatSidenavModule ],
  templateUrl: './main-message-area.component.html',
  styleUrl: './main-message-area.component.scss'
})
export class MainMessageAreaComponent {
  events: string[] = [];
  opened: boolean = false;

  shouldRun = true;

  @ViewChild('sidenav') sidenav!: MatSidenav;

  toggleSidenav() {
    this.sidenav.toggle();
  }
}
