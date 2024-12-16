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
  private sortedMembersCache: any[] = [];
  private lastMemberData: any[] = [];
  private lastCurrentUserId: string | undefined;

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
            photoURL: 'assets/img/profile/placeholder-img.webp',
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
   * Checks if the members list or the current user ID has changed.
   * @returns {boolean} - True if the data has changed, otherwise false.
   */
  hasDataChanged(): boolean {
    return (
      this.membersWithData !== this.lastMemberData ||
      this.currentUserId !== this.lastCurrentUserId
    );
  }

  /**
   * Updates the cache for sorted members if the data has changed.
   */
  updateSortedMembersCache(): void {
    if (!this.hasDataChanged()) return;

    this.lastMemberData = this.membersWithData;
    this.lastCurrentUserId = this.currentUserId;

    const currentUser = this.findCurrentUser();
    const otherMembers = this.getOtherMembers();

    this.sortedMembersCache = currentUser
      ? [
          { ...currentUser, userName: `${currentUser.userName} (Du)` },
          ...otherMembers,
        ]
      : otherMembers;
  }

  /**
   * Finds the current user in the members list.
   * @returns {any | undefined} - The current user object or undefined if not found.
   */
  findCurrentUser(): any | undefined {
    return this.membersWithData.find(
      (user) => user.userId === this.currentUserId
    );
  }

  /**
   * Filters and returns all members except the current user.
   * @returns {any[]} - An array of other members.
   */
  getOtherMembers(): any[] {
    return this.membersWithData.filter(
      (user) => user.userId !== this.currentUserId
    );
  }

  /**
   * Returns the sorted list of members, updating the cache if necessary.
   * @returns {any[]} - The sorted list of members.
   */
  get sortedMembers(): any[] {
    this.updateSortedMembersCache();
    return this.sortedMembersCache;
  }

  /**
   * Handles the click event for the "Add Member" button.
   */
  onAddMemberClick(event: Event): void {
    event.stopPropagation();
    this.channelService.addMemberMenu = true;
    this.header.closeMenu('member-list');
    this.header.openMenu('add-member');
    this.toggleBorder('add-member');
    this.toggleBorder('add-member');
  }

  /**
   * Toggles the border radius based on the menu type.
   * @param menuType - The type of the menu.
   */
  toggleBorder(menuType: string) {
    const isMinWidth600px = window.matchMedia('(min-width: 600px)').matches;
    if (isMinWidth600px) {
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
    } else this.responsiveBorderRadius();
  }

  /**
   * Sets the border radius based on the menu type for responsive view.
   * @param menuType - The type of the menu.
   */
  responsiveBorderRadius() {
    this.currentBorderRadius = '0px 0px 30px 30px';
    document.documentElement.style.setProperty(
      '--border-radius',
      this.currentBorderRadius
    );
  }
}
