import { Injectable, OnDestroy } from '@angular/core';
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
import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  combineLatest,
  from,
  of,
} from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { PrivateChat } from '../../models/private-chat.model';
import { ChannelMessage } from '../../models/channel-message.model';
import {
  arrayUnion,
  collection,
  getDoc,
  onSnapshot,
  updateDoc,
  where,
  query,
  getDocs,
} from 'firebase/firestore';
import { ActivatedRoute } from '@angular/router';
import { UserData } from '../../models/user.model';
import { UserService } from '../user-service/user.service';
import { ThreadMessage } from '../../models/thread-message.model';

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
export class PrivateChatService implements OnDestroy {
  private currentPrivateChatSubject = new BehaviorSubject<
    PrivateChat | undefined
  >(undefined);
  public currentPrivateChat$ = this.currentPrivateChatSubject.asObservable();

  private actualMessageSubject = new BehaviorSubject<ThreadMessage | null>(
    null
  );
  actualMessage$: Observable<ThreadMessage | null> =
    this.actualMessageSubject.asObservable();

  private unsubscribeActualMessage: (() => void) | null = null;
  private destroy$ = new Subject<void>();
  public privateChatId: string | null = null;

  constructor(private firestore: Firestore, private userService: UserService) {}

  setPrivateChatId(privateChatId: string): void {
    this.privateChatId = privateChatId;
  }

  async setActualMessage(messageId: string): Promise<void> {
    const userId = this.userService.userId;

    if (userId && this.privateChatId) {
      const userDocRef = doc(this.firestore, `users/${userId}`);
      try {
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const privateChatData = userDocSnapshot.data()?.['privateChat'];
          const messages = privateChatData?.[this.privateChatId]?.messages;

          if (messages && messages[messageId]) {
            const updatedMessage = messages[messageId] as ThreadMessage;
            this.actualMessageSubject.next(updatedMessage);
          } else {
            console.log('Nachricht existiert nicht.');
          }
        } else {
          console.log('Benutzerdokument existiert nicht.');
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der Nachricht:', error);
      }
    } else {
      console.error('Benutzer-ID oder Private-Chat-ID fehlt.');
    }
  }

  // Methode zum Hinzufügen einer Nachricht zu einem privaten Chat
  addMessageToPrivateChat(
    currentUserId: string,
    privateChatId: string,
    message: ThreadMessage
  ): Observable<void> {
    const privateChatDocRef = this.getPrivateChatDocRef(
      currentUserId,
      privateChatId
    );

    return from(
      setDoc(
        privateChatDocRef,
        { messages: arrayUnion(message) },
        { merge: true }
      )
    ).pipe(
      catchError((error) => {
        console.error('Fehler beim Hinzufügen der Nachricht:', error);
        return of(undefined); // Rückgabe von undefined bei Fehler
      })
    );
  }

  // Methode zum Abrufen eines spezifischen privaten Chats
  // Methode zum Abrufen eines spezifischen privaten Chats
  getPrivateChat(
    currentUserId: string,
    privateChatId: string
  ): Observable<PrivateChat | undefined> {
    const privateChatDocRef = doc(
      this.firestore,
      `users/${currentUserId}/privateChat/${privateChatId}`
    ).withConverter(privateChatConverter);

    return docData<PrivateChat>(privateChatDocRef).pipe(
      // Hier den Typ hinzugefügt
      catchError((error) => {
        console.error('Fehler beim Abrufen des privaten Chats:', error);
        return of(undefined); // Rückgabe von undefined bei Fehler
      })
    );
  }

  // Methode zum Abrufen aller privaten Chats eines Benutzers
  getPrivateChats(userRef: DocumentReference): Observable<any[]> {
    return from(getDoc(userRef)).pipe(
      map((userDoc) => {
        const data = userDoc.data();
        const privateChats = data?.['privateChat'];
        if (privateChats && typeof privateChats === 'object') {
          return Object.values(privateChats);
        }
        return [];
      }),
      catchError((error) => {
        console.error('Fehler beim Abrufen der privaten Chats:', error);
        return of([]); // Rückgabe eines leeren Arrays bei Fehler
      })
    );
  }

  findExistingChat(privateChat: any[], chatId: string): string | null {
    if (!Array.isArray(privateChat)) {
      console.error('privateChat ist kein Array:', privateChat);
      return null;
    }
    return privateChat.find((chat) => chat.chatId === chatId) ? chatId : null;
  }

  //ANCHOR - Robin - chatID außerhalb und innerhalb Objekt.
  createNewChatEntry(
    currentUser: UserData,
    targetUser: UserData,
    chatId: string
  ) {
    return {
      [chatId]: {
        // Äußere Ebene, wo die ID als Schlüssel dient
        chatId, // Innere Ebene mit derselben ID als Wert
        user: [
          {
            userId: currentUser.uid,
          },
          {
            userId: targetUser.uid,
          },
        ],
        messages: [],
      },
    };
  }

  //ANCHOR - Robin - Leichte Umstrukturierung der Methode, um die ID außerhalb als Schlüssel und zusätzlich innerhalb des Objekts zu erstellen.
  updateUsersChats(
    currentUserRef: DocumentReference,
    targetUserRef: DocumentReference,
    newChat: any
  ): Observable<string> {
    const chatId = Object.keys(newChat)[0]; // Holt die äußere ID
    const chatData = newChat[chatId]; // Zugriff auf das innere Objekt mit Chatdaten
    return from(
      Promise.all([
        updateDoc(currentUserRef, { [`privateChat.${chatId}`]: chatData }),
        updateDoc(targetUserRef, { [`privateChat.${chatId}`]: chatData }),
      ])
    ).pipe(
      map(() => chatId),
      catchError((error) => {
        console.error(
          'Fehler beim Aktualisieren der Chats der Benutzer:',
          error
        );
        return of(''); // Rückgabe eines leeren Strings bei Fehler
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

        if (existingChatCurrentUser || existingChatTargetUser) {
          return of(chatId); // Chat existiert bereits
        } else {
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

  unsubscribe(): void {
    if (this.unsubscribeActualMessage) {
      this.unsubscribeActualMessage();
      this.unsubscribeActualMessage = null;
      console.log('Aktueller Nachrichten-Listener erfolgreich entfernt.');
    }
  }

  generateChatId(uid1: string, uid2: string): string {
    return [uid1, uid2].sort().join('_');
  }

  async addOrChangeReactionPrivateChat(
    messageId: string,
    emoji: { shortName: string; [key: string]: any }
  ): Promise<void> {
    if (!this.privateChatId || !messageId) {
      console.error('Private-Chat-ID oder Nachrichten-ID fehlt.');
      return;
    }

    const userId = this.userService.userId;

    try {
      // Abrufen der Benutzerdaten aus `users/{userId}`
      const userDocRef = doc(this.firestore, `users/${userId}`);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();

      if (!userData) {
        console.error('Benutzer existiert nicht.');
        return;
      }

      // `privateChat`-Daten innerhalb des Benutzer-Dokuments abrufen
      const privateChats = userData['privateChat'];
      const chatData = privateChats[this.privateChatId];
      if (!chatData) {
        console.error(
          'PrivateChat mit dieser ID existiert nicht im Benutzerdokument.'
        );
        return;
      }

      // Nachrichten-Daten in `chatData` abrufen
      const currentMessage = chatData.messages
        ? chatData.messages[messageId]
        : null;
      if (!currentMessage) {
        console.error('Nachricht existiert nicht in diesem PrivateChat.');
        return;
      }

      // Benutzer-Details abrufen
      const user = await this.getUserData();
      if (!user) {
        console.error('Benutzerdaten sind unvollständig.');
        return;
      }

      // Die beiden User-IDs aus der privateChatId extrahieren
      const [firstUserId, secondUserId] = this.privateChatId.split('_');

      // Überprüfen, ob der aktuelle Benutzer der erste oder zweite Benutzer ist
      const isCurrentUserFirst = firstUserId === userId;
      const secondUserIdForSaving = isCurrentUserFirst
        ? secondUserId
        : firstUserId;

      // Reaktion für den aktuellen Benutzer überprüfen
      let reaction = currentMessage.reactions.find(
        (r: { emoji: { shortName: string }; userIds: string[] }) =>
          r.emoji.shortName === emoji.shortName
      );

      if (!reaction) {
        // Falls keine Reaktion existiert, erstellen wir eine neue Reaktion
        reaction = {
          emoji: emoji,
          count: 0, // Initialisieren des Counts auf 0
          userIds: [],
        };
        currentMessage.reactions.push(reaction);
      }

      // Überprüfen, ob der Benutzer bereits seine Reaktion abgegeben hat
      const userAlreadyReacted = reaction.userIds.includes(userId);

      if (!userAlreadyReacted) {
        // Benutzer hinzufügen und Count erhöhen
        reaction.userIds.push(userId);
        reaction.count++;
      }

      // Wenn der zweite Benutzer denselben Emoji verwendet, erhöhen wir den Count
      const secondUserAlreadyReacted = reaction.userIds.includes(
        secondUserIdForSaving
      );

      if (userAlreadyReacted && secondUserAlreadyReacted) {
        // Wenn beide Benutzer denselben Emoji haben, erhöhen wir den Count auf 2
        reaction.count = 2;
      }

      // Reaktionen für den aktuellen Benutzer und den zweiten Benutzer in beiden Benutzer-Dokumenten speichern
      const userDocRef1 = doc(this.firestore, `users/${userId}`);
      const userDocRef2 = doc(this.firestore, `users/${secondUserIdForSaving}`);

      // Dokumente aktualisieren
      await Promise.all([
        updateDoc(userDocRef1, {
          [`privateChat.${this.privateChatId}.messages.${messageId}.reactions`]:
            currentMessage.reactions,
        }),
        updateDoc(userDocRef2, {
          [`privateChat.${this.privateChatId}.messages.${messageId}.reactions`]:
            currentMessage.reactions,
        }),
      ]);
    } catch (error) {
      console.error(
        'Fehler beim Hinzufügen oder Aktualisieren der Reaktion:',
        error
      );
    }
  }

  // Neue Methode zum Abrufen der Benutzerdaten als Promise
  private async getUserData(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.userService.getUserDataByUID(this.userService.userId).subscribe({
        next: (user) => {
          if (user) {
            resolve(user);
          } else {
            reject('Benutzer nicht gefunden.');
          }
        },
        error: (err) => reject(err),
      });
    });
  }

  // Private Methode zum Abrufen des DocumentReference für private Chats
  private getPrivateChatDocRef(
    userId: string,
    privateChatId: string
  ): DocumentReference {
    return doc(
      this.firestore,
      `users/${userId}/privateChat/${privateChatId}`
    ).withConverter(privateChatConverter);
  }

  ngOnDestroy(): void {
    this.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  addReaction(
    messageId: string,
    emoji: { shortName: string; [key: string]: any }
  ): void {
    this
      .setActualMessage(messageId)
      .then(() => {
        this.addOrChangeReactionPrivateChat(
          messageId,
          emoji
        );
      })
      .catch((error) =>
        console.error('Fehler beim Setzen der Nachricht:', error)
      );
  }
}
