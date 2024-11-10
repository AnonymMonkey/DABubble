import { Component, OnInit } from '@angular/core';
import { ChannelDescriptionComponent } from '../channel-description.component';
import { Channel } from '../../../../../shared/models/channel.model';
import { ChannelService } from '../../../../../shared/services/channel-service/channel.service';
import { UserService } from '../../../../../shared/services/user-service/user.service';  // UserService importieren
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-channel-edit-description',
  standalone: true,
  imports: [ChannelDescriptionComponent, FormsModule],
  templateUrl: './channel-edit-description.component.html',
  styleUrls: ['./channel-edit-description.component.scss']
})
export class ChannelEditDescriptionComponent implements OnInit {

  currentChannel: Channel | undefined;
  newDescription: string = '';
  adminUserName: string = '';  // Variable für den Usernamen

  constructor(
    public description: ChannelDescriptionComponent,
    private channelService: ChannelService,
    private userService: UserService  // UserService in den Konstruktor injizieren
  ) {}

  ngOnInit(): void {
    this.channelService.currentChannel$.subscribe({
      next: (channel) => {
        this.currentChannel = channel;
        this.newDescription = channel?.description || '';

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
