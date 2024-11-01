import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MessageAreaHeaderComponent } from '../message-area-header.component';
import { Channel } from '../../../../shared/models/channel.model';
import { ChannelService } from '../../../../shared/services/channel-service/channel.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-channel-members-list',
  standalone: true,
  imports: [MatIcon, MessageAreaHeaderComponent, NgFor],
  templateUrl: './channel-members-list.component.html',
  styleUrl: './channel-members-list.component.scss'
})
export class ChannelMembersListComponent {
  currentChannel: Channel | undefined;

  constructor(public header: MessageAreaHeaderComponent, public channelService: ChannelService) {}

  ngOnInit(): void {
    this.channelService.currentChannel$.subscribe({
      next: (channel) => {
        this.currentChannel = channel;
      }
    })
  }
}
