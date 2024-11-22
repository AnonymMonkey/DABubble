import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChannelMessage } from '../../models/channel-message.model';
import { Firestore, doc, onSnapshot } from '@angular/fire/firestore';
import { ChannelService } from '../channel-service/channel.service';
import { UserService } from '../user-service/user.service';
import { ThreadMessage } from '../../models/thread-message.model';
import { collection, getDocs } from 'firebase/firestore';

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
  private destroy$ = new Subject<void>(); // Subject zum Steuern der Zerstörung

  constructor(
    private firestore: Firestore,
    private channelService: ChannelService,
    private userService: UserService
  ) {
    this.subscribeToActualMessage();
    this.subscribeToThreadMessages();
  }

  // Abo für Änderungen an den Thread-Nachrichten
  // Abo für Änderungen an den Thread-Nachrichten
  subscribeToActualMessage(): void {
    this.actualMessage$.pipe(takeUntil(this.destroy$)).subscribe((message) => {
      // Verhindere doppelte Listener
      if (
        this.unsubscribeActualMessage &&
        this.actualMessageSubject.value?.messageId === message?.messageId
      ) {
        return;
      }

      // Entferne den alten Listener
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
            // Hier kannst du sicherstellen, dass die Thread-Nachrichten auch abonniert werden.
            this.subscribeToThreadMessages(); // Neueste Thread-Nachrichten abonnieren
          }
        });
      }
    });
  }

  subscribeToThreadMessages(): void {
    const messageId = this.actualMessageSubject.value?.messageId; // Wenn nötig, dynamisch anpassen

    if (!messageId) return;

    const threadMessagesRef = collection(
      this.firestore,
      `channels/${this.channelService.channelId}/messages/${messageId}/thread`
    );

    // Hören auf Änderungen der Thread-Nachrichten
    this.unsubscribeThreadMessages = onSnapshot(
      threadMessagesRef,
      (snapshot) => {
        const updatedThreadMessages: ThreadMessage[] = [];
        snapshot.forEach((doc) => {
          const threadMessage = doc.data() as ThreadMessage;
          threadMessage.messageId = doc.id; // Setze threadId basierend auf dem Dokument-Id
          updatedThreadMessages.push(threadMessage);
        });

        // Aktualisiere die Thread-Nachrichten, wenn es neue gibt
        this.threadMessagesSubject.next(updatedThreadMessages);
      }
    );
  }

  async fetchThreadMessages(): Promise<void> {
    if (
      !this.channelService.channelId ||
      !this.actualMessageSubject.value?.messageId
    ) {
      return;
    }
  
    const threadMessagesRef = collection(
      this.firestore,
      `channels/${this.channelService.channelId}/messages/${this.actualMessageSubject.value.messageId}/thread`
    );
  
    try {
      const snapshot = await getDocs(threadMessagesRef);  
      if (snapshot.empty) {
        console.log('Keine Thread-Nachrichten gefunden.');
      } else {
        const messages: ThreadMessage[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          messages.push(data as ThreadMessage);
          console.log(doc.id, ' => ', data);
        });
  
        // Hier kannst du die Nachrichten in eine Variable zuweisen, z.B. über ein Subject oder eine Service-Methode
        this.threadMessagesSubject.next(messages);
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Thread-Nachrichten:', error);
    }
  }

  // Hilfsmethode, um nur neue Nachrichten hinzuzufügen
  getNewMessages(
    currentMessages: ThreadMessage[],
    updatedMessages: ThreadMessage[]
  ): ThreadMessage[] {
    const currentMessageIds = currentMessages.map((msg) =>
      msg.messageId.toString()
    ); // ID als String
    return updatedMessages.filter(
      (msg) => !currentMessageIds.includes(msg.messageId.toString()) // gleiche Konvertierung hier
    );
  }

  setActualMessage(message: ChannelMessage): void {
    const currentMessage = this.actualMessageSubject.value;

    if (!currentMessage || !this.deepEqual(currentMessage, message)) {
      this.actualMessageSubject.next(message);
      this.subscribeToThreadMessages();
    }
  }

  deepEqual(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

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

  ngOnDestroy(): void {
    if (this.unsubscribeThreadMessages) {
      this.unsubscribeThreadMessages();
      this.unsubscribeThreadMessages = null;
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}
