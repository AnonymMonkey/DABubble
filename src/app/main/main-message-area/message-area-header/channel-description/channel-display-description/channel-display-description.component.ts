import { Component, OnInit, inject } from '@angular/core';
import { ChannelDescriptionComponent } from '../channel-description.component';
import { ChannelService } from '../../../../../shared/services/channel-service/channel.service';
import { Channel } from '../../../../../shared/models/channel.model';
import { NgIf } from '@angular/common';
import { UserService } from '../../../../../shared/services/user-service/user.service';
import { MatIcon } from '@angular/material/icon';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-channel-display-description',
  standalone: true,
  imports: [NgIf, MatIcon],
  templateUrl: './channel-display-description.component.html',
  styleUrls: ['./channel-display-description.component.scss'],
})
export class ChannelDisplayDescriptionComponent implements OnInit {
  userService = inject(UserService);
  currentChannel: Channel | undefined;
  adminUserName: string = '';
  channelSubscription: Subscription | undefined;
  userDataSubscription: Subscription | undefined;
  channelDataSubscription: Subscription | undefined;

  constructor(
    public description: ChannelDescriptionComponent,
    private channelService: ChannelService
  ) {}

  /**
   * Initialize the component and subscribe to the current channel.
   */
  ngOnInit(): void {
    this.channelSubscription = this.channelService.currentChannel$.subscribe({
      next: (channel) => {
        this.currentChannel = channel;
        if (channel?.admin?.userId) {
          this.userDataSubscription = this.userService.getUserDataByUID(channel.admin.userId).subscribe({
            next: (userData) => {
              this.adminUserName = userData?.displayName || 'Unbekannt';
            },
          });
        }
      },
      error: (error) => console.error('Fehler beim Laden des Channels:', error),
    });
  }

  /**
   * Unsubscribe from the current channel and user data subscriptions.
   */
  ngOnDestroy(): void {
    if (this.channelSubscription) this.channelSubscription.unsubscribe();
    if (this.userDataSubscription) this.userDataSubscription.unsubscribe();
    if (this.channelDataSubscription) this.channelDataSubscription.unsubscribe();
  }

  /**
   * Actualise the channel description.
   */
  updateDescription(newDescription: string): void {
    if (this.currentChannel) {
       this.channelDataSubscription = this.channelService
        .updateChannelDescription(this.currentChannel.channelId, newDescription)
        .subscribe({
          error: (error) =>
            console.error('Fehler beim Aktualisieren der Beschreibung:', error),
        });
    }
  }

  /**
   * Check if the current user is the admin of the channel.
   * @returns True if the current user is the admin of the channel, false otherwise.
   */
  userIsAdmin(): boolean {
    return this.currentChannel?.admin?.userId === this.userService.userId;
  }
}
