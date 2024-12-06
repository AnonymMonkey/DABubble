import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MessageAreaHeaderComponent } from '../message-area-header.component';
import { Channel } from '../../../../shared/models/channel.model';
import { ChannelService } from '../../../../shared/services/channel-service/channel.service';
import { NgFor, NgIf } from '@angular/common';
import { UserService } from '../../../../shared/services/user-service/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-channel-members-list',
  standalone: true,
  imports: [MatIcon, NgFor, NgIf],
  templateUrl: './channel-members-list.component.html',
  styleUrls: ['./channel-members-list.component.scss'],
})
export class ChannelMembersListComponent implements OnInit, OnDestroy {
  @Input() responsiveView: boolean = false;
  currentChannel: Channel | undefined;
  currentUserId: string | undefined;
  membersWithData: any[] = [];
  isChannelLoaded = false;
  private userDataSubscription: Subscription | undefined;
  private channelSubscription: Subscription | undefined;
  currentBorderRadius: string = '30px 30px 30px 30px';

  constructor(
    public header: MessageAreaHeaderComponent,
    public channelService: ChannelService,
    private userService: UserService
  ) {}

  /**
   * Initialize the component and load user data.
   */
  ngOnInit(): void {
    this.currentUserId = this.userService.userId;
    this.channelSubscription = this.channelService.currentChannel$.subscribe({
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

  /**
   * Load user data for the channel members.
   */
  loadMemberData(): void {
    if (
      !this.isChannelLoaded ||
      !this.currentChannel?.members ||
      this.currentChannel.members.length === 0
    )
      return;
    this.membersWithData = [];
    const seenUserIds = new Set<string>();
    this.getUserDetails(seenUserIds);
  }

  /**
   * Retrieve user details for the channel members.
   * @param seenUserIds - Set of user IDs already seen.
   */
  getUserDetails(seenUserIds: Set<string>): void {
    this.userDataSubscription = this.userService.userDataMap$.subscribe({
      next: (userDataMap) => {
        this.currentChannel?.members.forEach((userId) => {
          if (seenUserIds.has(userId)) return;
          seenUserIds.add(userId);
          const userData = userDataMap.get(userId) || {
            displayName: 'Unbekannter Benutzer',
            photoURL: 'src/assets/img/profile/placeholder-img.webp', 
          };
          this.membersWithData.push({
            userId,
            userName: userData.displayName,
            photoURL: userData.photoURL,
          });
        });
      },
    });
  }

  /**
   * Clean up subscriptions on component destroy.
   */
  ngOnDestroy(): void {
    if (this.userDataSubscription) this.userDataSubscription.unsubscribe();
    if (this.channelSubscription) this.channelSubscription.unsubscribe();
  }

  /**
   * Sorts the members by the current user and returns the sorted array.
   */
  get sortedMembers() {
    if (!this.membersWithData || this.membersWithData.length === 0) return [];
    const currentUser = this.membersWithData.find(
      (user) => user.userId === this.currentUserId
    );
    const otherMembers = this.membersWithData.filter(
      (user) => user.userId !== this.currentUserId
    );
    return currentUser
      ? [
          { ...currentUser, userName: `${currentUser.userName} (Du)` },
          ...otherMembers,
        ]
      : otherMembers;
  }

  /**
   * Handles the click event for the "Add Member" button.
   */
  onAddMemberClick(event: Event): void {
    event.stopPropagation();
    this.header.closeMenu('member-list');
    this.header.openMenu('add-member');
    this.toggleBorder('add-member');
  }

  /**
   * Toggles the border radius based on the menu type.
   * @param menuType - The type of the menu.
   */
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
