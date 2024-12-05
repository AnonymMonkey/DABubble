import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
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

@Injectable({
  providedIn: 'root',
})
export class ThreadService implements OnDestroy {
  // Observable für die aktuelle Nachricht
  public actualMessageSubject = new BehaviorSubject<ChannelMessage | null>(
    null
  );
  actualMessage$: Observable<ChannelMessage | null> =
    this.actualMessageSubject.asObservable();

  // Observable für Thread-Nachrichten
  private threadMessagesSubject = new BehaviorSubject<ThreadMessage[]>([]);
  threadMessages$: Observable<ThreadMessage[]> =
    this.threadMessagesSubject.asObservable();

  private unsubscribeActualMessage: (() => void) | null = null;
  private unsubscribeThreadMessages: (() => void) | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private firestore: Firestore,
    private channelService: ChannelService
  ) {
    this.subscribeToActualMessage();
    this.subscribeToThreadMessages();
  }

  /**
   * Subscribe to actual message changes
   */
  subscribeToActualMessage(): void {
    this.actualMessage$.pipe(takeUntil(this.destroy$)).subscribe((message) => {
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
    const messageId = this.getActualMessageId(); // Get the current message ID
    if (!messageId) return; // Exit if no message ID
    const threadMessagesRef = this.getThreadMessagesCollectionRef(messageId); // Get Firestore collection reference
    this.unsubscribeThreadMessages = onSnapshot(
      threadMessagesRef,
      (snapshot) => {
        const updatedThreadMessages =
          this.mapSnapshotToThreadMessages(snapshot); // Map snapshot data
        this.threadMessagesSubject.next(updatedThreadMessages); // Update the subject
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
      threadMessage.messageId = doc.id; // Assign document ID to the message
      return threadMessage;
    });
  }

  /**
   * Fetches thread messages from Firestore and updates the subject.
   */
  async fetchThreadMessages(): Promise<void> {
    const threadMessagesRef = this.getThreadMessagesRef(); // Get Firestore reference
    if (!threadMessagesRef) return; // Exit if no reference
    try {
      const messages = await this.getThreadMessages(threadMessagesRef); // Fetch messages
      if (messages.length > 0) {
        this.threadMessagesSubject.next(messages); // Update the subject
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Thread-Nachrichten:', error); // Log errors
    }
  }

  /**
   * Constructs the Firestore collection reference for thread messages.
   * @returns {CollectionReference | null} The Firestore reference or null.
   */
  private getThreadMessagesRef(): CollectionReference | null {
    const channelId = this.channelService.channelId;
    const messageId = this.actualMessageSubject.value?.messageId;
    if (!channelId || !messageId) return null; // Return null if invalid
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
    const snapshot = await getDocs(ref); // Fetch the documents
    return snapshot.docs.map((doc) => doc.data() as ThreadMessage); // Map to ThreadMessage[]
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
      this.subscribeToThreadMessages();
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
    this.destroy$.next();
    this.destroy$.complete();
  }
}
