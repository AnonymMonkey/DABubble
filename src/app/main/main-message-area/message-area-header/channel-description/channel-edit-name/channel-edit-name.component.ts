import { Component, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ChannelDescriptionComponent } from '../channel-description.component';
import { Channel } from '../../../../../shared/models/channel.model';
import { ChannelService } from '../../../../../shared/services/channel-service/channel.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-channel-edit-name',
  standalone: true,
  imports: [MatIcon, ChannelDescriptionComponent, FormsModule],
  templateUrl: './channel-edit-name.component.html',
  styleUrl: './channel-edit-name.component.scss'
})
export class ChannelEditNameComponent implements OnInit {
  currentChannel: Channel | undefined;
  newChannelName: string = '';

  constructor(public description: ChannelDescriptionComponent, private channelService: ChannelService) {}


  ngOnInit(): void {
    this.channelService.currentChannel$.subscribe({
      next: (channel) => {
        this.currentChannel = channel;
        this.newChannelName = channel?.channelName || ''; // Setze den initialen Wert
      }
    });
  }

  saveChannelName(): void {
    if (this.currentChannel && this.newChannelName !== this.currentChannel.channelName) {
      this.channelService.updateChannelName(this.currentChannel.channelId, this.newChannelName)
        .catch((error) => {
          console.error('Fehler beim Aktualisieren des Channel-Namens:', error);
        });
    }
  }
}
