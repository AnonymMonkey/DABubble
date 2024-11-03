import { Component, inject } from '@angular/core';
import { ChannelDescriptionComponent } from '../channel-description.component';
import { ChannelService } from '../../../../../shared/services/channel-service/channel.service';
import { Channel } from '../../../../../shared/models/channel.model';
import { NgIf } from '@angular/common';
import { UserService } from '../../../../../shared/services/user-service/user.service';

@Component({
  selector: 'app-channel-display-name',
  standalone: true,
  imports: [ChannelDescriptionComponent, NgIf],
  templateUrl: './channel-display-name.component.html',
  styleUrl: './channel-display-name.component.scss'
})
export class ChannelDisplayNameComponent {
  userService = inject(UserService);
  currentChannel: Channel | undefined;

  constructor(public description: ChannelDescriptionComponent, private channelService: ChannelService) {}

  ngOnInit(): void {
    this.channelService.currentChannel$.subscribe({
      next: (channel) => {
        this.currentChannel = channel;
      }
    });
  }

  userIsAdmin() {
    return this.currentChannel?.admin?.userId === this.userService.userId;
  }
}
