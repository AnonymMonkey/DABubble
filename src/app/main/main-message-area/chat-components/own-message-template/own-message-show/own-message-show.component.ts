import {
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ChannelService } from '../../../../../shared/services/channel-service/channel.service';
import { NgIf, DatePipe, NgFor } from '@angular/common';
import { ThreadService } from '../../../../../shared/services/thread-service/thread.service';
import { MainMessageAreaComponent } from '../../../main-message-area.component';
import { MessageReactionsComponent } from '../../../../../shared/components/message-reactions/message-reactions.component';
import { AttachmentPreviewComponent } from '../../../../../shared/components/attachment-preview/attachment-preview.component';
import { UserService } from '../../../../../shared/services/user-service/user.service';
import {
  Firestore,
  doc,
  collection,
  collectionData,
} from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';
import { onSnapshot } from 'firebase/firestore';

@Component({
  selector: 'app-own-message-show',
  standalone: true,
  imports: [
    NgIf,
    DatePipe,
    MessageReactionsComponent,
    NgFor,
    AttachmentPreviewComponent,
  ],
  templateUrl: './own-message-show.component.html',
  styleUrls: ['./own-message-show.component.scss'],
})
export class OwnMessageShowComponent implements OnInit {
  @Input() message: any;
  public channelService = inject(ChannelService);
  public userService = inject(UserService);
  public threadService = inject(ThreadService);
  public mainMessageArea = inject(MainMessageAreaComponent);
  private firestore = inject(Firestore);
  displayName: string = '';
  public threadMessages$: Observable<any[]> | undefined;
  private userDataSubscription: Subscription | undefined;
  public threadMessages: any[] = [];
  private threadMessagesSubscription: Subscription | undefined;
  public threadInfo: Map<string, { count: number; lastReplyDate: string }> =
    new Map();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.message) {
      this.loadUserData(this.message.userId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['message'] &&
      changes['message'].currentValue?.messageId !==
        changes['message'].previousValue?.messageId
    ) {
      this.loadThreadMessages(
        this.channelService.channelId,
        this.message.messageId
      );
    }
  }

  loadUserData(userId: string): void {
    this.userDataSubscription = this.userService.userDataMap$.subscribe(
      (userDataMap) => {
        const userData = userDataMap.get(userId);
        if (userData) {
          this.displayName = userData.displayName;
        } else {
          this.displayName = 'Gast';
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.userDataSubscription) {
      this.userDataSubscription.unsubscribe(); // Verhindert Speicherlecks
    }
    if (this.threadMessagesSubscription) {
      this.threadMessagesSubscription.unsubscribe();
    }
  }

  // Methode zum Abrufen der Thread-Nachrichten aus der Firestore-Unterkollektion
  loadThreadMessages(channelId: string, messageId: string): void {
    if (this.threadMessagesSubscription) {
      this.threadMessagesSubscription.unsubscribe();
    }

    const threadRef = collection(
      this.firestore,
      `channels/${channelId}/messages/${messageId}/thread`
    );

    onSnapshot(threadRef, (snapshot) => {
      const messages = snapshot.docs.map((doc) => doc.data());

      if (messages.length !== this.threadMessages.length) {
        this.threadMessages = messages;
        const lastReplyDate = this.getLastReplyTime();
        this.threadInfo.set(messageId, {
          count: messages.length,
          lastReplyDate: lastReplyDate,
        });
      }
    });
  }

  getLastReplyTime(): string {
    if (this.threadMessages.length === 0) {
      return 'Keine Antworten';
    }

    const lastMessage = this.threadMessages[this.threadMessages.length - 1];

    if (lastMessage && lastMessage.time) {
      const date = new Date(lastMessage.time);
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // 24-Stunden-Format
      };
      return date.toLocaleTimeString([], options) + ' Uhr';
    }

    return 'Keine Antworten';
  }
}
