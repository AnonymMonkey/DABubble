import { Component } from '@angular/core';
import { ChannelDescriptionComponent } from '../channel-description.component';
import { ChannelService } from '../../../../../shared/services/channel-service/channel.service';
import { Channel } from '../../../../../shared/models/channel.model';

@Component({
  selector: 'app-channel-display-description',
  standalone: true,
  imports: [ChannelDescriptionComponent],
  templateUrl: './channel-display-description.component.html',
  styleUrl: './channel-display-description.component.scss'
})
export class ChannelDisplayDescriptionComponent {

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
