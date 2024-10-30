import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { ThreadService } from '../../../../shared/services/thread-service/thread.service';
import { ThreadMessage } from '../../../../shared/models/thread-message.model'; // Importiere ThreadMessage
import { ChannelService } from '../../../../shared/services/channel-service/channel.service';
import { getDoc } from 'firebase/firestore';

@Component({
  selector: 'app-thread-new-message',
  standalone: true,
  imports: [FormsModule, MatIcon],
  templateUrl: './thread-new-message.component.html',
  styleUrls: ['./thread-new-message.component.scss'],
})
export class ThreadNewMessageComponent {
  newMessageContent: string = '';

  constructor(
    private threadService: ThreadService,
    private firestore: Firestore,
    private channelService: ChannelService
  ) {}

  async sendMessage(): Promise<void> {
    // Nur überprüfen, ob die Nachricht nicht nur aus Leerzeichen besteht
    if (this.newMessageContent.length > 0) { 
      // Aktuelle Nachricht abrufen
      const currentMessage = this.threadService.actualMessageSubject.value;
      if (!currentMessage) {
        console.error('Es wurde keine aktuelle Nachricht ausgewählt.');
        return;
      }

      // Neue Thread-Nachricht erstellen
      const newMessageId = `thread_${Date.now()}`; // ID für die Thread-Nachricht
      const newMessage: ThreadMessage = new ThreadMessage(
        this.newMessageContent, // Speichere den Inhalt mit Leerzeichen
        currentMessage.user.userId,
        currentMessage.user.userName,
        currentMessage.user.photoURL,
        newMessageId // Verwende die generierte ID
      );

      // Nachricht im ThreadService hinzufügen
      await this.threadService.addMessageToCurrentThread(
        newMessage,
        this.channelService.channelId
      );

      // Nachricht in Firestore speichern
      try {
        const threadDocRef = doc(
          this.firestore,
          `channels/${this.channelService.channelId}/messages/${currentMessage.messageId}`
        );
        const docSnapshot = await getDoc(threadDocRef);
        if (!docSnapshot.exists()) {
          console.error('Das Dokument existiert nicht:', threadDocRef.path);
          return; // Oder handle die Situation entsprechend
        }

        // Speichern der neuen Thread-Nachricht unter dem aktuellen Thread
        await updateDoc(threadDocRef, {
          [`thread.${newMessage.messageId}`]: { // Verwende die messageId direkt
            content: newMessage.content, // Speichere den Inhalt mit Leerzeichen
            userId: newMessage.user.userId,
            userName: newMessage.user.userName,
            photoURL: newMessage.user.photoURL,
            time: newMessage.time, // Zeitstempel hinzufügen
          },
        });

        console.log('Nachricht erfolgreich in Firestore gespeichert.');
      } catch (error) {
        console.error(
          'Fehler beim Speichern der Nachricht in Firestore:',
          error
        );
      }

      // Textfeld zurücksetzen
      this.newMessageContent = '';
    }
  }
}
