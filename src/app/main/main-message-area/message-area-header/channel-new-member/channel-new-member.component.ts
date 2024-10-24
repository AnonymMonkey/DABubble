import { Component, OnInit } from '@angular/core';
import { MessageAreaHeaderComponent } from '../message-area-header.component';
import { MatIcon } from '@angular/material/icon';
import { Channel } from '../../../../shared/models/channel.model';
import { ChannelService } from '../../../../shared/services/channel-service/channel.service';

@Component({
  selector: 'app-channel-new-member',
  standalone: true,
  imports: [MessageAreaHeaderComponent, MatIcon],
  templateUrl: './channel-new-member.component.html',
  styleUrl: './channel-new-member.component.scss'
})
export class ChannelNewMemberComponent implements OnInit {

  currentChannel: Channel | undefined;

  constructor(public header: MessageAreaHeaderComponent, private channelService: ChannelService) { }

  ngOnInit(): void {
    this.channelService.currentChannel$.subscribe({
      next: (channel) => {
        this.currentChannel = channel;
      }
    });
  }
}
