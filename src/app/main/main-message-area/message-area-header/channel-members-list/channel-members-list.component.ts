import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MessageAreaHeaderComponent } from '../message-area-header.component';

@Component({
  selector: 'app-channel-members-list',
  standalone: true,
  imports: [MatIcon, MessageAreaHeaderComponent],
  templateUrl: './channel-members-list.component.html',
  styleUrl: './channel-members-list.component.scss'
})
export class ChannelMembersListComponent {
  constructor(public header: MessageAreaHeaderComponent) {}
}
