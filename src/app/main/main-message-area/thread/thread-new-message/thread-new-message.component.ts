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


  // async sendMessage(): Promise<void> {
  //   // Nur überprüfen, ob die Nachricht nicht nur aus Leerzeichen besteht
  //   if (this.newMessageContent.trim().length > 0) {
  //     // Aktuelle Nachricht abrufen
  //     const currentMessage = this.threadService.actualMessageSubject.value;
  //     if (!currentMessage) {
  //       console.error('Es wurde keine aktuelle Nachricht ausgewählt.');
  //       return;
  //     }
  
  //     try {
  //       // Firestore-Referenz für die Nachrichten im aktuellen Channel
  //       const threadDocRef = doc(
  //         this.firestore,
  //         `channels/${this.channelService.channelId}/messages/${currentMessage.messageId}`
  //       );
  
  //       // Abrufen der bestehenden Thread-Nachrichten im Dokument
  //       const docSnapshot = await getDoc(threadDocRef);
  //       if (!docSnapshot.exists()) {
  //         console.error('Das Dokument existiert nicht:', threadDocRef.path);
  //         return;
  //       }
  
  //       // Aktuelle Thread-Nachrichten abrufen
  //       const threadData = docSnapshot.data()?.['thread'] || {};
  //       const messageIds = Object.keys(threadData);
  
  //       // Letzte ID finden und eine neue ID erstellen
  //       const lastId = messageIds.reduce((maxId, id) => {
  //         const numericId = parseInt(id.split('_')[1], 10);
  //         return !isNaN(numericId) && numericId > maxId ? numericId : maxId;
  //       }, 0);
  //       const newMessageId = `thread_${lastId + 1}`;
  
  //       // Neue Thread-Nachricht erstellen
  //       const newMessage: ThreadMessage = new ThreadMessage(
  //         this.newMessageContent.trim(),
  //         currentMessage.user.userId,
  //         currentMessage.user.userName,
  //         currentMessage.user.photoURL,
  //         newMessageId
  //       );
  //       this.newMessageContent = '';
  //       // Speichern der neuen Thread-Nachricht in Firestore
  //       await updateDoc(threadDocRef, {
  //         [`thread.${newMessage.messageId}`]: {
  //           content: newMessage.content,
  //           user: [  // Hier wird das User-Objekt in ein Array umgewandelt
  //             {
  //               userId: newMessage.user.userId,    // Zugriff auf den ersten Benutzer
  //               userName: newMessage.user.userName,
  //               photoURL: newMessage.user.photoURL,
  //             },
  //           ],
  //           time: newMessage.time, // Zeitstempel hinzufügen
  //           messageId: newMessage.messageId,
  //         },
  //       });
        
  
  //       console.log('Nachricht erfolgreich in Firestore gespeichert.');
  
  //       // Textfeld zurücksetzen
        
  //     } catch (error) {
  //       console.error('Fehler beim Speichern der Nachricht in Firestore:', error);
  //     }
  //   }
  // }

  async sendMessage(): Promise<void> {
    // Nur überprüfen, ob die Nachricht nicht nur aus Leerzeichen besteht
    if (this.newMessageContent.trim().length > 0) {
      // Aktuelle Nachricht abrufen
      const currentMessage = this.threadService.actualMessageSubject.value;
      if (!currentMessage) {
        console.error('Es wurde keine aktuelle Nachricht ausgewählt.');
        return;
      }
      try {
        // Firestore-Referenz für die Nachrichten im aktuellen Channel
        const threadDocRef = doc(
          this.firestore,
          `channels/${this.channelService.channelId}/messages/${currentMessage.messageId}`
        );
  
        // Abrufen der bestehenden Thread-Nachrichten im Dokument
        const docSnapshot = await getDoc(threadDocRef);
        if (!docSnapshot.exists()) {
          console.error('Das Dokument existiert nicht:', threadDocRef.path);
          return;
        }
  
        // Aktuelle Thread-Nachrichten abrufen
        const threadData = docSnapshot.data()?.['thread'] || {};
        const messageIds = Object.keys(threadData);
  
        // Neue ID generieren: Timestamp + zufällige Zahl zwischen 1 und 1000
        const timestamp = Date.now();
        const randomId = Math.floor(Math.random() * 1000) + 1; // Zufällige Zahl zwischen 1 und 1000
        const newMessageId = `thread_${timestamp}_${randomId}`;
  
        // Neue Thread-Nachricht erstellen
        const newMessage: ThreadMessage = new ThreadMessage(
          this.newMessageContent.trim(),
          currentMessage.user.userId,
          currentMessage.user.userName,
          currentMessage.user.photoURL,
          newMessageId
        );
        this.newMessageContent = '';
  
        // Speichern der neuen Thread-Nachricht in Firestore
        await updateDoc(threadDocRef, {
          [`thread.${newMessage.messageId}`]: {
            content: newMessage.content,
            user: [ // Hier wird das User-Objekt in ein Array umgewandelt
              {
                userId: newMessage.user.userId, // Zugriff auf den ersten Benutzer
                userName: newMessage.user.userName,
                photoURL: newMessage.user.photoURL,
              },
            ],
            time: newMessage.time, // Zeitstempel hinzufügen
            messageId: newMessage.messageId,
          },
        });
  
        console.log('Nachricht erfolgreich in Firestore gespeichert.');
  
      } catch (error) {
        console.error('Fehler beim Speichern der Nachricht in Firestore:', error);
      }
    }
  }
  
}
