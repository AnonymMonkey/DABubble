import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChannelMessage } from '../../models/channel-message.model';
import { Firestore, doc, onSnapshot } from '@angular/fire/firestore';
import { ChannelService } from '../channel-service/channel.service';
import { updateDoc } from 'firebase/firestore';
import { UserService } from '../user-service/user.service';
import { UserData } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class ThreadService implements OnDestroy {
  public actualMessageSubject = new BehaviorSubject<ChannelMessage | null>(null);
  actualMessage$: Observable<ChannelMessage | null> = this.actualMessageSubject.asObservable();

  private unsubscribeActualMessage: (() => void) | null = null;
  private destroy$ = new Subject<void>(); // Subject zum Steuern der Zerstörung

  constructor(private firestore: Firestore, private channelService: ChannelService, private userService: UserService) {
    this.subscribeToActualMessage();
  }

  subscribeToActualMessage(): void {
    this.unsubscribe();

    this.actualMessage$.pipe(takeUntil(this.destroy$)).subscribe((message) => {
      if (message) {
        const messageRef = doc(this.firestore, `channels/${this.channelService.channelId}/messages/${message.messageId}`);

        // Setze einen Listener für das aktuelle Nachrichten-Dokument
        this.unsubscribeActualMessage = onSnapshot(messageRef, (snapshot) => {
          if (snapshot.exists()) {
            const updatedMessage = snapshot.data() as ChannelMessage; // Konvertiere Snapshot zu ChannelMessage
            this.actualMessageSubject.next(updatedMessage);
          }
        }, (error) => {
          console.error('Fehler beim Abrufen der Nachricht:', error);
        });
      }
    });
  }

  setActualMessage(message: ChannelMessage): void {
    if (!message || message.messageId === this.actualMessageSubject.value?.messageId) {
      return; // Ignoriere, wenn die Nachricht identisch ist
    }
    this.actualMessageSubject.next(message);
  }
  

  unsubscribe(): void {
    if (this.unsubscribeActualMessage) {
      this.unsubscribeActualMessage();
      this.unsubscribeActualMessage = null;
      console.log('Aktueller Nachrichten-Listener erfolgreich entfernt.');
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe();
    this.destroy$.next(); // Signalisiert die Zerstörung
    this.destroy$.complete(); // Schließt das Subject
  }
}
