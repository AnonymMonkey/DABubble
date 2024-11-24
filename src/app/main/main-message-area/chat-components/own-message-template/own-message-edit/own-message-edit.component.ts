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
import {
  getFirestore,
  doc,
  deleteDoc,
  getDoc,
  collection,
} from 'firebase/firestore';

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
  @Output() temporaryMessageContent = new EventEmitter<string>(); // EventEmitter für den temporären Text
  editedMessageContent: string = '';
  isSaving = false;
  private messageService = inject(MessageService);
  private channelService = inject(ChannelService);
  private messageSubscription!: Subscription;
  currentBorderRadius = '30px 30px 30px 30px';

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
      const path =
        'channels/' +
        this.channelService.channelId +
        '/messages/' +
        this.message.messageId;
      if (
        !this.editedMessageContent.trim() &&
        this.message.attachmentUrls.length === 0
      ) {
        await this.messageService.deleteMessageInThreadOrChannel(path);
      } else {
        await this.messageService.updateMessageThreadOrChannel(
          path,
          this.editedMessageContent
        );
      }
    } catch (error) {
      this.message.content = originalContent; // Ursprünglichen Inhalt zurücksetzen
    } finally {
      this.clearInput(true); // Inhalt endgültig leeren
      this.isSaving = false; // Ladeindikator deaktivieren
      this.temporaryMessageContent.emit(''); // Temp-Text löschen, falls benötigt
    }
  }

  // Lösche die Nachricht
  async deleteChannelMessage(
    channelId: string,
    messageId: string
  ): Promise<void> {
    const db = getFirestore(); // Firestore-Instanz erhalten

    // Nachrichtendokument aus der Sammlung holen
    const messageDocRef = doc(db, 'channels', channelId, 'messages', messageId);

    try {
      // Überprüfen, ob die Nachricht existiert
      const messageDoc = await getDoc(messageDocRef);
      if (messageDoc.exists()) {
        // Löschen der Nachricht
        await deleteDoc(messageDocRef);
      } else {
        console.error('Nachricht nicht gefunden');
      }
    } catch (error) {
      console.error('Fehler beim Löschen der Nachricht:', error);
      throw error;
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
