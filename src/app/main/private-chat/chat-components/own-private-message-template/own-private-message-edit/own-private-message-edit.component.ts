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
      const privateChatId = this.privateChatService.privateChatId;
      const messageId = this.message.messageId;

      await this.messageService.updateMessageContentPrivateChat(
        privateChatId as string,
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

  // Ändere clearInput so, dass es optional den Inhalt löscht
  clearInput(clearContent: boolean = true) {
    this.messageService.setEditMessageId(null); // Verlässt den Bearbeitungsmodus
    if (clearContent) {
      this.editedMessageContent = ''; // Nur leeren, wenn clearContent true ist
    }
  }
}
