import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { MessageService } from '../../../../../shared/services/message-service/message.service';
import { Subscription } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { PrivateChatService } from '../../../../../shared/services/private-chat-service/private-chat.service';
import { Firestore } from '@angular/fire/firestore';
import { deleteDoc, deleteField, doc, updateDoc } from 'firebase/firestore';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { PickerComponent, PickerModule } from '@ctrl/ngx-emoji-mart';
import { PrivateChatComponent } from '../../../private-chat.component';

@Component({
  selector: 'app-own-private-message-edit',
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
  templateUrl: './own-private-message-edit.component.html',
  styleUrl: './own-private-message-edit.component.scss',
})
export class OwnPrivateMessageEditComponent implements OnInit {
  @Input() message: any;
  @Input() displayName: string = '';
  @Output() temporaryMessageContent = new EventEmitter<string>();
  editedMessageContent: string = '';
  isSaving = false;
  private messageService = inject(MessageService);
  private messageSubscription!: Subscription;
  private privateChatService = inject(PrivateChatService);
  private firestore = inject(Firestore);
  currentBorderRadius = '30px 30px 30px 30px';

  constructor(private privateChat: PrivateChatComponent) {}

  /**
   * Initializes the component and subscribes to message updates on initialization.
   */
  ngOnInit() {
    if (this.message) {
      this.editedMessageContent = this.message.content;
      this.subscribeToMessageUpdates(this.message.messageId);
    }
  }

  /**
   * Unsubscribes from message updates when the component is destroyed.
   */
  ngOnDestroy() {
    if (this.messageSubscription) this.messageSubscription.unsubscribe();
  }

  /**
   * Subscribes to message updates for the given message ID.
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
   * Changes the message content and updates the database.
   */
  async changeMessage() {
    this.isSaving = true;
    this.temporaryMessageContent.emit(this.editedMessageContent);
    await this.deleteOrResetMessage();
    const originalContent = this.message.content;
    this.message.content = this.editedMessageContent;
    this.clearInput(false);
    this.finishSavingProcess(originalContent);
  }

  /**
   * Deletes or resets the message based on the edited content.
   */
  async deleteOrResetMessage() {
    if (
      !this.editedMessageContent.trim() &&
      !this.containsUrls(this.editedMessageContent)
    ) {
      await this.deleteMessage();
      return;
    }
    if (this.editedMessageContent === this.message.content) {
      this.clearInput(false);
      return;
    }
  }

  /**
   * Finishes the saving process by updating the message content in the user documents.
   * @param originalContent - The original content of the message.
   */
  async finishSavingProcess(originalContent: string) {
    try {
      const messageId = this.message.messageId;
      const privateChatId = this.privateChatService.privateChatId;
      if (!privateChatId) {
        console.error('privateChatId is null or undefined');
        return;
      }
      const [firstUserId, secondUserId] = privateChatId.split('_');
      await this.updateMessageInUserDocs(firstUserId, privateChatId, messageId, this.editedMessageContent);
      await this.updateMessageInUserDocs(
        secondUserId,
        privateChatId,
        messageId, 
        this.editedMessageContent
      );
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Nachricht:', error);
      this.message.content = originalContent;
    } finally {
      this.clearInput(true);
      this.isSaving = false;
      this.temporaryMessageContent.emit('');
    }
  }

  /**
   * Checks if the message contains URLs.
   * @param text - The message text to check.
   * @returns True if the message contains URLs, false otherwise.
   */
  containsUrls(text: string): boolean {
    const urlPattern = /https?:\/\/[^\s]+/g;
    return urlPattern.test(text);
  }

  /**
   * Deletes the message from the database.
   */
  async deleteMessage() {
    try {
      this.privateChat.closeSidenav();
      const messageId = this.message.messageId;
      const privateChatId = this.privateChatService.privateChatId;
      const [firstUserId, secondUserId] = privateChatId!.split('_');
      await this.deleteMessageFromUserDocs(
        firstUserId,
        privateChatId!,
        messageId
      );
      await this.deleteMessageFromUserDocs(
        secondUserId,
        privateChatId!,
        messageId
      );
      await this.messageService.deleteMessage(privateChatId!, messageId);
    } catch (error) {
      console.error('Fehler beim Löschen der Nachricht:', error);
    } finally {
      this.clearInput(true);
      this.isSaving = false;
      this.temporaryMessageContent.emit('');
    }
  }

  /**
   * Deletes the message from the user documents.
   * @param userId - The ID of the user.
   * @param privateChatId - The ID of the private chat.
   * @param messageId - The ID of the message.
   */

  async deleteMessageFromUserDocs(
    userId: string,
    privateChatId: string,
    messageId: string
  ) {
    try {
      const messageDocRef = doc(
        this.firestore,
        `users/${userId}/privateChat/${privateChatId}/messages/${messageId}`
      );
      await deleteDoc(messageDocRef);
    } catch (error) {
      console.error(
        `Fehler beim Löschen der Nachricht ${messageId} für Benutzer ${userId}:`,
        error
      );
    }
  }

  /**
   * Updates the message content in the user documents.
   * @param userId - The ID of the user.
   * @param privateChatId - The ID of the private chat.
   * @param messageId - The ID of the message.
   * @param updatedContent - The updated content of the message.
   */
  async updateMessageInUserDocs(
    userId: string,
    privateChatId: string,
    messageId: string,
    updatedContent: string
  ) {
    try {
      const messageDocRef = doc(
        this.firestore,
        `users/${userId}/privateChat/${privateChatId}/messages/${messageId}`
      );
      await updateDoc(messageDocRef, {
        content: updatedContent,
      });
    } catch (error) {
      console.error(
        `Fehler beim Aktualisieren der Nachricht ${messageId} für Benutzer ${userId}:`,
        error
      );
    }
  }

  /**
   * Clears the input field.
   * @param clearContent - Whether to clear the content of the message.
   */
  clearInput(clearContent: boolean = true) {
    this.messageService.setEditMessageId(null);
    if (clearContent) {
      this.editedMessageContent = '';
    }
  }

  /**
   * Adds an emoji to the message content.
   * @param event - The event object.
   */
  addEmoji(event: any) {
    const emoji = event.emoji.native || event.emoji;
    this.editedMessageContent += emoji;
  }

  /**
   * Toggles the border radius based on the menu type.
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
