import { Component, EventEmitter, Output } from '@angular/core';
import { ChannelService } from '../../services/channel-service/channel.service';
import { UserService } from '../../services/user-service/user.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-mention-user',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './mention-user.component.html',
  styleUrl: './mention-user.component.scss',
})
export class MentionUserComponent {
  @Output() mentionUser = new EventEmitter<string>();

  currentUserId: string | undefined;
  mentionableUsers: any[] = [];

  constructor(
    public channelService: ChannelService,
    private userService: UserService
  ) {}

  /**
   * Initialize the component and load mentionable users.
   */
  ngOnInit(): void {
    this.currentUserId = this.userService.userId;
    this.loadMentionableUsers();
  }

  /**
   * Loads mentionable users for the current channel, excluding the current user.
   */
  loadMentionableUsers(): void {
    this.channelService.currentChannel$.subscribe({
      next: (channel) => this.processChannelMembers(channel),
      error: (error) => console.error('Fehler beim Abrufen des Kanals:', error),
    });
  }

  /**
   * Processes channel members to load mentionable users.
   * Excludes the current user and fetches user data for the remaining members.
   * @param channel The channel data containing members.
   */
  private processChannelMembers(channel: any): void {
    if (channel && channel.members && this.currentUserId) {
      const membersExcludingCurrentUser = this.getMembersExcludingCurrentUser(
        channel.members,
        this.currentUserId
      );

      this.resetMentionableUsers();
      membersExcludingCurrentUser.forEach((userId) =>
        this.fetchUserData(userId)
      );
    }
  }

  /**
   * Filters out the current user from the channel members list.
   * @param members The list of all members in the channel.
   * @param currentUserId The ID of the current user.
   * @returns A list of user IDs excluding the current user.
   */
  private getMembersExcludingCurrentUser(
    members: string[],
    currentUserId: string
  ): string[] {
    return members.filter((userId) => userId !== currentUserId);
  }

  /**
   * Resets the mentionable users list.
   */
  private resetMentionableUsers(): void {
    this.mentionableUsers = [];
  }

  /**
   * Fetches user data for a given user ID and adds it to the mentionable users list.
   * Ensures no duplicate entries are added.
   * @param userId The ID of the user to fetch data for.
   */
  private fetchUserData(userId: string): void {
    this.userService.getUserDataByUID(userId).subscribe({
      next: (userData) => this.addUserToMentionableList(userId, userData),
      error: (error) =>
        console.error('Fehler beim Abrufen der Benutzerdaten:', error),
    });
  }

  /**
   * Adds a user to the mentionable users list if the user data exists and the user is not already in the list.
   * @param userId The ID of the user.
   * @param userData The data of the user fetched from the service.
   */
  private addUserToMentionableList(userId: string, userData: any): void {
    if (userData) {
      const userExists = this.mentionableUsers.some(
        (user) => user.userId === userId
      );
      if (!userExists) {
        this.mentionableUsers.push({
          userId,
          userName: userData.displayName,
          photoURL: userData.photoURL,
        });
      }
    }
  }

  /**
   * Select an user and emit a mention text, including an '@' and the username.
   * @param userName The username of the selected user.
   */
  selectUser(userName: string): void {
    const mentionText: string = '@' + userName;
    this.mentionUser.emit(mentionText);
  }
  // selectUser(userName: string): void {
  //   const mentionText: string = `<span class="mention">@${userName}</span>`;
  //   this.mentionUser.emit(mentionText);
  // }
}
