import { NgIf } from '@angular/common';
import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import {MatMenuModule, MatMenuTrigger} from '@angular/material/menu';


@Component({
  selector: 'app-message-area-chat-history',
  standalone: true,
  imports: [MatMenuModule, MatIcon, MatMenuTrigger, NgIf],
  templateUrl: './message-area-chat-history.component.html',
  styleUrl: './message-area-chat-history.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class MessageAreaChatHistoryComponent {
  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger = {} as MatMenuTrigger;

}
