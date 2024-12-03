import { Component, inject } from '@angular/core';
import { ChannelDescriptionComponent } from '../channel-description.component';
import { ChannelService } from '../../../../../shared/services/channel-service/channel.service';
import { Channel } from '../../../../../shared/models/channel.model';
import { NgIf } from '@angular/common';
import { UserService } from '../../../../../shared/services/user-service/user.service';

@Component({
  selector: 'app-channel-display-name',
  standalone: true,
  imports: [NgIf],
  templateUrl: './channel-display-name.component.html',
  styleUrl: './channel-display-name.component.scss'
})
export class ChannelDisplayNameComponent {
  userService = inject(UserService);
  currentChannel: Channel | undefined;

  constructor(public description: ChannelDescriptionComponent, private channelService: ChannelService) {}

  /**
   * Initializes the component by subscribing to the current channel.
   */
  ngOnInit(): void {
    this.channelService.currentChannel$.subscribe({
      next: (channel) => {
        this.currentChannel = channel;
      }
    });
  }

  /**
   * Checks if the current user is an admin of the current channel.
   * @returns True if the current user is an admin, false otherwise.
   */
  userIsAdmin() {
    return this.currentChannel?.admin?.userId === this.userService.userId;
  }
}
