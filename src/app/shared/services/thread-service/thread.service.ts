import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChannelMessage } from '../../models/channel-message.model';
import { Firestore, doc, updateDoc, collection, getDocs } from '@angular/fire/firestore';
import { ThreadMessage } from '../../models/thread-message.model';
import { getDoc, onSnapshot } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {
  public actualMessageSubject = new BehaviorSubject<ChannelMessage | null>(null);
  actualMessage$: Observable<ChannelMessage | null> = this.actualMessageSubject.asObservable();

  private threadMessagesSubject = new BehaviorSubject<ThreadMessage[]>([]);
  threadMessages$: Observable<ThreadMessage[]> = this.threadMessagesSubject.asObservable();

  private unsubscribeThreadMessages: (() => void) | null = null;

  constructor(private firestore: Firestore) {}

  setActualMessage(message: ChannelMessage): void {
    this.actualMessageSubject.next(message);
  }

  async addMessageToCurrentThread(newThreadMessage: ThreadMessage, channelId: string): Promise<void> {
    const currentMessage = this.actualMessageSubject.value;

    if (currentMessage) {
      const { messageId } = currentMessage;

      try {
        const messageDocRef = doc(this.firestore, `channels/${channelId}/messages/${messageId}`);
        await updateDoc(messageDocRef, {
          [`thread.${newThreadMessage.messageId}`]: {
            content: newThreadMessage.content,
            userId: newThreadMessage.user.userId,
            userName: newThreadMessage.user.userName,
            photoURL: newThreadMessage.user.photoURL,
            time: newThreadMessage.time
          }
        });

        console.log('Nachricht erfolgreich im Thread in Firestore gespeichert.');
      } catch (error) {
        console.error('Fehler beim Speichern der Nachricht in Firestore:', error);
      }
    } else {
      console.error('Es wurde keine aktuelle Nachricht ausgewählt.');
    }
  }

  getAndListenToThreadMessages(messageId: string, channelId: string): void {
    // Verweise auf die Unterkollektion der Thread-Nachrichten
    const threadRef = collection(this.firestore, `channels/${channelId}/messages/${messageId}/thread`);

    // Zuerst die aktuellen Daten abrufen
    getDocs(threadRef).then(querySnapshot => {
        const threadMessages: ThreadMessage[] = [];

        // Iteriere über die Dokumente in der Unterkollektion
        querySnapshot.forEach(doc => {
            const threadMessage = ThreadMessage.threadMessageConverter.fromFirestore(doc);
            console.log(threadMessage); // Zeige die abgerufene Thread-Nachricht in der Konsole an
            threadMessages.push(threadMessage);
        });

        // Die initialen Nachrichten an den Subject senden
        this.threadMessagesSubject.next(threadMessages);

        // Jetzt einen Listener für Live-Updates hinzufügen
        this.unsubscribeThreadMessages = onSnapshot(threadRef, snapshot => {
            const updatedMessages: ThreadMessage[] = [];

            // Iteriere über die aktualisierten Dokumente in der Unterkollektion
            snapshot.forEach(doc => {
                const threadMessage = ThreadMessage.threadMessageConverter.fromFirestore(doc);
                updatedMessages.push(threadMessage);
            });

            // Die aktualisierten Nachrichten an den Subject senden
            this.threadMessagesSubject.next(updatedMessages);
        });
    }).catch(error => {
        console.error('Fehler beim Abrufen der Thread-Nachrichten:', error);
        this.threadMessagesSubject.error(error);
    });
}
  
  unsubscribe(): void {
    if (this.unsubscribeThreadMessages) {
      this.unsubscribeThreadMessages();
      this.unsubscribeThreadMessages = null;
    }
  }
}
