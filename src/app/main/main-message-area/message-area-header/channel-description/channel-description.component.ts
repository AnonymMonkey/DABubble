import { Component, inject, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MessageAreaHeaderComponent } from '../message-area-header.component';
import { ChannelEditDescriptionComponent } from './channel-edit-description/channel-edit-description.component';
import { ChannelDisplayDescriptionComponent } from './channel-display-description/channel-display-description.component';
import { ChannelEditNameComponent } from './channel-edit-name/channel-edit-name.component';
import { ChannelDisplayNameComponent } from './channel-display-name/channel-display-name.component';
import { NgIf } from '@angular/common';
import { Channel } from '../../../../shared/models/channel.model';
import { ChannelService } from '../../../../shared/services/channel-service/channel.service';
import { UserService } from '../../../../shared/services/user-service/user.service';
import { Firestore, doc, updateDoc, arrayRemove, collection } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { deleteDoc, getDoc } from 'firebase/firestore';


@Component({
  selector: 'app-channel-description',
  standalone: true,
  imports: [MatIcon, MatExpansionModule, NgIf, MatMenuTrigger, MatMenu, ChannelEditDescriptionComponent, ChannelDisplayDescriptionComponent, ChannelEditNameComponent, ChannelDisplayNameComponent],
  templateUrl: './channel-description.component.html',
  styleUrl: './channel-description.component.scss'
})
export class ChannelDescriptionComponent implements OnInit {
  editName: boolean = false;
  editDescription: boolean = false;
  currentChannel: Channel | undefined;
  userService = inject(UserService);
  firestore = inject(Firestore);
  router= inject(Router);

  constructor(public header: MessageAreaHeaderComponent, public channelService: ChannelService) { }

  ngOnInit(): void {
    this.channelService.currentChannel$.subscribe({
      next: (channel) => {
        this.currentChannel = channel;
      }
    });
  }


  toggleEditName() {
    this.editName = !this.editName;
  }

  toggleEditDescription() {
    this.editDescription = !this.editDescription;
  }

  confirmLeave(): void {
    this.leaveChannel(); // Hier kannst du die Funktion aufrufen, um den Channel zu verlassen
  }

  async leaveChannel(): Promise<void> {
    const currentUserId = this.userService.userId;
    const channelId = this.currentChannel?.channelId;
  
    if (!currentUserId || !channelId) {
      console.error('Benutzer-ID oder Channel-ID fehlt.');
      return;
    }
  
    try {
      // Entfernen des Benutzers aus dem Channel-Mitglieder-Array
      const channelDocRef = doc(this.firestore, `channels/${channelId}`);
      await updateDoc(channelDocRef, {
        members: arrayRemove(currentUserId),
      });
      console.log('Benutzer aus Channel-Mitgliedern entfernt');
  
      // Entfernen des Channels aus der Liste der Channels des Benutzers
      const userDocRef = doc(this.firestore, `users/${currentUserId}`);
      await updateDoc(userDocRef, {
        channels: arrayRemove(channelId),
      });
      console.log('Channel aus Benutzer-Channels entfernt');
  
      // Überprüfen, ob es keine Mitglieder mehr im Channel gibt
      const channelSnapshot = await getDoc(channelDocRef);
      const members = channelSnapshot.data()?.['members'] || [];
  
      if (members.length === 0) {
        // Löschen des Channels, da keine Mitglieder mehr vorhanden sind
        await deleteDoc(channelDocRef);
        console.log('Channel wurde gelöscht, da keine Mitglieder mehr vorhanden sind');
      }
  
      // Navigation zur Hauptseite des Benutzers
      await this.router.navigate([`/main/${currentUserId}`]);
      console.log('Zur Hauptseite des Benutzers navigiert');
  
    } catch (error) {
      console.error('Fehler beim Verlassen des Channels:', error);
    }
  }
  
}
