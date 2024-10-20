import { Component } from '@angular/core';
import { ChannelDescriptionComponent } from '../channel-description.component';
import { Channel } from '../../../../../shared/models/channel.model';
import { ChannelService } from '../../../../../shared/services/channel-service/channel.service';

@Component({
  selector: 'app-channel-edit-description',
  standalone: true,
  imports: [ChannelDescriptionComponent],
  templateUrl: './channel-edit-description.component.html',
  styleUrl: './channel-edit-description.component.scss'
})
export class ChannelEditDescriptionComponent {

  currentChannel: Channel | null = null

  constructor(public description: ChannelDescriptionComponent, private channelService: ChannelService) {}

  ngOnInit(): void {
    this.channelService.currentChannel$.subscribe({
      next: (channel) => {
        this.currentChannel = channel;
      }
    });
  }
}
