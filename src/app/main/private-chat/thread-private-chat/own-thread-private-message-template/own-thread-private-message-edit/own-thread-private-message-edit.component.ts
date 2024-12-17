import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PickerComponent, PickerModule } from '@ctrl/ngx-emoji-mart';
import { Subscription } from 'rxjs';
import { Firestore } from '@angular/fire/firestore';
import { deleteField, doc, updateDoc } from 'firebase/firestore';
import { MessageService } from '../../../../../shared/services/message-service/message.service';
import { UserService } from '../../../../../shared/services/user-service/user.service';
import { ChannelService } from '../../../../../shared/services/channel-service/channel.service';
import { ThreadPrivateChatService } from '../../../../../shared/services/thread-private-chat/thread-private-chat.service';

@Component({
  selector: 'app-own-thread-private-message-edit',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    FormsModule,
    MatIcon,
    MatMenuTrigger,
    MatMenuModule,
    PickerModule,
    PickerComponent,
  ],
  templateUrl: './own-thread-private-message-edit.component.html',
  styleUrl: './own-thread-private-message-edit.component.scss',
})
export class OwnThreadPrivateMessageEditComponent {
  @Input() message: any;
  @Output() temporaryMessageContent = new EventEmitter<string>();
  public displayName: string = '';
  editedMessageContent: string = '';
  isSaving = false;
  private messageService = inject(MessageService);
  private messageSubscription!: Subscription;
  private firestore = inject(Firestore);
  private userService = inject(UserService);
  currentBorderRadius = '30px 30px 30px 30px';
  private channelService = inject(ChannelService);
  private threadService = inject(ThreadPrivateChatService);
  private userSubscription!: Subscription;

  /**
   * Initialize the component and subscribe to message updates.
   */
  ngOnInit() {
    if (this.message) {
      this.editedMessageContent = this.message.content;
      this.subscribeToMessageUpdates(this.message.messageId);
      this.userSubscription = this.userService
        .getUserDataByUID(this.message.userId)
        .subscribe((data) => {
          this.displayName = data.displayName;
        });
    }
  }

  /**
   * Clean up subscriptions on component destroy.
   */
  ngOnDestroy() {
    if (this.messageSubscription) this.messageSubscription.unsubscribe();
    if (this.userSubscription) this.userSubscription.unsubscribe();
  }

  /**
   * Subscribe to message updates for the given message ID.
   * @param messageId - The ID of the message to subscribe to.
   */
  subscribeToMessageUpdates(messageId: string) {
    this.messageSubscription = this.messageService
      .getMessageUpdates(messageId)
      .subscribe((updatedMessage) => {
        if (updatedMessage) {
          this.message = updatedMessage;
          this.editedMessageContent = updatedMessage.content;
        }
      });
  }

  /**
   * Edits or deletes a message based on the edited content.
   */
  async changeMessage(): Promise<void> {
    this.isSaving = true;
    this.temporaryMessageContent.emit(this.editedMessageContent);
    if (this.editedMessageContent === this.message.content) {
      return this.clearInput(false);
    }
    const originalContent = this.message.content;
    this.message.content = this.editedMessageContent;
    this.clearInput(false);
    const userId = this.userService.userId;
    const otherUserId =
      this.threadService.privateChatId?.split('_')[0] === userId
        ? this.threadService.privateChatId?.split('_')[1]
        : this.threadService.privateChatId?.split('_')[0];
    const { privateChatPath: userChatPath, threadPath: userThreadPath } =
      this.buildPaths(userId, this.threadService.privateChatId ?? '');
    const {
      privateChatPath: otherUserChatPath,
      threadPath: otherUserThreadPath,
    } = this.buildPaths(
      otherUserId ?? '',
      this.threadService.privateChatId ?? ''
    );
    const userPath = this.isThreadMessage() ? userThreadPath : userChatPath;
    const otherUserPath = this.isThreadMessage()
      ? otherUserThreadPath
      : otherUserChatPath;
    try {
      await Promise.all([
        this.handleMessageUpdateOrDelete(
          userPath,
          this.editedMessageContent,
          originalContent
        ),
        this.handleMessageUpdateOrDelete(
          otherUserPath,
          this.editedMessageContent,
          originalContent
        ),
      ]);
    } catch (error) {
      console.error('Error updating message for both users:', error);
      this.message.content = originalContent;
    }
    this.isSaving = false;
    this.temporaryMessageContent.emit('');
  }

  /**
   * Handles message update or deletion, including error handling.
   * @param {string} path - The path for the message update or delete.
   * @param {string} content - The updated content of the message.
   * @param {string} originalContent - The original content to restore in case of an error.
   */
  private async handleMessageUpdateOrDelete(
    path: string,
    content: string,
    originalContent: string
  ): Promise<void> {
    try {
      if (!content.trim())
        await this.messageService.deleteMessageInThreadOrChannel(path);
      else
        await this.messageService.updateMessageThreadOrChannel(path, content);
    } catch (error) {
      this.restoreOriginalContent(originalContent, error);
      console.error('Error updating or deleting message:', error);
    }
  }

  /**
   * Restores the original content of the message in case of an error.
   * @param {string} originalContent - The original content of the message.
   * @param {any} error - The error that occurred during the update.
   */
  private restoreOriginalContent(originalContent: string, error: any): void {
    this.message.content = originalContent;
    console.error('Error occurred:', error);
  }

  /**
   * Builds paths for updating or deleting a message, depending on whether it's in a thread or a channel.
   * @returns {Object} - Returns an object containing `channelPath` and `threadPath`.
   */
  private buildPaths(
    userId: string,
    privateChatId: string
  ): { privateChatPath: string; threadPath: string } {
    const privateChatPath = `users/${userId}/privateChat/${privateChatId}/messages/${this.message.messageId}`;
    const threadPath = `users/${userId}/privateChat/${privateChatId}/messages/${this.threadService.actualMessageSubject.value?.messageId}/thread/${this.message.messageId}`;
    return { privateChatPath, threadPath };
  }

  /**
   * Checks whether the message is part of a thread.
   * @returns {boolean} - True if the message is in a thread, false otherwise.
   */
  private isThreadMessage(): boolean {
    return (
      this.message.messageId.startsWith('thread_') &&
      this.threadService.actualMessageSubject.value?.messageId
    );
  }

  /**
   * Returns the path to the message in the database.
   * @returns The path to the message.
   */
  getMessagePath(): string {
    const basePath = `channels/${this.channelService.channelId}/messages`;
    if (this.message.messageId.startsWith('thread_')) {
      const threadId = this.threadService.actualMessageSubject.value?.messageId;
      return `${basePath}/${threadId}/thread/${this.message.messageId}`;
    }
    return `${basePath}/${this.message.messageId}`;
  }

  /**
   * Checks if the message has attachments.
   * @returns True if the message has attachments, false otherwise.
   */
  hasAttachments(): boolean {
    return !!this.message.attachmentUrls?.length;
  }

  /**
   * Checks if the given text contains URLs.
   * @param text - The text to check.
   * @returns True if the text contains URLs, false otherwise.
   */
  containsUrls(text: string): boolean {
    const urlPattern = /https?:\/\/[^\s]+/g;
    return urlPattern.test(text);
  }

  /**
   * Deletes the message from the user's document in Firestore.
   * @param userId - The ID of the user.
   * @param privateChatId - The ID of the private chat.
   * @param messageId - The ID of the message to delete.
   */
  async deleteMessageFromUserDocs(
    userId: string,
    privateChatId: string,
    messageId: string
  ) {
    try {
      const userDocRef = doc(this.firestore, `users/${userId}`);
      await updateDoc(userDocRef, {
        [`privateChat.${privateChatId}.messages.${messageId}`]: deleteField(),
      });
    } catch (error) {
      console.error(
        `Fehler beim Löschen der Nachricht für Benutzer ${userId}:`,
        error
      );
    }
  }

  /**
   * Updates the message in the user's document in Firestore.
   * @param userId - The ID of the user.
   * @param privateChatId - The ID of the private chat.
   * @param messageId - The ID of the message to update.
   */
  async updateMessageInUserDocs(
    userId: string,
    privateChatId: string,
    messageId: string
  ) {
    try {
      const userDocRef = doc(this.firestore, `users/${userId}`);
      await updateDoc(userDocRef, {
        [`privateChat.${privateChatId}.messages.${messageId}.content`]:
          this.editedMessageContent,
      });
    } catch (error) {
      console.error(
        `Fehler beim Aktualisieren der Nachricht für Benutzer ${userId}:`,
        error
      );
    }
  }

  /**
   * Clears the input and optionally clears the content of the message.
   * @param clearContent - Whether to clear the content of the message.
   */
  clearInput(clearContent: boolean = true) {
    this.messageService.setEditMessageId(null);
    if (clearContent) this.editedMessageContent = '';
  }

  /**
   * Adds an emoji to the message content.
   * @param event - The event object containing the selected emoji.
   */
  addEmoji(event: any) {
    const emoji = event.emoji.native || event.emoji;
    this.editedMessageContent += emoji;
  }

  /**
   * Toggles the border radius based on the menu type.
   * @param menuType - The type of menu.
   */
  toggleBorder(menuType: string) {
    switch (menuType) {
      case 'emoji':
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
