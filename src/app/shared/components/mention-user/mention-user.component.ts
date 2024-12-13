import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ChannelService } from '../../services/channel-service/channel.service';
import { UserService } from '../../services/user-service/user.service';
import { KeyValuePipe, NgFor, NgIf } from '@angular/common';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Channel } from '../../models/channel.model';
import { UserData } from '../../models/user.model';

@Component({
  selector: 'app-mention-user',
  standalone: true,
  imports: [NgFor, NgIf, KeyValuePipe],
  templateUrl: './mention-user.component.html',
  styleUrl: './mention-user.component.scss',
})
export class MentionUserComponent {
  @Output() mentionUser = new EventEmitter<string>();
  @Input() component = '';
  @Input() mentionTag = '';
  userData!: UserData;
  currentUserId!: string;
  mentionableUsers: any[] = [];
  mentionableChannels = new Map<string, Channel>();
  private allChannelsSubject = new BehaviorSubject<Map<string, Channel>>(
    this.mentionableChannels
  );
  mentionableChannels$ = this.allChannelsSubject.asObservable();
  channelSubscription: Subscription | undefined;
  userSubscription: Subscription | undefined;
  userDataSubscription: Subscription | undefined;

  constructor(
    public channelService: ChannelService,
    private userService: UserService
  ) {}

  /**
   * Initialize the component and load mentionable users.
   */
  ngOnInit(): void {
    this.currentUserId = this.userService.userId;
    if (this.component === 'channel') {
      if (this.mentionTag === '@') this.loadMentionableUsers();
      if (this.mentionTag === '#') this.loadUserData(this.currentUserId);
    }
  }

  /**
   * Loads all users, excluding the current user, when the component is checked after view initialization.
   */
  ngAfterViewChecked(): void {
    if (this.component === 'privateChat') {
      if (this.mentionTag === '@') this.loadAllUsers();
      else if (this.mentionTag === '#') this.loadUserData(this.currentUserId);
    }
  }

  /**
   * Handles changes to the component input.
   * @param changes - The changes object.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['component']) {
      if (this.mentionTag === '#') this.loadUserData(this.currentUserId);
      if (this.component === 'channel' && this.mentionTag === '@')
        this.loadMentionableUsers();
      if (this.component === 'privateChat' && this.mentionTag === '@')
        this.loadAllUsers();
    }
    if (changes['mentionTag']) {
      if (this.mentionTag === '#') this.loadUserData(this.currentUserId);
      if (this.component === 'channel' && this.mentionTag === '@')
        this.loadMentionableUsers();
      if (this.component === 'privateChat' && this.mentionTag === '@')
        this.loadAllUsers();
    }
  }

  /**
   * Clean up subscriptions on component destroy.
   */
  ngOnDestroy(): void {
    this.channelSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }

  /**
   * Load user data for the given user ID.
   * @param {string} userId - The ID of the user.
   */
  loadUserData(userId: string): void {
    this.userDataSubscription = this.userService.userDataMap$.subscribe(
      (userDataMap) => {
        const userData = userDataMap.get(userId);
        if (userData) {
          this.userData = userData;
          this.loadAllChannelsData();
        }
      }
    );
  }

  /**
   * Load all channel data for the current user from the channel service.
   */
  loadAllChannelsData(): void {
    this.channelSubscription = this.channelService.channelDataMap$.subscribe(
      (channels) => {
        const userChannels = new Map<string, Channel>();
        this.userData.channels.forEach((channelId) => {
          const channel = channels.get(channelId);
          if (channel) {
            userChannels.set(channelId, channel);
          }
        });
        this.mentionableChannels = userChannels;
      }
    );
  }

  /**
   * Loads all users, excluding the current user.
   */
  loadAllUsers(): void {
    this.userSubscription = this.userService.allUserData$.subscribe((users) => {
      this.mentionableUsers = users || [];
    });
    this.processAllUsers(this.mentionableUsers);
  }

  /**
   * Processes the list of all users to load mentionable users.
   * Excludes the current user and adds the rest to the mentionable users list.
   * @param allUsers The list of all users.
   */
  private processAllUsers(allUsers: any[]): void {
    if (allUsers && this.currentUserId) {
      const usersExcludingCurrentUser = allUsers.filter(
        (user) => user.userId !== this.currentUserId
      );

      this.resetMentionableUsers();
      usersExcludingCurrentUser.forEach((user) => {
        this.addUserToMentionableList(user.uid, user);
      });
    }
  }

  /**
   * Loads mentionable users for the current channel, excluding the current user.
   */
  loadMentionableUsers(): void {
    this.channelSubscription = this.channelService.currentChannel$.subscribe({
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
    this.userSubscription = this.userService
      .getUserDataByUID(userId)
      .subscribe({
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
    const mentionText: string = this.mentionTag + userName;
    this.mentionUser.emit(mentionText);
  }
}
