import { Injectable, OnDestroy } from '@angular/core';
import { Firestore, doc, docData, setDoc } from '@angular/fire/firestore';
import {
  FirestoreDataConverter,
  DocumentReference,
} from '@angular/fire/firestore';
import { DocumentSnapshot, DocumentData } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { combineLatest, from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { PrivateChat } from '../../models/private-chat.model';
import { arrayUnion, getDoc, updateDoc } from 'firebase/firestore';
import { UserData } from '../../models/user.model';
import { UserService } from '../user-service/user.service';
import { ThreadMessage } from '../../models/thread-message.model';

/**
 * Converter to convert PrivateChat objects to Firestore data and back.
 */
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
  private actualMessageSubject = new BehaviorSubject<ThreadMessage | null>(
    null
  );
  actualMessage$: Observable<ThreadMessage | null> =
    this.actualMessageSubject.asObservable();
  private unsubscribeActualMessage: (() => void) | null = null;
  private destroy$ = new Subject<void>();
  public privateChatId: string | null = null;

  constructor(private firestore: Firestore, private userService: UserService) {}

  /**
   * Sets the private chat ID.
   * @param privateChatId The ID of the private chat.
   */
  setPrivateChatId(privateChatId: string): void {
    this.privateChatId = privateChatId;
  }

  /**
   * Sets the actual message in the private chat.
   * @param messageId The ID of the message to set as the actual message.
   */
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
          }
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der Nachricht:', error);
      }
    }
  }

  /**
   * Adds a message to the private chat.
   * @param currentUserId The ID of the current user.
   * @param privateChatId The ID of the private chat.
   * @param message The message to add.
   */
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
    );
  }

  /**
   * Returns an Observable that emits the private chat data for the given user and private chat ID.
   * @param currentUserId The ID of the current user.
   * @param privateChatId The ID of the private chat.
   * @returns An Observable that emits the private chat data.
   */
  getPrivateChat(
    currentUserId: string,
    privateChatId: string
  ): Observable<PrivateChat | undefined> {
    const privateChatDocRef = doc(
      this.firestore,
      `users/${currentUserId}/privateChat/${privateChatId}`
    ).withConverter(privateChatConverter);
    return docData<PrivateChat>(privateChatDocRef).pipe(
      catchError((error) => {
        console.error('Fehler beim Abrufen des privaten Chats:', error);
        return of(undefined);
      })
    );
  }

  /**
   * Returns an Observable that emits an array of private chat data for the given user.
   * @param userRef The reference to the user document.
   * @returns An Observable that emits an array of private chat data.
   */
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
        return of([]); 
      })
    );
  }

  /**
   * Finds an existing chat in the privateChat array based on the chatId.
   * @param privateChat The array of private chat data.
   * @param chatId The ID of the chat to find.
   * @returns The ID of the existing chat, or null if not found.
   */
  findExistingChat(privateChat: any[], chatId: string): string | null {
    if (!Array.isArray(privateChat)) {
      console.error('privateChat ist kein Array:', privateChat);
      return null;
    }
    return privateChat.find((chat) => chat.chatId === chatId) ? chatId : null;
  }

  /**
   * Creates a new chat entry for the given users and chat ID.
   * @param currentUser The current user.
   * @param targetUser The target user.
   * @param chatId The ID of the chat.
   * @returns The new chat entry.
   */
  createNewChatEntry(
    currentUser: UserData,
    targetUser: UserData,
    chatId: string
  ) {
    return {
      [chatId]: {
        chatId,
        user: [{ userId: currentUser.uid }, { userId: targetUser.uid }],
        messages: [],
      },
    };
  }

  updateUsersChats(
    currentUserRef: DocumentReference,
    targetUserRef: DocumentReference,
    newChat: any
  ): Observable<string> {
    const chatId = Object.keys(newChat)[0];
    const chatData = newChat[chatId];
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
        return of(''); 
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
          return of(chatId);
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

  /**
   * Unsubscribes from the actual message listener.
   */
  unsubscribe(): void {
    if (this.unsubscribeActualMessage) {
      this.unsubscribeActualMessage();
      this.unsubscribeActualMessage = null;
    }
  }

  /**
   * Generates a chat ID based on two user IDs.
   * @param uid1 The first user ID.
   * @param uid2 The second user ID.
   * @returns The generated chat ID.
   */
  generateChatId(uid1: string, uid2: string): string {
    return [uid1, uid2].sort().join('_');
  }

  /**
   * Adds or changes a reaction to a message in a private chat.
   * @param {string} messageId - The ID of the message to react to.
   * @param {object} emoji - The emoji used as a reaction.
   * @returns {Promise<void>} A promise that resolves when the reaction is added or changed.
   */
  async addOrChangeReactionPrivateChat(
    messageId: string,
    emoji: { shortName: string; [key: string]: any }
  ): Promise<void> {
    if (!this.privateChatId || !messageId) return;
    const userId = this.userService.userId;
    try {
      const userData = await this.getUserDataForPrivateChat(userId);
      if (!userData) return;
      const currentMessage = this.getMessageData(userData, messageId);
      if (!currentMessage) return;
      const reaction = this.addOrUpdateReaction(currentMessage, emoji, userId);
      if (!reaction) return;
      await this.saveReactionsToFirestore(currentMessage, messageId, userId);
    } catch (error) {
      console.error('Error adding or updating reaction:', error);
    }
  }

  /**
   * Retrieves the user data for the current user in the private chat.
   * @param {string} userId - The ID of the current user.
   * @returns {Promise<any>} A promise that resolves with the user data or null if not found.
   */
  private async getUserDataForPrivateChat(userId: string): Promise<any | null> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();
    if (!userData) return null;
    return userData;
  }

  /**
   * Retrieves the message data from the private chat.
   * @param {any} userData - The user data.
   * @param {string} messageId - The ID of the message.
   * @returns {any | null} The message data or null if not found.
   */
  private getMessageData(userData: any, messageId: string): any | null {
    const privateChats = userData['privateChat'];
    const chatData = privateChats[this.privateChatId!];
    if (!chatData) return null;
    return chatData.messages ? chatData.messages[messageId] : null;
  }

  /**
   * Adds or updates the reaction to the current message.
   * @param {any} currentMessage - The current message.
   * @param {object} emoji - The emoji used as a reaction.
   * @param {string} userId - The ID of the current user.
   * @returns {any | null} The updated reaction or null if no change was made.
   */
  private addOrUpdateReaction(
    currentMessage: any,
    emoji: { shortName: string; [key: string]: any },
    userId: string
  ): any | null {
    let reaction = this.findExistingReaction(currentMessage, emoji);
    if (!reaction) {
      reaction = this.createNewReaction(emoji);
      currentMessage.reactions.push(reaction);
    }
    this.updateUserReaction(reaction, userId);
    this.adjustReactionCountIfBothUsersReacted(reaction, userId);
    return reaction;
  }

  /**
   * Finds an existing reaction for the specified emoji.
   * @param {any} currentMessage - The current message.
   * @param {object} emoji - The emoji used as a reaction.
   * @returns {any | null} The found reaction or null if no reaction exists.
   */
  private findExistingReaction(
    currentMessage: any,
    emoji: { shortName: string; [key: string]: any }
  ): any | null {
    for (const reaction of currentMessage.reactions) {
      if (reaction.emoji.shortName === emoji.shortName) {
        return reaction;
      }
    }
    return null;
  }

  /**
   * Creates a new reaction for the specified emoji.
   * @param {object} emoji - The emoji used as a reaction.
   * @returns {any} The newly created reaction object.
   */
  private createNewReaction(emoji: {
    shortName: string;
    [key: string]: any;
  }): any {
    const newReaction = {
      emoji: emoji,
      count: 0,
      userIds: [],
    };
    return newReaction;
  }

  /**
   * Updates the reaction with the current user's reaction.
   * @param {any} reaction - The reaction to be updated.
   * @param {string} userId - The ID of the current user.
   */
  private updateUserReaction(reaction: any, userId: string): void {
    if (!reaction.userIds.includes(userId)) {
      reaction.userIds.push(userId);
      reaction.count++;
    }
  }

  /**
   * Adjusts the reaction count if both users in the private chat have reacted.
   * @param {any} reaction - The reaction to be updated.
   * @param {string} userId - The ID of the current user.
   */
  private adjustReactionCountIfBothUsersReacted(
    reaction: any,
    userId: string
  ): void {
    const secondUserIdForSaving = this.getSecondUserId(userId);
    const secondUserAlreadyReacted = reaction.userIds.includes(
      secondUserIdForSaving
    );
    if (reaction.userIds.includes(userId) && secondUserAlreadyReacted && secondUserIdForSaving !== userId) {
      reaction.count = 2;
    }
  }

  /**
   * Retrieves the second user ID in the private chat to update the reactions.
   * @param {string} userId - The ID of the current user.
   * @returns {string} The second user ID.
   */
  private getSecondUserId(userId: string): string {
    const [firstUserId, secondUserId] = this.privateChatId!.split('_');
    const secondUserIdForSaving =
      firstUserId === userId ? secondUserId : firstUserId;
    return secondUserIdForSaving;
  }

  /**
   * Retrieves the second user ID in the private chat to update the reactions.
   * @param {string} userId - The ID of the current user.
   * @returns {string} The second user ID.
   */
  private getSecondUserIdForSaving(userId: string): string {
    const [firstUserId, secondUserId] = this.privateChatId!.split('_');
    return firstUserId === userId ? secondUserId : firstUserId;
  }

  /**
   * Saves the updated reactions to Firestore for both users in the private chat.
   * @param {any} currentMessage - The current message with updated reactions.
   * @param {string} messageId - The ID of the message.
   * @param {string} userId - The ID of the current user.
   * @returns {Promise<void>} A promise that resolves when the reactions are saved.
   */
  private async saveReactionsToFirestore(
    currentMessage: any,
    messageId: string,
    userId: string
  ): Promise<void> {
    const secondUserIdForSaving = this.getSecondUserIdForSaving(userId);
    const userDocRef1 = doc(this.firestore, `users/${userId}`);
    const userDocRef2 = doc(this.firestore, `users/${secondUserIdForSaving}`);
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
  }

  /**
   * A function to get the private chat document reference.
   * @param userId The ID of the user.
   * @param privateChatId The ID of the private chat.
   * @returns The private chat document reference.
   */
  private getPrivateChatDocRef(
    userId: string,
    privateChatId: string
  ): DocumentReference {
    return doc(
      this.firestore,
      `users/${userId}/privateChat/${privateChatId}`
    ).withConverter(privateChatConverter);
  }

  /**
   * A function to unsubscribe from the private chat document reference.
   * @returns void
   */
  ngOnDestroy(): void {
    this.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * A function to add a reaction to a message in a private chat.
   * @param messageId The ID of the message.
   * @param emoji The emoji object.
   */
  addReaction(
    messageId: string,
    emoji: { shortName: string; [key: string]: any }
  ): void {
    this.setActualMessage(messageId)
      .then(() => {
        this.addOrChangeReactionPrivateChat(messageId, emoji);
      })
      .catch((error) =>
        console.error('Fehler beim Setzen der Nachricht:', error)
      );
  }
}
