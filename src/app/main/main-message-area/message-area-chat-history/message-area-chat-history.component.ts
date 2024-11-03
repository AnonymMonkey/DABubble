import { CommonModule, NgClass, NgFor } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ThreadComponent } from '../thread/thread.component';
import { MainMessageAreaComponent } from '../main-message-area.component';
import { OtherMessageTemplateComponent } from '../chat-components/other-message-template/other-message-template.component';
import { OwnMessageTemplateComponent } from '../chat-components/own-message-template/own-message-template.component';
import { DateOfMessageComponent } from '../chat-components/date-of-message/date-of-message.component';
import { ChannelService } from '../../../shared/services/channel-service/channel.service';
import { Channel } from '../../../shared/models/channel.model';
import { Observable } from 'rxjs';
import { Firestore } from '@angular/fire/firestore';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { collectionData } from 'rxfire/firestore';

@Component({
  selector: 'app-message-area-chat-history',
  standalone: true,
  imports: [
    MatIcon,
    DateOfMessageComponent,
    NgClass,
    NgFor,
    MatSidenavModule,
    CommonModule,
    ThreadComponent,
    MainMessageAreaComponent,
    OtherMessageTemplateComponent,
    OwnMessageTemplateComponent,
  ],
  templateUrl: './message-area-chat-history.component.html',
  styleUrls: ['./message-area-chat-history.component.scss'],
})
export class MessageAreaChatHistoryComponent implements OnInit, AfterViewChecked {
  @Input() currentUserId: string | undefined;
  currentChannel$?: Observable<Channel | undefined>;
  groupedMessages: any[] = [];
  private shouldScroll: boolean = false;

  @ViewChild('messageContainer') messageContainer!: ElementRef;

  constructor(
    private firestore: Firestore,
    private channelService: ChannelService,
  ) {}

  ngOnInit(): void {
    this.currentChannel$ = this.channelService.currentChannel$;
    this.currentChannel$.subscribe((channel) => {
      if (channel) {
        this.listenForMessages(channel.channelId);
      }
    });
  }

  listenForMessages(channelId: string): void {
    const messagesCollectionRef = collection(this.firestore, `channels/${channelId}/messages`);

    collectionData(messagesCollectionRef).subscribe((messages) => {
      messages.sort((a: any, b: any) => new Date(a['time']).getTime() - new Date(b['time']).getTime());
      this.groupMessagesByDate(messages);
      this.shouldScroll = true; // Set flag to scroll after messages load
    });
  }

  groupMessagesByDate(messages: any[]): void {
    const grouped = messages.reduce((acc, message) => {
      const messageDate = new Date(message.time);
      const today = new Date();

      let dateString: string;
      if (
        messageDate.getFullYear() === today.getFullYear() &&
        messageDate.getMonth() === today.getMonth() &&
        messageDate.getDate() === today.getDate()
      ) {
        dateString = 'Heute';
      } else {
        dateString = messageDate.toLocaleDateString();
      }

      if (!acc[dateString]) {
        acc[dateString] = [];
      }

      acc[dateString].push({
        ...message,
        messageId: message.messageId,
      });

      return acc;
    }, {});

    this.groupedMessages = Object.keys(grouped).map((date) => ({
      date,
      messages: grouped[date],
    }));

    this.groupedMessages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false; // Reset the flag after scrolling
    }
  }

  scrollToBottom(): void {
    if (this.messageContainer && this.messageContainer.nativeElement.scrollHeight) {
      setTimeout(() => {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
      }, 100); // Adding a small delay to allow message rendering
    }
  }
}
