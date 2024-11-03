import { Component } from '@angular/core';
import { ChannelDescriptionComponent } from '../channel-description.component';
import { Channel } from '../../../../../shared/models/channel.model';
import { ChannelService } from '../../../../../shared/services/channel-service/channel.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-channel-edit-description',
  standalone: true,
  imports: [ChannelDescriptionComponent, FormsModule],
  templateUrl: './channel-edit-description.component.html',
  styleUrl: './channel-edit-description.component.scss'
})
export class ChannelEditDescriptionComponent {

  currentChannel: Channel | undefined;
  newDescription: string = '';

  constructor(public description: ChannelDescriptionComponent, private channelService: ChannelService) {}

  ngOnInit(): void {
    this.channelService.currentChannel$.subscribe({
      next: (channel) => {
        this.currentChannel = channel;
        this.newDescription = channel?.description || '';
      }
    });
  }

  saveDescription(): void {
    if (this.currentChannel && this.newDescription !== this.currentChannel.description) {
      this.channelService.updateChannelDescription(this.currentChannel.channelId, this.newDescription)
        .subscribe(() => {
          console.log('Beschreibung aktualisiert');
        });
    }
  }
}
