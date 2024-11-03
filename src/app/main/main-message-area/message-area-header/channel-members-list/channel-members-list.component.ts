import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MessageAreaHeaderComponent } from '../message-area-header.component';
import { Channel } from '../../../../shared/models/channel.model';
import { ChannelService } from '../../../../shared/services/channel-service/channel.service';
import { NgFor, NgIf } from '@angular/common';
import { UserService } from '../../../../shared/services/user-service/user.service'; // Importiere den UserService

@Component({
  selector: 'app-channel-members-list',
  standalone: true,
  imports: [MatIcon, MessageAreaHeaderComponent, NgFor, NgIf],
  templateUrl: './channel-members-list.component.html',
  styleUrls: ['./channel-members-list.component.scss']
})
export class ChannelMembersListComponent {
  currentChannel: Channel | undefined;
  currentUserId: string | undefined; // Variable für die ID des aktuellen Benutzers

  constructor(
    public header: MessageAreaHeaderComponent,
    public channelService: ChannelService,
    private userService: UserService // UserService injizieren
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.userService.userId; // Setze die ID des aktuellen Benutzers

    this.channelService.currentChannel$.subscribe({
      next: (channel) => {
        this.currentChannel = channel;
      }
    });
  }

  get sortedMembers() {
    if (!this.currentChannel?.members) return [];
  
    // Finde den angemeldeten Benutzer
    const currentUser = this.currentChannel.members.find(user => user.userId === this.currentUserId);
  
    // Entferne den angemeldeten Benutzer aus der Mitgliederliste
    const otherMembers = this.currentChannel.members.filter(user => user.userId !== this.currentUserId);
  
    // Erstelle eine neue Liste mit dem aktuellen Benutzer und anderen Mitgliedern
    return currentUser ? [{ ...currentUser, userName: `${currentUser.userName} (Du)` }, ...otherMembers] : otherMembers;
  }
}
