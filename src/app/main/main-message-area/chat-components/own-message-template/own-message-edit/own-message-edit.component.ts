import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MessageService } from '../../../../../shared/services/message-service/message.service';
import { NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Importiere das ProgressSpinnerModule

@Component({
  selector: 'app-own-message-edit',
  standalone: true,
  imports: [MatIcon, FormsModule, NgIf, MatProgressSpinnerModule],
  templateUrl: './own-message-edit.component.html',
  styleUrls: ['./own-message-edit.component.scss'],
})
export class OwnMessageEditComponent implements OnInit {
  @Input() message: any;
  editedMessageContent: string = '';
  isSaving = false; // Variable für den Ladeindikator
  private messageService = inject(MessageService);

  ngOnInit() {
    if (this.message) {
      this.editedMessageContent = this.message.content;
    }
  }

  async changeMessage() {
    if (this.editedMessageContent === this.message.content) {
      console.log('Keine Änderungen zum Speichern.');
      this.clearInput();
      return;
    }

    this.isSaving = true; // Ladeindikator aktivieren
    const originalContent = this.message.content;
    this.message.content = this.editedMessageContent;

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
      this.clearInput();
    }
  }

  clearInput() {
    this.messageService.setEditMessageId(null); // Verlässt den Bearbeitungsmodus
    this.isSaving = false; // Ladeindikator deaktivieren
    this.editedMessageContent = '';
  }
}
