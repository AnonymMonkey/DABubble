import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChannelMessage } from '../../models/channel-message.model';
import { doc, updateDoc } from 'firebase/firestore';
import { enableIndexedDbPersistence, Firestore } from '@angular/fire/firestore';
import { ChannelService } from '../channel-service/channel.service';
import { docData } from 'rxfire/firestore';
import { UserService } from '../user-service/user.service';
import { UserData } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private firestore = inject(Firestore);
  private channelService = inject(ChannelService);
  private messages: ChannelMessage[] = [];
  private messagesSubject = new BehaviorSubject<ChannelMessage[]>(this.messages);
  messages$ = this.messagesSubject.asObservable();
  public editMessageId: string | null = null;

  private userService = inject(UserService);
  private actualMessageSubject = new BehaviorSubject<ChannelMessage | null>(null);
  actualMessage$ = this.actualMessageSubject.asObservable();

  addMessage(content: string, messageId: string, userId: string, userName: string) {
    const newMessage = new ChannelMessage(content, messageId, userId, userName);
    this.messages.push(newMessage);
    this.messagesSubject.next(this.messages);
  }

  getMessageUpdates(messageId: string): Observable<any> {
    const messageDocRef = doc(this.firestore, `messages/${messageId}`);
    return docData(messageDocRef, { idField: 'messageId' });
  }

   async updateMessageContent(messageId: string, newContent: string): Promise<void> {
    const messageRef = doc(this.firestore, `channels/${this.channelService.channelId}/messages/${messageId}`);
    await updateDoc(messageRef, { content: newContent });
    console.log('Nachricht erfolgreich aktualisiert');
  }

  setEditMessageId(messageId: string | null) {
    this.editMessageId = messageId;
  }

  setActualMessage(message: ChannelMessage): void {
    if (message !== this.actualMessageSubject.value) {
      this.actualMessageSubject.next(message);
    }
  }

async addOrChangeReaction(messageId: string, emoji: string): Promise<void> {
  const messageRef = doc(this.firestore, `channels/${this.channelService.channelId}/messages/${messageId}`);
  const currentMessage = this.actualMessageSubject.value;

  if (!currentMessage) {
      console.error('Aktuelle Nachricht nicht gefunden.');
      return;
  }

  // Abonniere das `userData$` Observable, um aktuelle Benutzerdaten zu erhalten
  this.userService.userData$.subscribe({
      next: async (currentUser: UserData) => {
          // Sicherstellen, dass alle Felder des Benutzers definiert sind
          if (!currentUser.uid || !currentUser.displayName || !currentUser.photoURL) {
              console.error('Benutzerdaten sind unvollständig.');
              return;
          }

          // Überprüfen, ob der Benutzer bereits auf irgendein Emoji reagiert hat
          const existingReactionIndex = currentMessage.reactions.findIndex(r => r.userIds.includes(currentUser.uid));
          console.log(existingReactionIndex);
          if (existingReactionIndex !== -1) {
              // Der Benutzer hat bereits eine Reaktion gesetzt - Emoji wechseln
              const oldEmoji = currentMessage.reactions[existingReactionIndex].emoji;

              // Entferne das alte Emoji
              currentMessage.reactions[existingReactionIndex].count -= 1;
              currentMessage.reactions[existingReactionIndex].userIds = currentMessage.reactions[existingReactionIndex].userIds.filter(uid => uid !== currentUser.uid);

              // Falls der `count` des alten Emojis 0 ist, entfernen wir es aus der Reaktionsliste
              if (currentMessage.reactions[existingReactionIndex].count === 0) {
                  currentMessage.reactions.splice(existingReactionIndex, 1);
              }
          }

          // Füge die neue Reaktion hinzu
          let reaction = currentMessage.reactions.find(r => r.emoji === emoji);
          if (reaction) {
              // Das Emoji existiert bereits, also erhöhe den Count und füge den Benutzer hinzu
              reaction.count += 1;
              reaction.userIds.push(currentUser.uid);
          } else {
              // Neues Emoji, also füge es der Liste hinzu
              currentMessage.reactions.push({
                  emoji: emoji,
                  count: 1,
                  userIds: [currentUser.uid]
              });
          }

          // Firestore-Dokument aktualisieren
          await updateDoc(messageRef, { reactions: currentMessage.reactions });
          this.actualMessageSubject.next(currentMessage);
      },
      error: (error) => console.error('Fehler beim Abrufen der Benutzerdaten:', error),
      complete: () => console.log('Benutzerdaten-Abonnement abgeschlossen.')
  });
}


}
