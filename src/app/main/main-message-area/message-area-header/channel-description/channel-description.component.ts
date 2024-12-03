import { Component, inject, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
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
import {
  Firestore,
  doc,
  updateDoc,
  arrayRemove,
  collection,
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { arrayUnion, deleteDoc, getDoc, getDocs } from 'firebase/firestore';

@Component({
  selector: 'app-channel-description',
  standalone: true,
  imports: [
    MatIcon,
    MatExpansionModule,
    NgIf,
    MatMenuTrigger,
    MatMenu,
    ChannelEditDescriptionComponent,
    ChannelDisplayDescriptionComponent,
    ChannelEditNameComponent,
    ChannelDisplayNameComponent,
  ],
  templateUrl: './channel-description.component.html',
  styleUrl: './channel-description.component.scss',
})
export class ChannelDescriptionComponent implements OnInit {
  editName: boolean = false;
  editDescription: boolean = false;
  currentChannel: Channel | undefined;
  userService = inject(UserService);
  firestore = inject(Firestore);
  router = inject(Router);
  currentBorderRadius: string = '30px 30px 30px 30px';

  constructor(
    public header: MessageAreaHeaderComponent,
    public channelService: ChannelService
  ) {}

  /**
   * Initializes the component and subscribes to the current channel.
   */
  ngOnInit(): void {
    this.channelService.currentChannel$.subscribe({
      next: (channel) => {
        this.currentChannel = channel;
      },
    });
  }

  /**
   * Toggles the editing of the channel name.
   */
  toggleEditName() {
    this.editName = !this.editName;
  }

  /**
   * Toggles the editing of the channel description.
   */
  toggleEditDescription() {
    this.editDescription = !this.editDescription;
  }

  /**
   * Confirms that the user wants to leave the channel and checks if the current user ID and channel ID are available.
   */
  confirmLeave(): void {
    const currentUserId = this.userService.userId;
    const channelId = this.currentChannel?.channelId;
    if (!currentUserId || !channelId) {
      console.error('Benutzer-ID oder Channel-ID fehlt.');
      return;
    }
    this.leaveChannel(currentUserId, channelId);
  }

  /** 
   * Leaves the channel and deletes the channel if it has no members.
   * @param currentUserId The ID of the current user.
   * @param channelId The ID of the channel to leave.
   */
  async leaveChannel(currentUserId: string, channelId: string): Promise<void> {
    try {
      await this.router.navigate([`/main/${currentUserId}`]);
      const channelDocRef = doc(this.firestore, `channels/${channelId}`);
      await updateDoc(channelDocRef, {
        members: arrayRemove(currentUserId),
        usersLeft: arrayUnion(currentUserId),
      });
      const userDocRef = doc(this.firestore, `users/${currentUserId}`);
      await updateDoc(userDocRef, {
        channels: arrayRemove(channelId),
      });
      await this.checkIfMembersList(channelDocRef, channelId);
    } catch (error) {
      console.error('Fehler beim Verlassen des Channels:', error);
    }
  }

  /**
   * Checks if the channel has no members and deletes the channel if it has no members.
   * @param channelDocRef The reference to the channel document in Firestore.
   * @param channelId The ID of the channel.
   */
  async checkIfMembersList(channelDocRef: any, channelId: string) {
    const channelSnapshot: any = await getDoc(channelDocRef);
    const members = channelSnapshot.data()?.['members'] || [];
    if (members.length === 0) {
      const messagesCollectionRef = collection(
        this.firestore,
        `channels/${channelId}/messages`
      );
      const messagesSnapshot = await getDocs(messagesCollectionRef);
      const deleteMessagesPromises = messagesSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deleteMessagesPromises);
      await deleteDoc(channelDocRef);
    }
  }

  /**
   * Toggles the border radius based on the menu type.
   * @param menuType The type of the menu.
   */
  toggleBorder(menuType: string) {
    switch (menuType) {
      case 'leave-channel':
        this.currentBorderRadius = '30px 30px 30px 30px';
        break;
      default:
        this.currentBorderRadius = '30px 30px 30px 30px';
    }
    document.documentElement.style.setProperty(
      '--border-radius',
      this.currentBorderRadius
    );
  }
}
