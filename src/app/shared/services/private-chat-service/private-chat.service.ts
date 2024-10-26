import { Injectable } from '@angular/core';
import { Firestore, doc, docData, setDoc, FirestoreDataConverter, DocumentReference, DocumentSnapshot, DocumentData } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrivateChat } from '../../models/private-chat.model';
import { ChannelMessage } from '../../models/channel-message.model';

// FirestoreDataConverter für PrivateChat
const privateChatConverter: FirestoreDataConverter<PrivateChat> = {
  toFirestore(chat: PrivateChat): DocumentData {
    return { ...chat };
  },
  fromFirestore(snapshot: DocumentSnapshot<DocumentData>): PrivateChat {
    const data = snapshot.data() || {};
    return {
      chatId: snapshot.id,
      messages: data['messages'] || [],
      user: data['user'] || []
    } as PrivateChat;
  }
};

@Injectable({
  providedIn: 'root'
})
export class PrivateChatService {
  private currentPrivateChatSubject = new BehaviorSubject<PrivateChat | undefined>(undefined);
  public currentPrivateChat$ = this.currentPrivateChatSubject.asObservable();

  constructor(private firestore: Firestore) {}

  // Methode zum Abrufen eines privaten Chats
  getPrivateChat(currentUserId: string, privateChatId: string): Observable<PrivateChat | undefined> {
    const privateChatDocRef = doc(this.firestore, `users/${currentUserId}/privateChat/${privateChatId}`).withConverter(privateChatConverter);
    
    return docData<PrivateChat>(privateChatDocRef).pipe(
      tap((data) => {
        this.currentPrivateChatSubject.next(data);
      })
    );
  }

  // Methode zum Hinzufügen eines neuen privaten Chats
  addPrivateChat(currentUserId: string, privateChatId: string, otherUser: { userId: string; userName: string; photoURL: string; }): Observable<void> {
    const newPrivateChat = new PrivateChat(privateChatId);
    newPrivateChat.user[0] = otherUser; // Setze den anderen Benutzer

    const privateChatDocRef = doc(this.firestore, `users/${currentUserId}/privateChat/${privateChatId}`).withConverter(privateChatConverter);
    return from(setDoc(privateChatDocRef, newPrivateChat)).pipe(
      tap(() => this.currentPrivateChatSubject.next(newPrivateChat))
    );
  }

  // Methode zum Hinzufügen einer Nachricht zu einem privaten Chat
  addMessageToPrivateChat(currentUserId: string, privateChatId: string, message: ChannelMessage): Observable<void> {
    const privateChatDocRef = doc(this.firestore, `users/${currentUserId}/privateChat/${privateChatId}`).withConverter(privateChatConverter);
       
    return from(setDoc(privateChatDocRef, {
      messages: [message], // Achte darauf, dass message jetzt richtig umgewandelt wird
    }, { merge: true }));
  }
  

  // Methode zum Hören auf Chat-Updates
  listenForChatUpdates(currentUserId: string, privateChatId: string): Observable<PrivateChat | undefined> {
    const privateChatDocRef = doc(this.firestore, `users/${currentUserId}/privateChat/${privateChatId}`).withConverter(privateChatConverter);
    
    return docData<PrivateChat>(privateChatDocRef).pipe(
      tap((docSnapshot) => {
        this.currentPrivateChatSubject.next(docSnapshot);
      })
    );
  }
}
