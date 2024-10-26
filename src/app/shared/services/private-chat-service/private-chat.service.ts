import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, onSnapshot } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { PrivateChat } from '../../models/private-chat.model';
import { ChannelMessage } from '../../models/channel-message.model';

@Injectable({
  providedIn: 'root'
})
export class PrivateChatService {
  private currentPrivateChatSubject: BehaviorSubject<PrivateChat | undefined> = new BehaviorSubject<PrivateChat | undefined>(undefined);
  public currentPrivateChat$: Observable<PrivateChat | undefined> = this.currentPrivateChatSubject.asObservable();

  constructor(private firestore: Firestore) {}

  // Methode zum Abrufen eines privaten Chats
  async getPrivateChat(currentUserId: string, privateChatId: string): Promise<void> {
    const privateChatDocRef = doc(this.firestore, `users/${currentUserId}/privateChat/${privateChatId}`);
    
    try {
      const privateChatDoc = await getDoc(privateChatDocRef);
      console.log("Private Chat Document:", privateChatDoc);
      
      if (privateChatDoc.exists()) {
        const privateChatData = privateChatDoc.data() as PrivateChat;
        this.currentPrivateChatSubject.next(privateChatData);
        this.listenForChatUpdates(currentUserId, privateChatId);
      } else {
        console.error("Kein privater Chat gefunden!");
      }
    } catch (error) {
      console.error("Fehler beim Abrufen des privaten Chats:", error);
    }
  }

  // Methode zum Hinzufügen eines neuen privaten Chats
  async addPrivateChat(currentUserId: string, privateChatId: string, otherUser: { userId: string; userName: string; photoURL: string; }): Promise<void> {
    const newPrivateChat = new PrivateChat(privateChatId);
    newPrivateChat.user[0] = otherUser; // Setze den anderen Benutzer

    const privateChatDocRef = doc(this.firestore, `users/${currentUserId}/privateChat/${privateChatId}`);
    await setDoc(privateChatDocRef, { ...newPrivateChat });
    this.currentPrivateChatSubject.next(newPrivateChat);
  }

  // Methode zum Hinzufügen einer Nachricht zu einem privaten Chat
  async addMessageToPrivateChat(currentUserId: string, privateChatId: string, message: ChannelMessage): Promise<void> {
    const privateChatDocRef = doc(this.firestore, `users/${currentUserId}/privateChat/${privateChatId}`);

    // Nachricht zur Firestore-Datenbank hinzufügen
    await setDoc(privateChatDocRef, {
      messages: [message],
      // Hier könnten weitere Felder sein, je nach deiner Struktur
    }, { merge: true });
  }

  // Methode zum Hören auf Chat-Updates
  private listenForChatUpdates(currentUserId: string, privateChatId: string): void {
    const privateChatDocRef = doc(this.firestore, `users/${currentUserId}/privateChat/${privateChatId}`);

    // Firestore Listener für Echtzeit-Updates
    onSnapshot(privateChatDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const privateChatData = docSnapshot.data() as PrivateChat;
        this.currentPrivateChatSubject.next(privateChatData);
      } else {
        console.error("Dokument für Echtzeit-Updates nicht gefunden!");
      }
    });
  }
}
