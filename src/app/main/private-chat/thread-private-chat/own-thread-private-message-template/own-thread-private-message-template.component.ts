import { NgClass, NgIf } from '@angular/common';
import { Component, inject, Input, SimpleChanges } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { OwnThreadPrivateMessageShowComponent } from './own-thread-private-message-show/own-thread-private-message-show.component';
import { OwnThreadPrivateMessageEditComponent } from './own-thread-private-message-edit/own-thread-private-message-edit.component';
import { Subscription } from 'rxjs';
import { EmojiPickerComponent } from '../../../../shared/components/emoji-picker/emoji-picker.component';
import { UserService } from '../../../../shared/services/user-service/user.service';
import { MessageService } from '../../../../shared/services/message-service/message.service';
import { ThreadPrivateChatService } from '../../../../shared/services/thread-private-chat/thread-private-chat.service';
import { ChannelService } from '../../../../shared/services/channel-service/channel.service';
import { StorageService } from '../../../../shared/services/storage-service/storage.service';
import { PrivateChatComponent } from '../../private-chat.component';

@Component({
  selector: 'app-own-thread-private-message-template',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    MatIcon,
    MatMenu,
    MatMenuTrigger,
    EmojiPickerComponent,
    OwnThreadPrivateMessageShowComponent,
    OwnThreadPrivateMessageEditComponent,
  ],
  templateUrl: './own-thread-private-message-template.component.html',
  styleUrl: './own-thread-private-message-template.component.scss',
})
export class OwnThreadPrivateMessageTemplateComponent {
  @Input() message: any;
  photoURL: string = '';
  isEmojiContainerVisible: number = 0;
  public userService = inject(UserService);
  public messageService = inject(MessageService);
  editMessageMenuOpened: boolean = false;
  public threadService = inject(ThreadPrivateChatService);
  private channelService = inject(ChannelService);
  private storageService = inject(StorageService);
  currentBorderRadius = '30px 30px 30px 30px';
  emojiContainerVisible: { [messageId: string]: boolean } = {};
  menuOpenStatus: { [messageId: string]: boolean } = {};
  private userDataSubscription: Subscription | undefined;
  private userSubscription: Subscription | undefined;

  constructor(private privateChat: PrivateChatComponent) {}

  /**
   * Initialize the component and load user data.
   */
  ngOnInit() {
    if (this.message) this.loadUserData(this.message.userId);
  }

  /**
   * Loads user data for the given user ID.
   * @param userId - The ID of the user to load data for.
   */
  loadUserData(userId: string): void {
    this.userDataSubscription = this.userService.userDataMap$.subscribe(
      (userDataMap) => {
        const userData = userDataMap.get(userId);
        if (userData) this.photoURL = userData.photoURL;
        else this.photoURL = 'assets/img/profile/placeholder-img.webp';
      }
    );
  }

  /**
   * Clean up subscriptions on component destroy.
   */
  ngOnDestroy(): void {
    if (this.userDataSubscription) this.userDataSubscription.unsubscribe();
    if (this.userSubscription) this.userSubscription.unsubscribe();
  }

  /**
   * Show the emoji container for the given message ID.
   * @param messageId - The ID of the message to show the emoji container for.
   */
  showEmojiContainer(messageId: string) {
    if (this.messageService.editMessageId !== messageId)
      this.emojiContainerVisible[messageId] = true;
  }

  /**
   * Hide the emoji container if the menu is not open.
   * @param messageId - The ID of the message to hide the emoji container for.
   */
  hideEmojiContainer(messageId: string) {
    if (
      this.messageService.editMessageId !== messageId &&
      !this.menuOpenStatus[messageId]
    )
      this.emojiContainerVisible[messageId] = false;
  }

  /**
   * Handles changes to the message input.
   * @param changes - The changes to the message input.
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes['message'] && !changes['message'].firstChange)
      this.handleMessageChange(changes['message'].currentValue);
  }

  /**
   * Handles the opening of the menu for a message.
   * @param messageId - The ID of the message to open the menu for.
   */
  onMenuOpened(messageId: string): void {
    this.menuOpenStatus[messageId] = true;
    this.emojiContainerVisible[messageId] = true;
  }

  /**
   * Handles the closing of the menu for a message.
   * @param messageId - The ID of the message to close the menu for.
   */
  onMenuClosed(messageId: string): void {
    this.menuOpenStatus[messageId] = false;
    this.hideEmojiContainer(messageId);
  }

  /**
   * Handles changes to the message input.
   * @param newMessage - The new message input.
   */
  handleMessageChange(newMessage: any) {
    if (newMessage && newMessage.userId)
      this.userSubscription = this.userService
        .getUserDataByUID(newMessage.userId)
        .subscribe((data) => {
          this.photoURL = data.photoURL;
        });
  }

  /**
   * Sets the edit message menu opened state.
   * @param value - The new value for the edit message menu opened state.
   * @param messageId - The ID of the message to set the edit message menu opened state for.
   */
  setEditMessageMenuOpened(value: boolean, messageId: string) {
    this.editMessageMenuOpened = value;
    if (!value) this.emojiContainerVisible[messageId] = false;
  }

  /**
   * Gets the last reply time for the given messages.
   * @param messages - The messages to get the last reply time for.
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
   * Toggle the border radius for the menu.
   */
  toggleBorder(): void {
    this.currentBorderRadius = '30px 30px 30px 30px';
    document.documentElement.style.setProperty(
      '--border-radius',
      this.currentBorderRadius
    );
  }

  /**
   * Toggle the border radius for the edit and delete message menu.
   */
  toggleBorderEditMessage() {
    this.currentBorderRadius = '0px 30px 30px 30px';
    document.documentElement.style.setProperty(
      '--border-radius',
      this.currentBorderRadius
    );
  }

  /**
   * Deletes a message based on its message ID.
   * @param message - The message to delete.
   */
  deleteMessage(message: any) {
    const channelPath = `channels/${this.channelService.channelId}/messages/${message.messageId}`;
    const threadPath = `channels/${this.channelService.channelId}/messages/${this.threadService.actualMessageSubject.value?.messageId}/thread/${message.messageId}`;
    if (message.attachmentUrls && message.attachmentUrls.length > 0)
      for (const url of message.attachmentUrls) {
        this.storageService.deleteSpecificFile(url);
      }
    if (this.message.messageId.startsWith('thread_'))
      this.messageService.deleteMessageInThreadOrChannel(threadPath);
    else if (this.message.messageId.startsWith('msg_')) {
      this.messageService.deleteMessageInThreadOrChannel(channelPath);
      this.privateChat.closeSidenav();
    }
  }
}
