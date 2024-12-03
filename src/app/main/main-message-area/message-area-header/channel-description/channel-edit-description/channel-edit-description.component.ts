import { Component, OnInit } from '@angular/core';
import { ChannelDescriptionComponent } from '../channel-description.component';
import { Channel } from '../../../../../shared/models/channel.model';
import { ChannelService } from '../../../../../shared/services/channel-service/channel.service';
import { UserService } from '../../../../../shared/services/user-service/user.service'; // UserService importieren
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-channel-edit-description',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './channel-edit-description.component.html',
  styleUrls: ['./channel-edit-description.component.scss'],
})
export class ChannelEditDescriptionComponent implements OnInit {
  currentChannel: Channel | undefined;
  newDescription: string = '';
  adminUserName: string = ''; // Variable für den Usernamen

  constructor(
    public description: ChannelDescriptionComponent,
    private channelService: ChannelService,
    private userService: UserService // UserService in den Konstruktor injizieren
  ) {}

  /**
   * Initializes the component by subscribing to the current channel.
   */
  ngOnInit(): void {
    this.channelService.currentChannel$.subscribe({
      next: (channel) => {
        this.currentChannel = channel;
        this.newDescription = channel?.description || '';
        if (channel?.admin?.userId) {
          this.userService.getUserDataByUID(channel.admin.userId).subscribe({
            next: (userData) => {
              this.adminUserName = userData?.displayName || 'Unbekannt'; // Username zuweisen oder 'Unbekannt' falls nicht vorhanden
            },
          });
        }
      },
    });
  }

  /**
   * Updates the channel description in Firestore if the new description is different from the current description.
   */
  saveDescription(): void {
    if (
      this.currentChannel &&
      this.newDescription !== this.currentChannel.description
    ) {
      this.channelService
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
