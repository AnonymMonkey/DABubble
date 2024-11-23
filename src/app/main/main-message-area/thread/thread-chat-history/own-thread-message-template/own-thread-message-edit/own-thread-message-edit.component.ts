import { NgFor, NgIf } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PickerComponent, PickerModule } from '@ctrl/ngx-emoji-mart';
import { AttachmentPreviewComponent } from '../../../../../../shared/components/attachment-preview/attachment-preview.component';
import { MessageService } from '../../../../../../shared/services/message-service/message.service';
import { Subscription } from 'rxjs';
import { Firestore } from '@angular/fire/firestore';
import { deleteField, doc, updateDoc } from 'firebase/firestore';
import { UserService } from '../../../../../../shared/services/user-service/user.service';
import { ChannelService } from '../../../../../../shared/services/channel-service/channel.service';
import { ThreadService } from '../../../../../../shared/services/thread-service/thread.service';

@Component({
  selector: 'app-own-thread-message-edit',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    FormsModule,
    MatIcon,
    MatMenuTrigger,
    MatMenuModule,
    PickerModule,
    PickerComponent,
    NgIf,
    NgFor,
    AttachmentPreviewComponent,
  ],
  templateUrl: './own-thread-message-edit.component.html',
  styleUrl: './own-thread-message-edit.component.scss',
})
export class OwnThreadMessageEditComponent implements OnInit, OnDestroy {
  @Input() message: any;
  @Output() temporaryMessageContent = new EventEmitter<string>(); // EventEmitter für den temporären Text
  public displayName: string = '';
  editedMessageContent: string = '';
  isSaving = false;
  private messageService = inject(MessageService);
  private messageSubscription!: Subscription;
  private firestore = inject(Firestore);
  private userService = inject(UserService);
  currentBorderRadius = '30px 30px 30px 30px';
  private channelService = inject(ChannelService);
  private threadService = inject(ThreadService);

  ngOnInit() {
    if (this.message) {
      this.editedMessageContent = this.message.content;
      this.subscribeToMessageUpdates(this.message.messageId);
      this.userService
        .getUserDataByUID(this.message.userId)
        .subscribe((data) => {
          this.displayName = data.displayName;
        });
    }
  }

  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

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

  async changeMessage() {
    this.isSaving = true; // Ladeindikator aktivieren
    this.temporaryMessageContent.emit(this.editedMessageContent);

    if (this.editedMessageContent === this.message.content) {
      this.clearInput(false); // Bearbeitungsmodus verlassen, aber Inhalt behalten
      return;
    }

    const originalContent = this.message.content;
    this.message.content = this.editedMessageContent;
    this.clearInput(false); // Bearbeitungsmodus verlassen
    try {
      const channelPath = 'channels/' + this.channelService.channelId + '/messages/' + this.message.messageId;
      const threadPath = 'channels/' + this.channelService.channelId + '/messages/' + this.threadService.actualMessageSubject.value?.messageId + '/thread/' + this.message.messageId;
      if (!this.editedMessageContent.trim() && !this.hasAttachments()) {
        if (
          this.message.messageId.startsWith('thread_') &&
          this.threadService.actualMessageSubject.value?.messageId
        ) {
          await this.messageService.deleteMessageInThreadOrChannel(
           threadPath
          );
        } else if (this.message.messageId.startsWith('msg_')) {
          await this.messageService.deleteMessageInThreadOrChannel(
            channelPath
          );
        }
      } else {
        if (
          this.message.messageId.startsWith('thread_') &&
          this.threadService.actualMessageSubject.value?.messageId
        ) {
          this.messageService.updateMessageThreadOrChannel(
            threadPath,
            this.editedMessageContent
          );
        } else if (this.message.messageId.startsWith('msg_')) {
          await this.messageService.updateMessageThreadOrChannel(
            channelPath,
            this.editedMessageContent
          );
        }
      }
    } catch (error) {
      this.message.content = originalContent; // Ursprünglichen Inhalt zurücksetzen
      console.error('Fehler beim Ändern der Nachricht:', error);
    } finally {
      this.isSaving = false;
      this.temporaryMessageContent.emit('');
    }
  }

  getMessagePath(): string {
    const basePath = `channels/${this.channelService.channelId}/messages`;
    if (this.message.messageId.startsWith('thread_')) {
      const threadId = this.threadService.actualMessageSubject.value?.messageId;
      return `${basePath}/${threadId}/thread/${this.message.messageId}`;
    }
    return `${basePath}/${this.message.messageId}`;
  }

  hasAttachments(): boolean {
    return !!this.message.attachmentUrls?.length;
  }

  // Funktion, um zu prüfen, ob der Text URLs enthält
  containsUrls(text: string): boolean {
    const urlPattern = /https?:\/\/[^\s]+/g;
    return urlPattern.test(text);
  }

  // Löscht die Nachricht, wenn sie keinen Inhalt und keine URLs mehr hat
  async deleteMessage() {}

  // Löscht die Nachricht aus einem Benutzerdokument
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

  // Ändere clearInput so, dass es optional den Inhalt löscht
  clearInput(clearContent: boolean = true) {
    this.messageService.setEditMessageId(null); // Verlässt den Bearbeitungsmodus
    if (clearContent) {
      this.editedMessageContent = ''; // Nur leeren, wenn clearContent true ist
    }
  }

  addEmoji(event: any) {
    const emoji = event.emoji.native || event.emoji;
    this.editedMessageContent += emoji;
  }

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
