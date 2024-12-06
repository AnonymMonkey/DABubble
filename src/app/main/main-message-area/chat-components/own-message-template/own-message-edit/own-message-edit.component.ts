import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { MessageService } from '../../../../../shared/services/message-service/message.service';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { PickerComponent, PickerModule } from '@ctrl/ngx-emoji-mart';
import { ChannelService } from '../../../../../shared/services/channel-service/channel.service';
import { getFirestore, doc, deleteDoc, getDoc } from 'firebase/firestore';

@Component({
  selector: 'app-own-message-edit',
  standalone: true,
  imports: [
    MatIcon,
    MatProgressSpinnerModule,
    FormsModule,
    MatMenuTrigger,
    MatMenuModule,
    PickerComponent,
    PickerModule,
  ],
  templateUrl: './own-message-edit.component.html',
  styleUrls: ['./own-message-edit.component.scss'],
})
export class OwnMessageEditComponent implements OnInit {
  @Input() message: any;
  @Output() temporaryMessageContent = new EventEmitter<string>();
  editedMessageContent: string = '';
  isSaving = false;
  private messageService = inject(MessageService);
  private channelService = inject(ChannelService);
  private messageSubscription!: Subscription;
  currentBorderRadius = '30px 30px 30px 30px';

  constructor() {}

  /**
   * Initialize the component and subscribe to message updates.
   */
  ngOnInit() {
    if (this.message) {
      this.editedMessageContent = this.message.content;
      this.subscribeToMessageUpdates(this.message.messageId);
    }
  }

  /**
   * Clean up subscriptions on component destroy.
   */
  ngOnDestroy() {
    if (this.messageSubscription) this.messageSubscription.unsubscribe();
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
   * Updates a message's content or deletes it if the content is empty and no attachments exist.
   * Emits temporary message changes and handles saving state.
   */
  async changeMessage(): Promise<void> {
    this.startSavingProcess();
    if (this.noContentChanges()) {
      this.clearInput(false);
      return;
    }
    const originalContent = this.prepareMessageForUpdate();
    try {
      await this.saveOrDeleteMessage();
    } catch (error) {
      this.restoreOriginalMessage(originalContent);
    } finally {
      this.finalizeSavingProcess();
    }
  }

  /**
   * Starts the saving process by updating the UI state and emitting temporary content.
   */
  private startSavingProcess(): void {
    this.isSaving = true;
    this.temporaryMessageContent.emit(this.editedMessageContent);
  }

  /**
   * Checks if there are no changes to the message content.
   */
  private noContentChanges(): boolean {
    return this.editedMessageContent === this.message.content;
  }

  /**
   * Prepares the message content for updating and clears the input field.
   */
  private prepareMessageForUpdate(): string {
    const originalContent = this.message.content;
    this.message.content = this.editedMessageContent;
    this.clearInput(false);
    return originalContent;
  }

  /**
   * Saves or deletes the message based on its updated content.
   */
  private async saveOrDeleteMessage(): Promise<void> {
    const path = `channels/${this.channelService.channelId}/messages/${this.message.messageId}`;
    if (this.shouldDeleteMessage()) {
      await this.messageService.deleteMessageInThreadOrChannel(path);
    } else {
      await this.messageService.updateMessageThreadOrChannel(
        path,
        this.editedMessageContent
      );
    }
  }

  /**
   * Determines if the message should be deleted.
   */
  private shouldDeleteMessage(): boolean {
    return (
      !this.editedMessageContent.trim() &&
      this.message.attachmentUrls.length === 0
    );
  }

  /**
   * Restores the original message content if an error occurs.
   */
  private restoreOriginalMessage(originalContent: string): void {
    this.message.content = originalContent;
  }

  /**
   * Finalizes the saving process by clearing the input and resetting UI state.
   */
  private finalizeSavingProcess(): void {
    this.clearInput(true);
    this.isSaving = false;
    this.temporaryMessageContent.emit('');
  }

  /**
   * Delete the message with the given message ID from the channel.
   * @param channelId - The ID of the channel to delete the message from.
   * @param messageId - The ID of the message to delete.
   */
  async deleteChannelMessage(
    channelId: string,
    messageId: string
  ): Promise<void> {
    const db = getFirestore();
    const messageDocRef = doc(db, 'channels', channelId, 'messages', messageId);
    try {
      const messageDoc = await getDoc(messageDocRef);
      if (messageDoc.exists()) await deleteDoc(messageDocRef);
      else console.error('Nachricht nicht gefunden');
    } catch (error) {
      console.error('Fehler beim Löschen der Nachricht:', error);
      throw error;
    }
  }

  /**
   * Clear the input and message ID.
   * @param clearContent - Optional parameter to clear the message content. Default is true.
   */
  clearInput(clearContent: boolean = true) {
    this.messageService.setEditMessageId(null);
    if (clearContent) this.editedMessageContent = '';
  }

  /**
   * Add an emoji to the message content.
   * @param event - The emoji to add.
   */
  addEmoji(event: any) {
    const emoji = event.emoji.native || event.emoji;
    this.editedMessageContent += emoji;
  }

  /**
   * Toggle the border radius based on the menu type.
   * @param menuType - The type of the menu.
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
