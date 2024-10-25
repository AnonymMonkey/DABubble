import { Component } from '@angular/core';
import { ChannelDescriptionComponent } from '../channel-description.component';
import { ChannelService } from '../../../../../shared/services/channel-service/channel.service';
import { Channel } from '../../../../../shared/models/channel.model';

@Component({
  selector: 'app-channel-display-name',
  standalone: true,
  imports: [ChannelDescriptionComponent],
  templateUrl: './channel-display-name.component.html',
  styleUrl: './channel-display-name.component.scss'
})
export class ChannelDisplayNameComponent {

  currentChannel: Channel | undefined;

  constructor(public description: ChannelDescriptionComponent, private channelService: ChannelService) {}

  ngOnInit(): void {
    this.channelService.currentChannel$.subscribe({
      next: (channel) => {
        this.currentChannel = channel;
      }
    });
  }

}
