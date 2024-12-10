import {
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MainMessageAreaComponent } from '../../main-message-area.component';
import { NgClass, NgIf } from '@angular/common';
import { ChannelService } from '../../../../shared/services/channel-service/channel.service';
import { ThreadService } from '../../../../shared/services/thread-service/thread.service';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { OwnMessageShowComponent } from './own-message-show/own-message-show.component';
import { OwnMessageEditComponent } from './own-message-edit/own-message-edit.component';
import { MessageService } from '../../../../shared/services/message-service/message.service';
import { EmojiPickerComponent } from '../../../../shared/components/emoji-picker/emoji-picker.component';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { UserService } from '../../../../shared/services/user-service/user.service';
import { StorageService } from '../../../../shared/services/storage-service/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-own-message-template',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    MatIcon,
    EmojiComponent,
    MatMenu,
    MatMenuTrigger,
    OwnMessageShowComponent,
    OwnMessageEditComponent,
    EmojiPickerComponent,
  ],
  templateUrl: './own-message-template.component.html',
  styleUrl: './own-message-template.component.scss',
})
export class OwnMessageTemplateComponent
  implements OnChanges, OnInit, OnDestroy
{
  @Input() message: any;
  isEmojiContainerVisible: number = 0;
  editMessageMenuOpened: boolean = false;
  messageService = inject(MessageService);
  userService = inject(UserService);
  currentBorderRadius = '30px 30px 30px 30px';
  isDataLoaded: boolean = false;
  emojiContainerVisible: { [messageId: string]: boolean } = {};
  menuOpenStatus: { [messageId: string]: boolean } = {};
  photoURL: string = '';
  private userDataSubscription: Subscription | undefined;
  @ViewChild('emojiMenuTrigger') emojiMenuTrigger!: MatMenuTrigger;

  get threadKeys(): string[] {
    return Object.keys(this.message?.thread || {});
  }

  constructor(
    public mainMessageArea: MainMessageAreaComponent,
    public channelService: ChannelService,
    public threadService: ThreadService,
    public storageService: StorageService
  ) {}

  /**
   * Initialize the component and load user data.
   */
  ngOnInit(): void {
    this.isDataLoaded = true;
    if (this.message) this.loadUserData(this.message.userId);
  }

  /**
   * Load user data for the given user ID.
   * @param userId - The ID of the user to load data for.
   */
  loadUserData(userId: string): void {
    this.userDataSubscription = this.userService.userDataMap$.subscribe(
      (userDataMap) => {
        const userData = userDataMap.get(userId);
        if (userData) this.photoURL = userData.photoURL;
        else this.photoURL = 'src/assets/img/profile/placeholder-img.webp';
      }
    );
  }

  /**
   * Update the visibility of the emoji container based on message changes.
   */
  ngOnChanges(): void {
    if (this.messageService.editMessageId !== this.message.id) {
      this.emojiContainerVisible[this.message.messageId] = false;
    }
  }

  /**
   * Clean up subscriptions on component destroy.
   */
  ngOnDestroy(): void {
    if (this.userDataSubscription) {
      this.userDataSubscription.unsubscribe();
    }
  }

  /**
   * Check if the menu for the given message ID is open.
   * @param messageId - The ID of the message to check.
   * @returns True if the menu is open, false otherwise.
   */
  isMenuOpen(messageId: string): boolean {
    return !!this.menuOpenStatus[messageId];
  }

  /**
   * Toggle the hover effect for the emoji container.
   * @returns True if the data is loaded, false otherwise.
   */
  toggleHoverEffect() {
    return this.isDataLoaded;
  }

  /**
   * Show the emoji container for the given message ID.
   * @param messageId - The ID of the message to show the emoji container for.
   */
  showEmojiContainer(messageId: string) {
    if (this.messageService.editMessageId !== messageId) {
      this.emojiContainerVisible[messageId] = true;
    }
  }

  /**
   * Hide the emoji container for the given message ID.
   * @param messageId - The ID of the message to hide the emoji container for.
   */
  hideEmojiContainer(messageId: string) {
    if (
      this.messageService.editMessageId !== messageId &&
      !this.menuOpenStatus[messageId]
    ) {
      this.emojiContainerVisible[messageId] = false;
    }
  }

  /**
   * Handle the opening of the menu for the given message ID.
   * @param messageId - The ID of the message to open the menu for.
   */
  onMenuOpened(messageId: string): void {
    this.menuOpenStatus[messageId] = true;
    this.emojiContainerVisible[messageId] = true;
  }

  /**
   * Handle the closing of the menu for the given message ID.
   * @param messageId - The ID of the message to close the menu for.
   */
  onMenuClosed(messageId: string): void {
    this.menuOpenStatus[messageId] = false;
    this.hideEmojiContainer(messageId);
  }

  /**
   * Keep the emoji container visible for the given message ID.
   * @param messageId - The ID of the message to keep the emoji container visible for.
   */
  keepEmojiContainerVisible(messageId: string): void {
    if (!this.menuOpenStatus[messageId]) {
      this.emojiContainerVisible[messageId] = true;
    }
  }

  /**
   * Get the last reply time for the given messages.
   * @param messages - The messages array.
   * @returns The last reply time as a string.
   */
  getLastReplyTime(messages: any[]): string {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.time) {
      const date = new Date(lastMessage.time);
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      };
      return date.toLocaleTimeString([], options) + ' Uhr';
    }
    return 'Keine Antworten';
  }

  /**
   * Set the edit message menu opened status.
   * @param value - The new value for the edit message menu opened status.
   * @param messageId - The ID of the message to set the edit message menu opened status for.
   */
  setEditMessageMenuOpened(value: boolean, messageId: string) {
    this.editMessageMenuOpened = value;
    if (!value) this.emojiContainerVisible[messageId] = false;
  }

  /**
   * Add a reaction to the given message.
   * @param messageId - The ID of the message to add a reaction to.
   * @param emoji - The emoji to add as a reaction.
   */
  addReaction(messageId: string, emoji: any): void {
    let path =
      'channels/' + this.channelService.channelId + '/messages/' + messageId;
    this.messageService.setActualMessage(this.message);
    this.messageService.addOrChangeReactionChannelOrThread(emoji, path);
  }

  /**
   * Toggle the border radius for the menu.
   * @param menuType - The type of the menu to toggle the border radius for.
   */
  toggleBorder(): void {
    this.currentBorderRadius = '30px 30px 30px 30px';
      document.documentElement.style.setProperty(
        '--border-radius',
        this.currentBorderRadius
      );
  }

  /**
   * Toggle the border radius for the edit message menu.
   */
  toggleBorderEditMessage() {
    this.currentBorderRadius = '0px 30px 30px 30px';
    document.documentElement.style.setProperty(
      '--border-radius',
      this.currentBorderRadius
    );
  }

  /**
   * Delete the given message and closes the thread if necessary.
   * @param message - The message to delete.
   */
  deleteMessage(message: any) {
    const path = `channels/${this.channelService.channelId}/messages/${message.messageId}`;
    if (message.attachmentUrls && message.attachmentUrls.length > 0) {
      for (const url of message.attachmentUrls) {
        this.storageService.deleteSpecificFile(url);
      }
    }
    if (
      this.threadService.actualMessageSubject.value?.messageId ===
      message.messageId
    ) {
      this.mainMessageArea.closeSidenav();
    }
    this.messageService.deleteMessageInThreadOrChannel(path);
  }

  /**
   * Handles the reaction of a message in a channel.
   * @param isReaction - A boolean value indicating whether the message is a reaction or not.
   */
  handleChannelReaction(isReaction: boolean): void {
    if (isReaction) this.emojiMenuTrigger.closeMenu();
  }
}
