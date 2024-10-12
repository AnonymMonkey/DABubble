import { Component } from '@angular/core';
import { MessageAreaHeaderComponent } from '../message-area-header.component';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-channel-new-member',
  standalone: true,
  imports: [MessageAreaHeaderComponent, MatIcon],
  templateUrl: './channel-new-member.component.html',
  styleUrl: './channel-new-member.component.scss'
})
export class ChannelNewMemberComponent {

  constructor(public header: MessageAreaHeaderComponent) { }
}
