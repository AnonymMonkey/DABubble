import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChannelMessage } from '../../models/channel-message.model';
import { Firestore, doc, onSnapshot } from '@angular/fire/firestore';
import { ChannelService } from '../channel-service/channel.service';
import { ThreadMessage } from '../../models/thread-message.model';
import {
  collection,
  CollectionReference,
  getDocs,
  QuerySnapshot,
} from 'firebase/firestore';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ThreadService implements OnDestroy {
  public actualMessageSubject = new BehaviorSubject<ChannelMessage | null>(
    null
  );
  actualMessage$: Observable<ChannelMessage | null> =
    this.actualMessageSubject.asObservable();
  private threadMessagesSubject = new BehaviorSubject<ThreadMessage[]>([]);
  threadMessages$: Observable<ThreadMessage[]> =
    this.threadMessagesSubject.asObservable();
  private unsubscribeActualMessage: (() => void) | null = null;
  private unsubscribeThreadMessages: (() => void) | null = null;
  private destroy$ = new Subject<void>();
  actualMessageSubscription: Subscription | undefined;
  channelId: string = '';
  privateChatId: string = '';

  constructor(
    private firestore: Firestore,
    private channelService: ChannelService,
    private route: ActivatedRoute
  ) {
    this.route.params.subscribe(params => {
      this.channelId = params['channelId'];
      this.privateChatId = params['privateChatId'];
      if (this.channelId) {
        this.subscribeToActualMessage();
        this.subscribeToThreadMessages();
        console.log('channelId', this.channelId);
      } else if (this.privateChatId) {
        console.log('privateChatId', this.privateChatId);
        // this.subscribeToActualMessage();
        // this.subscribeToThreadMessages();
      }
    });
  }

  /**
   * Subscribe to actual message changes
   */
  subscribeToActualMessage(): void {
    this.actualMessageSubscription = this.actualMessage$.pipe(takeUntil(this.destroy$)).subscribe((message) => {
      if (
        this.unsubscribeActualMessage &&
        this.actualMessageSubject.value?.messageId === message?.messageId
      )
        return;
      this.unsubscribe();
      if (message) {
        const messageRef = doc(
          this.firestore,
          `channels/${this.channelService.channelId}/messages/${message.messageId}`
        );
        this.unsubscribeActualMessage = onSnapshot(messageRef, (snapshot) => {
          if (snapshot.exists()) {
            const updatedMessage = snapshot.data() as ChannelMessage;
            this.actualMessageSubject.next(updatedMessage);
            this.subscribeToThreadMessages();
          }
        });
      }
    });
  }

  /**
   * Subscribe to thread messages changes
   */
  subscribeToThreadMessages(): void {
    const messageId = this.getActualMessageId();
    if (!messageId) return;
    const threadMessagesRef = this.getThreadMessagesCollectionRef(messageId);
    this.unsubscribeThreadMessages = onSnapshot(
      threadMessagesRef,
      (snapshot) => {
        const updatedThreadMessages =
          this.mapSnapshotToThreadMessages(snapshot);
        this.threadMessagesSubject.next(updatedThreadMessages);
      }
    );
  }

  /**
   * Retrieves the ID of the currently active message.
   * @returns {string | undefined} The message ID or undefined if not available.
   */
  private getActualMessageId(): string | undefined {
    return this.actualMessageSubject.value?.messageId;
  }

  /**
   * Constructs a Firestore collection reference for thread messages.
   * @param {string} messageId - The ID of the parent message.
   * @returns {CollectionReference} The Firestore collection reference.
   */
  private getThreadMessagesCollectionRef(
    messageId: string
  ): CollectionReference {
    return collection(
      this.firestore,
      `channels/${this.channelService.channelId}/messages/${messageId}/thread`
    );
  }

  /**
   * Maps a Firestore snapshot to an array of thread messages.
   * @param {QuerySnapshot} snapshot - The Firestore snapshot.
   * @returns {ThreadMessage[]} The array of thread messages.
   */
  private mapSnapshotToThreadMessages(
    snapshot: QuerySnapshot
  ): ThreadMessage[] {
    return snapshot.docs.map((doc) => {
      const threadMessage = doc.data() as ThreadMessage;
      threadMessage.messageId = doc.id;
      return threadMessage;
    });
  }

  /**
   * Fetches thread messages from Firestore and updates the subject.
   */
  async fetchThreadMessages(): Promise<void> {
    const threadMessagesRef = this.getThreadMessagesRef();
    if (!threadMessagesRef) return;
    try {
      const messages = await this.getThreadMessages(threadMessagesRef);
      if (messages.length > 0) {
        this.threadMessagesSubject.next(messages);
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Thread-Nachrichten:', error);
    }
  }

  /**
   * Constructs the Firestore collection reference for thread messages.
   * @returns {CollectionReference | null} The Firestore reference or null.
   */
  private getThreadMessagesRef(): CollectionReference | null {
    const channelId = this.channelService.channelId;
    const messageId = this.actualMessageSubject.value?.messageId;
    if (!channelId || !messageId) return null;
    return collection(
      this.firestore,
      `channels/${channelId}/messages/${messageId}/thread`
    );
  }

  /**
   * Fetches and maps thread messages from Firestore.
   * @param {CollectionReference} ref - The Firestore collection reference.
   * @returns {Promise<ThreadMessage[]>} A promise resolving to an array of thread messages.
   */
  private async getThreadMessages(
    ref: CollectionReference
  ): Promise<ThreadMessage[]> {
    const snapshot = await getDocs(ref);
    return snapshot.docs.map((doc) => doc.data() as ThreadMessage);
  }

  /**
   * A function that returns the new messages that have been added since the last subscription
   * @param currentMessages - The current messages in the thread
   * @param updatedMessages - The updated messages in the thread
   * @returns A list of new messages
   */
  getNewMessages(
    currentMessages: ThreadMessage[],
    updatedMessages: ThreadMessage[]
  ): ThreadMessage[] {
    const currentMessageIds = currentMessages.map((msg) =>
      msg.messageId.toString()
    );
    return updatedMessages.filter(
      (msg) => !currentMessageIds.includes(msg.messageId.toString())
    );
  }

  /**
   * Sets the actual message in the thread.
   * @param message - The message to set as the actual message
   */
  setActualMessage(message: ChannelMessage): void {
    const currentMessage = this.actualMessageSubject.value;
    if (!currentMessage || !this.deepEqual(currentMessage, message)) {
      this.actualMessageSubject.next(message);
      if (this.channelId) this.subscribeToThreadMessages();
      if (this.privateChatId) return
    }
  }

  /**
   * Checks if two objects are equal
   * @param obj1 - The first object
   * @param obj2 - The second object
   * @returns True if the objects are equal, false otherwise
   */
  deepEqual(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  /**
   * Unsubscribes from the actual message and thread messages
   */
  unsubscribe(): void {
    if (this.unsubscribeActualMessage) {
      this.unsubscribeActualMessage();
      this.unsubscribeActualMessage = null;
    }
    if (this.unsubscribeThreadMessages) {
      this.unsubscribeThreadMessages();
      this.unsubscribeThreadMessages = null;
    }
  }

  /**
   * Unsubscribes from the actual message and thread messages
   */
  ngOnDestroy(): void {
    if (this.unsubscribeThreadMessages) {
      this.unsubscribeThreadMessages();
      this.unsubscribeThreadMessages = null;
    }
    if (this.unsubscribeActualMessage) {
      this.unsubscribeActualMessage();
      this.unsubscribeActualMessage = null;
    }
    if (this.actualMessageSubscription) this.actualMessageSubscription.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
