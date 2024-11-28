import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChannelMessage } from '../../models/channel-message.model';
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { collectionData, docData } from 'rxfire/firestore';
import { UserService } from '../user-service/user.service';
import { UserData } from '../../models/user.model';
import { ThreadMessage } from '../../models/thread-message.model';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private firestore = inject(Firestore);
  private messages: ChannelMessage[] = [];
  private messagesSubject = new BehaviorSubject<ChannelMessage[]>(
    this.messages
  );
  messages$ = this.messagesSubject.asObservable();
  public editMessageId: string | null = null;

  private userService = inject(UserService);
  private actualMessageSubject = new BehaviorSubject<ChannelMessage | null>(
    null
  );
  actualMessage$ = this.actualMessageSubject.asObservable();

  private messagesDataMap = new Map<string, Map<string, ChannelMessage>>(); // Map für Nachrichten pro Channel
  private messagesDataMapSubject = new BehaviorSubject<
    Map<string, Map<string, ChannelMessage>>
  >(this.messagesDataMap);

  get messagesDataMap$() {
    return this.messagesDataMapSubject.asObservable();
  }

  areMapsEqual(map1: Map<string, ChannelMessage>, map2: Map<string, ChannelMessage>): boolean {
    if (map1.size !== map2.size) return false;
    for (let [key, value] of map1) {
      const otherValue = map2.get(key);
      if (!otherValue || value.messageId !== otherValue.messageId) {
        return false;
      }
    }
    return true;
  }

  loadMessagesForChannel(channelId: string): void {
    const messagesCollection = collection(this.firestore, `channels/${channelId}/messages`);
  
    collectionData(messagesCollection, { idField: 'messageId' }).subscribe((messages) => {
      const messageMap = new Map<string, ChannelMessage>();
  
      messages.forEach((messageData) => {
        const message = new ChannelMessage(
          messageData['content'],
          messageData['userId'],
          messageData['messageId'],
          messageData['time'],
          messageData['attachmentUrls'] || []
        );
  
        // Reaktionen hinzufügen
        message.reactions = (messageData['reactions'] || []).map((reaction: any) => ({
          emoji: reaction.emoji,
          count: reaction.count,
          userIds: Array.isArray(reaction.userIds) ? reaction.userIds : [],
        }));
  
        // Threads laden
        const threadData = messageData['thread'] || {};
        message.thread = Object.fromEntries(
          Object.entries(threadData).map(([threadId, threadMessageData]: [string, any]) => [
            threadId,
            new ThreadMessage(
              threadMessageData.content,
              threadMessageData.userId,
              threadId,
              threadMessageData.reactions || [],
              threadMessageData.time,
              threadMessageData.attachmentUrls || []
            ),
          ])
        );
  
        messageMap.set(message.messageId, message);
      });
  
      // Vergleiche alte und neue Map, bevor du das Subject aktualisierst
      if (!this.areMapsEqual(this.messagesDataMap.get(channelId) || new Map(), messageMap)) {
        // Wenn sich die Nachrichten geändert haben, aktualisiere die Map
        this.messagesDataMap.set(channelId, messageMap);
        this.messagesDataMapSubject.next(new Map(this.messagesDataMap));
      }
    });
  }

  getThreadsForMessage(
    channelId: string,
    messageId: string
  ): { [threadId: string]: ThreadMessage } | undefined {
    const messageMap = this.messagesDataMap.get(channelId);
    const message = messageMap?.get(messageId);
    return message?.thread;
  }

  getMessageUpdates(messageId: string): Observable<any> {
    const messageDocRef = doc(this.firestore, `messages/${messageId}`);
    return docData(messageDocRef, { idField: 'messageId' });
  }

  async updateMessageContentPrivateChat(
    privateChatId: string,
    messageId: string,
    newContent: string
  ): Promise<void> {
    const userId = this.userService.userId;

    if (!userId || !privateChatId || !messageId) {
      console.error('Fehlende Benutzer-ID, Private-Chat-ID oder Message-ID.');
      return;
    }

    // Referenz für das Benutzerdokument im Firestore
    const userDocRef = doc(this.firestore, `users/${userId}`);

    try {
      // Abrufen des Benutzerdokuments
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        // Aktuelle Daten des `privateChat`-Objekts abrufen
        const privateChatData = userDocSnapshot.data()?.['privateChat'];
        const messages = privateChatData?.[privateChatId]?.messages;

        if (messages && messages[messageId]) {
          // Nachricht aktualisieren
          messages[messageId].content = newContent;

          // Die Änderungen im Benutzerdokument speichern
          await updateDoc(userDocRef, {
            [`privateChat.${privateChatId}.messages.${messageId}.content`]:
              newContent,
          });
        } else {
          console.log('Nachricht existiert nicht.');
        }
      } else {
        console.log('Benutzerdokument existiert nicht.');
      }
    } catch (error) {
      console.error(
        'Fehler beim Aktualisieren der Nachricht im Firestore:',
        error
      );
      throw error;
    }
  }

  setEditMessageId(messageId: string | null) {
    this.editMessageId = messageId;
  }

  setActualMessage(message: ChannelMessage): void {
    if (message !== this.actualMessageSubject.value) {
      this.actualMessageSubject.next(message);
    }
  }

  async addOrChangeReactionChannelOrThread(
    emoji: any,
    path: string
  ): Promise<void> {
    const messageRef = doc(this.firestore, path);
    const currentMessage = this.actualMessageSubject.value;

    if (!currentMessage) {
      console.error('Aktuelle Nachricht nicht gefunden.');
      return;
    }

    if (!currentMessage.reactions) {
      currentMessage.reactions = [];
    }

    this.userService.userData$.subscribe({
      next: async (currentUser: UserData) => {
        if (
          !currentUser.uid ||
          !currentUser.displayName ||
          !currentUser.photoURL
        ) {
          console.error('Benutzerdaten sind unvollständig.');
          return;
        }

        const existingReaction = currentMessage.reactions.find(
          (r) => r.emoji.shortName === emoji.shortName
        );

        if (existingReaction) {
          // Überprüfen, ob der Benutzer bereits auf dieses Emoji reagiert hat
          if (existingReaction.userIds.includes(currentUser.uid)) {
            return;
          } else {
            // Emoji existiert, aber der Benutzer hat es noch nicht hinzugefügt
            existingReaction.count += 1;
            existingReaction.userIds.push(currentUser.uid);
          }
        } else {
          // Emoji existiert noch nicht, daher als neue Reaktion hinzufügen
          currentMessage.reactions.push({
            emoji: emoji,
            count: 1,
            userIds: [currentUser.uid],
          });
        }

        // Firestore-Dokument aktualisieren
        await updateDoc(messageRef, { reactions: currentMessage.reactions });
        this.actualMessageSubject.next(currentMessage);
      },
      error: (error) =>
        console.error('Fehler beim Abrufen der Benutzerdaten:', error),
      complete: () => console.log('Benutzerdaten-Abonnement abgeschlossen.'),
    });
  }

  async deleteMessage(privateChatId: string, messageId: string): Promise<void> {
    try {
      const [user1Id, user2Id] = privateChatId.split('_');
      const user1DocRef = doc(this.firestore, `users/${user1Id}`);
      const user2DocRef = doc(this.firestore, `users/${user2Id}`);
      await Promise.all([
        updateDoc(user1DocRef, {
          [`privateChat.${privateChatId}.messages.${messageId}`]: deleteField(),
        }),
        updateDoc(user2DocRef, {
          [`privateChat.${privateChatId}.messages.${messageId}`]: deleteField(),
        }),
      ]);
    } catch (error) {
      console.error(
        'Fehler beim Löschen der Nachricht bei beiden Nutzern:',
        error
      );
      throw error;
    }
  }

  async updateMessageThreadOrChannel(
    path: string,
    newContent: string
  ): Promise<void> {
    const messageRef = doc(this.firestore, path);
    try {
      await updateDoc(messageRef, { content: newContent });
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Nachricht:', error);
      throw error;
    }
  }

  async deleteMessageInThreadOrChannel(path: string): Promise<void> {
    try {
      const threadMessageRef = doc(this.firestore, path);
      await deleteDoc(threadMessageRef);
    } catch (error) {
      console.error('Fehler beim Löschen der Nachricht im Thread:', error);
      throw error;
    }
  }
}
