import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PickerComponent, PickerModule } from '@ctrl/ngx-emoji-mart';
import { AttachmentPreviewComponent } from '../../../../../../shared/components/attachment-preview/attachment-preview.component';
import { MessageService } from '../../../../../../shared/services/message-service/message.service';
import { Subscription } from 'rxjs';
import { PrivateChatService } from '../../../../../../shared/services/private-chat-service/private-chat.service';
import { Firestore } from '@angular/fire/firestore';
import { deleteField, doc, updateDoc } from 'firebase/firestore';
import { UserService } from '../../../../../../shared/services/user-service/user.service';

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
  private privateChatService = inject(PrivateChatService);
  private firestore = inject(Firestore);
  private userService = inject(UserService);
  currentBorderRadius = '30px 30px 30px 30px';

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
    this.isSaving = true;
    this.temporaryMessageContent.emit(this.editedMessageContent);

    // Überprüfen, ob die Nachricht keinen Inhalt mehr hat oder keine URLs
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

    const originalContent = this.message.content;
    this.message.content = this.editedMessageContent;

    this.clearInput(false);

    try {
      const messageId = this.message.messageId;

      // Benutzerdaten holen und privateChatId aufteilen, um Benutzer-IDs zu erhalten
      const privateChatId = this.privateChatService.privateChatId;
      if (!privateChatId) {
        console.error('privateChatId is null or undefined');
        return; // Hier kannst du eine geeignete Fehlerbehandlung einfügen
      }
      const [firstUserId, secondUserId] = privateChatId.split('_');

      // Nachricht für den aktuellen Benutzer und den anderen Benutzer aktualisieren
      await this.updateMessageInUserDocs(firstUserId, privateChatId, messageId);
      await this.updateMessageInUserDocs(
        secondUserId,
        privateChatId,
        messageId
      );

      // Nachricht in der Firestore-Datenbank aktualisieren
      await this.messageService.updateMessageContentPrivateChat(
        privateChatId as string,
        messageId,
        this.editedMessageContent
      );
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Nachricht:', error);
      this.message.content = originalContent; // Bei Fehler die ursprüngliche Nachricht wiederherstellen
    } finally {
      this.clearInput(true);
      this.isSaving = false;
      this.temporaryMessageContent.emit('');
    }
  }

  // Funktion, um zu prüfen, ob der Text URLs enthält
  containsUrls(text: string): boolean {
    const urlPattern = /https?:\/\/[^\s]+/g;
    return urlPattern.test(text);
  }

  // Löscht die Nachricht, wenn sie keinen Inhalt und keine URLs mehr hat
  async deleteMessage() {
    try {
      const messageId = this.message.messageId;
      const privateChatId = this.privateChatService.privateChatId;
      const [firstUserId, secondUserId] = privateChatId!.split('_');

      // Lösche die Nachricht aus den Benutzerdokumenten
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

      // Lösche die Nachricht aus der Firestore-Datenbank
      await this.messageService.deleteMessage(privateChatId!, messageId);
    } catch (error) {
      console.error('Fehler beim Löschen der Nachricht:', error);
    } finally {
      this.clearInput(true);
      this.isSaving = false;
      this.temporaryMessageContent.emit('');
    }
  }

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
