import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { UserService } from '../../services/user-service/user.service';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { EmojiPickerComponent } from '../emoji-picker/emoji-picker.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-message-reactions',
  standalone: true,
  templateUrl: './message-reactions.component.html',
  styleUrls: ['./message-reactions.component.scss'],
  imports: [
    EmojiComponent,
    MatMenuModule,
    NgFor,
    MatTooltipModule,
    NgClass,
    MatIcon,
    EmojiPickerComponent,
  ],
})
export class MessageReactionsComponent implements OnInit {
  @Input() message: any;
  @Input() component: string = '';
  reactionUsers: { id: string; displayName: string }[] = [];
  hoveredReaction: any = null;
  userSubscription: Subscription | undefined;

  constructor(private userService: UserService) {}

  /**
   * Load reaction users when the component is initialized.
   */
  ngOnInit(): void {
    this.loadReactionUsers();
  }

  /**
   * Clean up subscriptions on component destroy.
   */
  ngOnDestroy(): void {
    if (this.userSubscription) this.userSubscription.unsubscribe();
  }

  /**
   * Load reaction users for the current message.
   */
  loadReactionUsers(): void {
    if (this.message && Array.isArray(this.message.reactions)) {
      this.message.reactions.forEach((reaction: any) => {
        reaction.userIds.forEach((userId: string) => {
          if (!this.reactionUsers.some((user) => user.id === userId)) {
            this.userSubscription = this.userService
              .getUserDataByUID(userId)
              .subscribe((userData) => {
                if (userData) {
                  this.reactionUsers.push({
                    id: userId,
                    displayName: userData.displayName,
                  });
                }
              });
          }
        });
      });
    }
  }

  /**
   * Retrieves a formatted list of user names based on a reaction.
   * The current user ("Du") is moved to the end of the list if present.
   * @param reaction The reaction object containing emoji and user IDs.
   * @returns A formatted string array of user names.
   */
  getUserList(reaction: any): string[] {
    if (!reaction || !reaction.emoji || !Array.isArray(reaction.userIds)) {
      return [];
    }

    const userNames = this.mapUserIdsToNames(reaction.userIds);
    this.moveCurrentUserToEnd(userNames);
    return this.formatUserList(userNames);
  }

  /**
   * Maps an array of user IDs to their display names.
   * If the user is the current user, "Du" is returned. If no match is found, "Unbekannt" is returned.
   * @param userIds The array of user IDs to map.
   * @returns An array of user names.
   */
  private mapUserIdsToNames(userIds: string[]): string[] {
    return userIds.map((userId: string) => {
      if (userId === this.userService.userId) {
        return 'Du';
      }
      const user = this.reactionUsers.find((user) => user.id === userId);
      return user ? user.displayName : 'Unbekannt';
    });
  }

  /**
   * Moves the current user ("Du") to the end of the user names array if present.
   * @param userNames The array of user names to modify.
   */
  private moveCurrentUserToEnd(userNames: string[]): void {
    const currentUserIndex = userNames.indexOf('Du');
    if (currentUserIndex > -1) {
      const du = userNames.splice(currentUserIndex, 1)[0];
      userNames.push(du);
    }
  }

  /**
   * Formats a user names array by adding "und" between the last two names if there are multiple names.
   * @param userNames The array of user names to format.
   * @returns A formatted string array of user names.
   */
  private formatUserList(userNames: string[]): string[] {
    if (userNames.length > 1) {
      const lastUser = userNames.pop();
      return [...userNames, `und ${lastUser}`];
    }
    return userNames;
  }
}
