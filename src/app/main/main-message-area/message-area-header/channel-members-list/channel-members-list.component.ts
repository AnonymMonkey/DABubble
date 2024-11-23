import { Component, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MessageAreaHeaderComponent } from '../message-area-header.component';
import { Channel } from '../../../../shared/models/channel.model';
import { ChannelService } from '../../../../shared/services/channel-service/channel.service';
import { NgFor, NgIf } from '@angular/common';
import { UserService } from '../../../../shared/services/user-service/user.service';
import { forkJoin, map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-channel-members-list',
  standalone: true,
  imports: [MatIcon, NgFor, NgIf],
  templateUrl: './channel-members-list.component.html',
  styleUrls: ['./channel-members-list.component.scss'],
})
export class ChannelMembersListComponent implements OnInit {
  currentChannel: Channel | undefined;
  currentUserId: string | undefined; 
  membersWithData: any[] = []; 
  isChannelLoaded = false;

  currentBorderRadius: string = '30px 30px 30px 30px';

  constructor(
    public header: MessageAreaHeaderComponent,
    public channelService: ChannelService,
    private userService: UserService 
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.userService.userId;
    this.channelService.currentChannel$.subscribe({
      next: (channel) => {
        if (channel) {
          this.currentChannel = channel;
          this.isChannelLoaded = true;
          this.loadMemberData(); 
        }
      },
      error: (error) => {
        console.error('Fehler beim Abrufen des Kanals:', error);
      },
    });
  }

  loadMemberData(): void {
    if (
      !this.isChannelLoaded ||
      !this.currentChannel?.members ||
      this.currentChannel.members.length === 0
    ) {
      console.error('Kanal nicht geladen oder keine Mitglieder im Kanal gefunden.');
      return;
    }
  
    // Leere das Array zu Beginn
    this.membersWithData = [];
  
    // Ein Set verwenden, um doppelte Benutzer zu verhindern
    const seenUserIds = new Set<string>();
  
    // Iteriere über jedes Mitglied in der Liste
    this.currentChannel.members.forEach((userId) => {
      // Wenn der userId bereits im Set ist, überspringe ihn
      if (seenUserIds.has(userId)) {
        return;
      }
  
      // Füge die userId zum Set hinzu, um doppelte IDs zu vermeiden
      seenUserIds.add(userId);
  
      // Hole Benutzerdaten für jedes Mitglied
      this.userService.getUserDataByUID(userId).subscribe({
        next: (userData) => {
          if (userData) {
            // Stelle sicher, dass der Benutzer nicht bereits in der Liste vorhanden ist
            if (!this.membersWithData.some((user) => user.userId === userId)) {
              this.membersWithData.push({
                userId,
                userName: `${userData.displayName}`,
                photoURL: userData.photoURL,
              });
            }
          } else {
            console.error('Benutzerdaten für userId nicht gefunden:', userId);
            // Füge auch hier nur hinzu, wenn der Benutzer nicht schon existiert
            if (!this.membersWithData.some((user) => user.userId === userId)) {
              this.membersWithData.push({
                userId,
                userName: 'Unbekannter Benutzer',
                photoURL: null,
              });
            }
          }
        },
        error: (error) => {
          console.error('Fehler beim Abrufen der Benutzerdaten:', error);
        },
      });
    });
  }
  
  

  get sortedMembers() {
    if (!this.membersWithData || this.membersWithData.length === 0) return [];
  
    // Trenne den aktuellen Benutzer von den anderen
    const currentUser = this.membersWithData.find(
      (user) => user.userId === this.currentUserId
    );
  
    const otherMembers = this.membersWithData.filter(
      (user) => user.userId !== this.currentUserId
    );
  
    return currentUser
      ? [{ ...currentUser, userName: `${currentUser.userName} (Du)` }, ...otherMembers]
      : otherMembers;
  }
  
  
  

  onAddMemberClick(event: Event): void {
    event.stopPropagation();
    this.header.closeMenu('member-list');
    this.header.openMenu('add-member');
    this.toggleBorder('add-member');
  }

  toggleBorder(menuType: string) {
    switch (menuType) {
      case 'add-member':
        this.currentBorderRadius = '30px 0px 30px 30px';
        break;
      default:
        this.currentBorderRadius = '0px 30px 30px 30px';
    }
    document.documentElement.style.setProperty(
      '--border-radius',
      this.currentBorderRadius
    );
  }
}
