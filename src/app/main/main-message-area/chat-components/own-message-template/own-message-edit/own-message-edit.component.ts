import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { MessageService } from '../../../../../shared/services/message-service/message.service';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-own-message-edit',
  standalone: true,
  imports: [MatIcon, MatProgressSpinnerModule, FormsModule],
  templateUrl: './own-message-edit.component.html',
  styleUrls: ['./own-message-edit.component.scss'],
})
export class OwnMessageEditComponent implements OnInit {
  @Input() message: any;
  @Output() temporaryMessageContent = new EventEmitter<string>(); // EventEmitter für den temporären Text
  editedMessageContent: string = '';
  isSaving = false;
  private messageService = inject(MessageService);
  private messageSubscription!: Subscription;

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
    this.messageSubscription = this.messageService.getMessageUpdates(messageId).subscribe((updatedMessage) => {
      if (updatedMessage) {
        this.message = updatedMessage;
        this.editedMessageContent = updatedMessage.content;
      }
    });
  }

  async changeMessage() {
    this.isSaving = true; // Ladeindikator aktivieren
    this.temporaryMessageContent.emit(this.editedMessageContent); // Temporären Text senden
  
    if (this.editedMessageContent === this.message.content) {
      this.clearInput(false); // Bearbeitungsmodus sofort verlassen, aber Inhalt beibehalten
      return;
    }
  
    const originalContent = this.message.content;
    this.message.content = this.editedMessageContent;
  
    this.clearInput(false); // Bearbeitungsmodus sofort verlassen, aber Inhalt beibehalten
  
    try {
      await this.messageService.updateMessageContent(
        this.message.messageId,
        this.editedMessageContent
      );
      console.log('Nachricht erfolgreich aktualisiert.');
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Nachricht:', error);
      this.message.content = originalContent; // Ursprünglichen Inhalt zurücksetzen
    } finally {
      this.clearInput(true); // Inhalt endgültig leeren
      this.isSaving = false; // Ladeindikator deaktivieren
      this.temporaryMessageContent.emit(''); // Temp-Text löschen, falls benötigt
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
