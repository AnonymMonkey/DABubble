import { Component, ElementRef, Input, ViewChild, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Channel } from '../../../../shared/models/channel.model';
import { ChannelService } from '../../../../shared/services/channel-service/channel.service';
import { ThreadService } from '../../../../shared/services/thread-service/thread.service';
import { ChannelMessage } from '../../../../shared/models/channel-message.model';
import { ThreadMessage } from '../../../../shared/models/thread-message.model';
import { OwnPrivateMessageTemplateComponent } from '../../../private-chat/chat-components/own-private-message-template/own-private-message-template.component';
import { OtherPrivateMessageTemplateComponent } from '../../../private-chat/chat-components/other-private-message-template/other-private-message-template.component';
import { CommonModule, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-thread-chat-history',
  standalone: true,
  imports: [OwnPrivateMessageTemplateComponent, OtherPrivateMessageTemplateComponent, NgIf, NgFor, CommonModule],
  templateUrl: './thread-chat-history.component.html',
  styleUrls: ['./thread-chat-history.component.scss']
})
export class ThreadChatHistoryComponent implements OnInit {
  @Input() currentUserId: any;
  currentChannel: Channel | undefined;
  currentMessage: ChannelMessage | null = null;

  // Observable für die Thread-Nachrichten
  threadMessages$: Observable<ThreadMessage[]> = this.threadService.threadMessages$;

  @ViewChild('messageContainer') messageContainer!: ElementRef;

  constructor(
    private channelService: ChannelService,
    private threadService: ThreadService,
  ) {}

  ngOnInit(): void {
    this.channelService.currentChannel$.subscribe((channel) => {
      if (channel) {
        this.currentChannel = channel;

        // Starte das Abonnieren der Thread-Nachrichten, falls eine aktuelle Nachricht vorhanden ist
        if (this.currentMessage) {
          this.threadService.getAndListenToThreadMessages(this.currentMessage.messageId, this.currentChannel.channelId);
        }
      }
    });

    this.threadService.actualMessage$.subscribe((message) => {
      if (message) {
        this.currentMessage = message;
        this.scrollToBottom();

        // Starte das Abonnieren der Thread-Nachrichten, wenn der aktuelle Kanal definiert ist
        if (this.currentChannel) {
          this.threadService.getAndListenToThreadMessages(this.currentMessage.messageId, this.currentChannel.channelId);
        }
      } else {
        this.currentMessage = null;
      }
    });
  }

  isCurrentUser(message: ThreadMessage): boolean {
    return message.user.userId === this.currentUserId; // Vergleiche die Benutzer-ID
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop =
          this.messageContainer.nativeElement.scrollHeight;
      }
    }, 0);
  }
}
