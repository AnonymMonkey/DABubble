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

  async addOrChangeReaction(messageId: string, emoji: any): Promise<void> {
    const messageRef = doc(this.firestore, `channels/${this.channelService.channelId}/messages/${messageId}`);
    const currentMessage = this.actualMessageSubject.value;

    if (!currentMessage) {
        console.error('Aktuelle Nachricht nicht gefunden.');
        return;
    }

    this.userService.userData$.subscribe({
        next: async (currentUser: UserData) => {
            if (!currentUser.uid || !currentUser.displayName || !currentUser.photoURL) {
                console.error('Benutzerdaten sind unvollständig.');
                return;
            }

            // Emoji-Vergleich anpassen: Vergleiche z.B. anhand von `shortName`
            const existingReaction = currentMessage.reactions.find(
                r => r.emoji.shortName === emoji.shortName
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
