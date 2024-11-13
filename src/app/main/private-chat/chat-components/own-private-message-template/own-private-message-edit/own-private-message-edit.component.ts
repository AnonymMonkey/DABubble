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
import { ActivatedRoute } from '@angular/router';
import { PrivateChatService } from '../../../../../shared/services/private-chat-service/private-chat.service';
import { Firestore } from '@angular/fire/firestore';
import { doc, updateDoc } from 'firebase/firestore';

@Component({
  selector: 'app-own-private-message-edit',
  standalone: true,
  imports: [MatProgressSpinnerModule, FormsModule, MatIcon],
  templateUrl: './own-private-message-edit.component.html',
  styleUrl: './own-private-message-edit.component.scss',
})
export class OwnPrivateMessageEditComponent implements OnInit {
  @Input() message: any;
  @Input() displayName: string = '';
  @Output() temporaryMessageContent = new EventEmitter<string>(); // EventEmitter für den temporären Text
  editedMessageContent: string = '';
  isSaving = false;
  private messageService = inject(MessageService);
  private messageSubscription!: Subscription;
  private privateChatService = inject(PrivateChatService);
  private firestore = inject(Firestore);

  ngOnInit() {
    if (this.message) {
      this.editedMessageContent = this.message.content;
      this.subscribeToMessageUpdates(this.message.messageId);
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
}
