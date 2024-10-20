import { Component, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ChannelDescriptionComponent } from '../channel-description.component';
import { Channel } from '../../../../../shared/models/channel.model';
import { ChannelService } from '../../../../../shared/services/channel-service/channel.service';

@Component({
  selector: 'app-channel-edit-name',
  standalone: true,
  imports: [MatIcon, ChannelDescriptionComponent],
  templateUrl: './channel-edit-name.component.html',
  styleUrl: './channel-edit-name.component.scss'
})
export class ChannelEditNameComponent implements OnInit {

  currentChannel: Channel | null = null;

  constructor(public description: ChannelDescriptionComponent, private channelService: ChannelService) {}


  ngOnInit(): void {
    this.channelService.currentChannel$.subscribe({
      next: (channel) => {
        this.currentChannel = channel;
      }
    });
  }
}
