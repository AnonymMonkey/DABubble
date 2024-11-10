import { Component, OnInit, inject } from '@angular/core';
import { ChannelDescriptionComponent } from '../channel-description.component';
import { ChannelService } from '../../../../../shared/services/channel-service/channel.service';
import { Channel } from '../../../../../shared/models/channel.model';
import { NgIf } from '@angular/common';
import { UserService } from '../../../../../shared/services/user-service/user.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-channel-display-description',
  standalone: true,
  imports: [ChannelDescriptionComponent, NgIf],
  templateUrl: './channel-display-description.component.html',
  styleUrls: ['./channel-display-description.component.scss']
})
export class ChannelDisplayDescriptionComponent implements OnInit {
  userService = inject(UserService);
  currentChannel: Channel | undefined;
  adminUserName: string = ''; // Variable für den Usernamen des Admins

  constructor(
    public description: ChannelDescriptionComponent,
    private channelService: ChannelService
  ) {}

  ngOnInit(): void {
    this.channelService.currentChannel$.subscribe({
      next: (channel) => {
        this.currentChannel = channel;
        // Wenn ein admin vorhanden ist, holen wir den Usernamen
        if (channel?.admin?.userId) {
          this.userService.getUserDataByUID(channel.admin.userId).subscribe({
            next: (userData) => {
              this.adminUserName = userData?.displayName || 'Unbekannt'; // Username zuweisen oder 'Unbekannt' falls nicht vorhanden
            },
            error: (err) => {
              console.error('Fehler beim Laden des Usernamens:', err);
              this.adminUserName = 'Unbekannt'; // Default-Wert im Fehlerfall
            }
          });
        }
      },
      error: (error) => console.error('Fehler beim Laden des Channels:', error)
    });
  }

  updateDescription(newDescription: string): void {
    if (this.currentChannel) {
      this.channelService.updateChannelDescription(this.currentChannel.channelId, newDescription).subscribe({
        error: (error) => console.error('Fehler beim Aktualisieren der Beschreibung:', error)
      });
    }
  }

  userIsAdmin(): boolean {
    return this.currentChannel?.admin?.userId === this.userService.userId;
  }
}
