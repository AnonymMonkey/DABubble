import { Component, OnInit } from '@angular/core';
import { ChannelDescriptionComponent } from '../channel-description.component';
import { Channel } from '../../../../../shared/models/channel.model';
import { ChannelService } from '../../../../../shared/services/channel-service/channel.service';
import { UserService } from '../../../../../shared/services/user-service/user.service';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-channel-edit-description',
  standalone: true,
  imports: [FormsModule, MatIcon],
  templateUrl: './channel-edit-description.component.html',
  styleUrls: ['./channel-edit-description.component.scss'],
})
export class ChannelEditDescriptionComponent implements OnInit {
  currentChannel: Channel | undefined;
  newDescription: string = '';
  adminUserName: string = '';
  channnelSubscription: Subscription | undefined;
  userDataSubscription: Subscription | undefined;
  channelDescriptionSubscription: Subscription | undefined;

  constructor(
    public description: ChannelDescriptionComponent,
    private channelService: ChannelService,
    private userService: UserService 
  ) {}

  /**
   * Initializes the component by subscribing to the current channel.
   */
  ngOnInit(): void {
    this.channnelSubscription = this.channelService.currentChannel$.subscribe({
      next: (channel) => {
        this.currentChannel = channel;
        this.newDescription = channel?.description || '';
        if (channel?.admin?.userId) {
          this.userDataSubscription = this.userService.getUserDataByUID(channel.admin.userId).subscribe({
            next: (userData) => {
              this.adminUserName = userData?.displayName || 'Unbekannt';
            },
          });
        }
      },
    });
  }

  /**
   * Unsubscribes from the current channel and user data subscriptions.
   */
  ngOnDestroy(): void {
    if (this.channnelSubscription) this.channnelSubscription.unsubscribe();
    if (this.userDataSubscription) this.userDataSubscription.unsubscribe();
    if (this.channelDescriptionSubscription)
      this.channelDescriptionSubscription.unsubscribe();
  }

  /**
   * Updates the channel description in Firestore if the new description is different from the current description.
   */
  saveDescription(): void {
    if (
      this.currentChannel &&
      this.newDescription !== this.currentChannel.description
    ) {
      this.channelDescriptionSubscription =  this.channelService
        .updateChannelDescription(
          this.currentChannel.channelId,
          this.newDescription
        )
        .subscribe(() => {
          console.log('Beschreibung aktualisiert');
        });
    }
  }
}
