import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { ThreadService } from '../../../../shared/services/thread-service/thread.service';
import { ThreadMessage } from '../../../../shared/models/thread-message.model'; // Importiere ThreadMessage
import { ChannelService } from '../../../../shared/services/channel-service/channel.service';
import { getDoc } from 'firebase/firestore';
import { PickerComponent, PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { MatMenu, MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-thread-new-message',
  standalone: true,
  imports: [FormsModule, MatIcon, MatMenuModule, PickerModule, EmojiComponent, MatMenu, PickerComponent],
  templateUrl: './thread-new-message.component.html',
  styleUrls: ['./thread-new-message.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
  //       const threadDocRef = doc(
  //         this.firestore,
  //         `channels/${this.channelService.channelId}/messages/${currentMessage.messageId}`
  //       );
  
  //       const docSnapshot = await getDoc(threadDocRef);
  //       if (!docSnapshot.exists()) {
  //         console.error('Das Dokument existiert nicht:', threadDocRef.path);
  //         return;
  //       }
  
  //       const threadData = docSnapshot.data()?.['thread'] || {};
  
  //       // Neue ID generieren: Timestamp + zufällige Zahl zwischen 1 und 1000
  //       const timestamp = Date.now();
  //       const randomId = Math.floor(Math.random() * 1000) + 1; // Zufällige Zahl zwischen 1 und 1000
  //       const newMessageId = `thread_${timestamp}_${randomId}`;
  
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
  //           user: [ // Hier wird das User-Objekt in ein Array umgewandelt
  //             {
  //               userId: newMessage.user.userId, // Zugriff auf den ersten Benutzer
  //               userName: newMessage.user.userName,
  //               photoURL: newMessage.user.photoURL,
  //             },
  //           ],
  //           time: newMessage.time, // Zeitstempel hinzufügen
  //           messageId: newMessage.messageId,
  //         },
  //       });
  
  //       console.log('Nachricht erfolgreich in Firestore gespeichert.');
  
  //     } catch (error) {
  //       console.error('Fehler beim Speichern der Nachricht in Firestore:', error);
  //     }
  //   }
  // }
 
  async sendMessage(): Promise<void> {
    if (this.newMessageContent.trim().length > 0) {
      const currentMessage = this.threadService.actualMessageSubject.value;
      if (!currentMessage) {
        console.error('Es wurde keine aktuelle Nachricht ausgewählt.');
        return;
      }
  
      const channelId = this.channelService.channelId; // channelId zwischenspeichern
      try {
        const threadDocRef = doc(this.firestore, `channels/${channelId}/messages/${currentMessage.messageId}`);
        const docSnapshot = await getDoc(threadDocRef);
  
        if (!docSnapshot.exists()) {
          console.error('Das Dokument existiert nicht:', threadDocRef.path);
          return;
        }
  
                const timestamp = Date.now();
        const randomId = Math.floor(Math.random() * 1000) + 1; // Zufällige Zahl zwischen 1 und 1000
        const newMessageId = `thread_${timestamp}_${randomId}`;
        
        const newMessage = new ThreadMessage(
          this.newMessageContent.trim(),
          currentMessage.userId,
          newMessageId
        );
        this.newMessageContent = '';
  
        await updateDoc(threadDocRef, {
          [`thread.${newMessage.messageId}`]: {
            content: newMessage.content,
            user: [
              {
                userId: newMessage.userId,
              },
            ],
            time: newMessage.time,
            messageId: newMessage.messageId,
          },
        });
      } catch (error) {
        console.error('Fehler beim Speichern der Nachricht in Firestore:', error);
      }
    }
  }

  addEmoji(event: any) {
    console.log('Emoji selected:', event);
    const emoji = event.emoji.native || event.emoji;
    this.newMessageContent += emoji;
  }
  
}
