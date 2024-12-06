import { Component, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ChannelDescriptionComponent } from '../channel-description.component';
import { Channel } from '../../../../../shared/models/channel.model';
import { ChannelService } from '../../../../../shared/services/channel-service/channel.service';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-channel-edit-name',
  standalone: true,
  imports: [MatIcon, FormsModule],
  templateUrl: './channel-edit-name.component.html',
  styleUrl: './channel-edit-name.component.scss'
})
export class ChannelEditNameComponent implements OnInit {
  currentChannel: Channel | undefined;
  newChannelName: string = '';
  channelSubscription: Subscription | undefined;

  constructor(public description: ChannelDescriptionComponent, private channelService: ChannelService) {}

  /**
   * Initializes the component by subscribing to the current channel.
   */
  ngOnInit(): void {
    this.channelSubscription = this.channelService.currentChannel$.subscribe({
      next: (channel) => {
        this.currentChannel = channel;
        this.newChannelName = channel?.channelName || '';
      }
    });
  }

  /**
   * Unsubscribes from the current channel subscription.
   */
  ngOnDestroy(): void {
    if (this.channelSubscription) this.channelSubscription?.unsubscribe();
  }

  /**
   * Updates the channel name in Firestore if the new name is different from the current name.
   */
  saveChannelName(): void {
    if (this.currentChannel && this.newChannelName !== this.currentChannel.channelName) {
      this.channelService.updateChannelName(this.currentChannel.channelId, this.newChannelName)
        .catch((error) => {
          console.error('Fehler beim Aktualisieren des Channel-Namens:', error);
        });
    }
  }
}
