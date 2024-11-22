import { Component, inject, Input, OnInit } from '@angular/core';
import { ChannelService } from '../../../../../shared/services/channel-service/channel.service';
import { NgIf, DatePipe, NgFor, AsyncPipe, NgClass } from '@angular/common';
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
import { Observable } from 'rxjs';

@Component({
  selector: 'app-own-message-show',
  standalone: true,
  imports: [
    NgIf,
    DatePipe,
    MessageReactionsComponent,
    NgFor,
    AttachmentPreviewComponent,
    AsyncPipe,
    NgClass,
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
  public threadMessages$: Observable<any[]> | undefined; // Observable für die Thread-Nachrichten

  constructor() {}

  ngOnInit(): void {
    if (this.channelService.channelId && this.message?.messageId) {
      this.loadThreadMessages(
        this.channelService.channelId,
        this.message.messageId
      );
    }
    if (this.message) {
      this.userService
        .getUserDataByUID(this.message.userId)
        .subscribe((data) => {
          this.displayName = data.displayName;
        });
    }
  }

  // Methode zum Abrufen der Thread-Nachrichten aus der Firestore-Unterkollektion
  loadThreadMessages(channelId: string, messageId: string): void {
    const threadRef = collection(
      this.firestore,
      `channels/${channelId}/messages/${messageId}/thread`
    );
    this.threadMessages$ = collectionData(threadRef, { idField: 'id' });
  }

  getLastReplyTime(thread: { [key: string]: any }): string {
    const messages = Object.values(thread);
    const lastMessage = messages[messages.length - 1];

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
