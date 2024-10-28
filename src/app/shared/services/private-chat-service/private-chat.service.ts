import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  docData,
  setDoc,
  FirestoreDataConverter,
  DocumentReference,
  DocumentSnapshot,
  DocumentData,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable, combineLatest, from, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { PrivateChat } from '../../models/private-chat.model';
import { ChannelMessage } from '../../models/channel-message.model';
import { arrayUnion, getDoc, updateDoc } from 'firebase/firestore';
import { ActivatedRoute } from '@angular/router';
import { UserData } from '../../models/user.model';

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
      user: data['user'] || [],
    } as PrivateChat;
  },
};

@Injectable({
  providedIn: 'root',
})
export class PrivateChatService {
  private currentPrivateChatSubject = new BehaviorSubject<
    PrivateChat | undefined
  >(undefined);
  public currentPrivateChat$ = this.currentPrivateChatSubject.asObservable();

  constructor(private firestore: Firestore, private route: ActivatedRoute) {}

  // Methode zum Hinzufügen eines neuen privaten Chats
  addPrivateChat(
    currentUserId: string,
    privateChatId: string,
    otherUser: { userId: string; userName: string; photoURL: string }
  ): Observable<void> {
    const newPrivateChat = new PrivateChat(privateChatId);
    newPrivateChat.user[0] = otherUser; // Setze den anderen Benutzer

    const privateChatDocRef = doc(
      this.firestore,
      `users/${currentUserId}/privateChat/${privateChatId}`
    ).withConverter(privateChatConverter);
    return from(setDoc(privateChatDocRef, newPrivateChat)).pipe(
      tap(() => this.currentPrivateChatSubject.next(newPrivateChat))
    );
  }

  // Methode zum Hinzufügen einer Nachricht zu einem privaten Chat
  addMessageToPrivateChat(
    currentUserId: string,
    privateChatId: string,
    message: ChannelMessage
  ): Observable<void> {
    const privateChatDocRef = doc(
      this.firestore,
      `users/${currentUserId}/privateChat/${privateChatId}`
    ).withConverter(privateChatConverter);

    return from(
      setDoc(
        privateChatDocRef,
        {
          messages: [message], // Achte darauf, dass message jetzt richtig umgewandelt wird
        },
        { merge: true }
      )
    );
  }

  //ANCHOR - Methode zum Abrufen eines privaten Chats

  getPrivateChats(userRef: DocumentReference): Observable<any[]> {
    return from(getDoc(userRef)).pipe(
      map((userDoc) => userDoc.data()?.['privateChat'] || [])
    );
  }

  findExistingChat(privateChat: any[], chatId: string): string | null {
    return privateChat.find((chat) => chat.chatId === chatId) ? chatId : null;
  }

  createNewChatEntry(
    currentUser: UserData,
    targetUser: UserData,
    chatId: string
  ) {
    return {
      chatId,
      user: [
        {
          userId: currentUser.uid,
          userName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        },
        {
          userId: targetUser.uid,
          userName: targetUser.displayName,
          photoURL: targetUser.photoURL,
        },
      ],
      messages: [],
    };
  }

  updateUsersChats(
    currentUserRef: DocumentReference,
    targetUserRef: DocumentReference,
    newChat: any
  ): Observable<string> {
    return from(
      Promise.all([
        updateDoc(currentUserRef, { privateChat: arrayUnion(newChat) }),
        updateDoc(targetUserRef, { privateChat: arrayUnion(newChat) }),
      ])
    ).pipe(
      map(() => newChat.chatId),
      catchError((error) => {
        console.error('Fehler beim Erstellen des privaten Chats:', error);
        return of(''); // Hier '' zurückgeben statt null
      })
    );
  }

  openOrCreatePrivateChat(
    currentUser: UserData,
    targetUser: UserData
  ): Observable<string> {
    const chatId = this.generateChatId(currentUser.uid, targetUser.uid);
    const currentUserRef = doc(this.firestore, 'users', currentUser.uid);
    const targetUserRef = doc(this.firestore, 'users', targetUser.uid);

    // Zuerst prüfen wir auf vorhandene Chats im Dokument beider Benutzer
    return combineLatest([
      this.getPrivateChats(currentUserRef),
      this.getPrivateChats(targetUserRef),
    ]).pipe(
      switchMap(([currentUserChats, targetUserChats]) => {
        const existingChatCurrentUser = this.findExistingChat(
          currentUserChats,
          chatId
        );
        const existingChatTargetUser = this.findExistingChat(
          targetUserChats,
          chatId
        );

        // Falls der Chat bereits existiert, gibt die ID zurück
        if (existingChatCurrentUser || existingChatTargetUser) {
          return of(chatId);
        } else {
          // Falls der Chat in keinem der beiden Dokumente existiert, wird er erstellt
          const newChat = this.createNewChatEntry(
            currentUser,
            targetUser,
            chatId
          );
          return this.updateUsersChats(currentUserRef, targetUserRef, newChat);
        }
      })
    );
  }

  generateChatId(uid1: string, uid2: string): string {
    return [uid1, uid2].sort().join('_');
  }
}
