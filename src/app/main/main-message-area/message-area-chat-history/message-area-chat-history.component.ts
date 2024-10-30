import { CommonModule, NgClass, NgFor } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
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
export class MessageAreaChatHistoryComponent implements OnInit {
  @Input() currentUserId: any; // Setze den Typ auf string für mehr Klarheit
  isEmojiContainerVisible: number = 0;
  currentChannel$?: Observable<Channel | undefined>;
  groupedMessages: any[] = []; // Array to store messages grouped by date
  currentChannel: Channel | undefined;

  @ViewChild('messageContainer') messageContainer!: ElementRef;

  constructor(
    private firestore: Firestore,
    private channelService: ChannelService,
  ) {}

  ngOnInit(): void {
    // Listen for channel changes in Firestore in real-time
    this.currentChannel$ = this.channelService.currentChannel$;

    this.currentChannel$.subscribe((channel) => {
      if (channel) {
        this.listenForMessages(channel.channelId);
      }
    });
  }

  listenForMessages(channelId: string): void {
    const messagesCollectionRef = collection(this.firestore, `channels/${channelId}/messages`);
  
    // Set up Firestore listener for messages
    collectionData(messagesCollectionRef).subscribe((messages) => {
      // Sortiere die Nachrichten nach Zeit, bevor du sie gruppierst
      messages.sort((a: any, b: any) => {
        return new Date(a['time']).getTime() - new Date(b['time']).getTime();
      });
  
      this.groupMessagesByDate(messages);
      this.scrollToBottom();
    });
  }

  // Group messages by date
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
        dateString = 'Heute'; // If it's the current day
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
  
    // Optional: Sorte die groupedMessages nach Datum, falls gewünscht
    this.groupedMessages.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime(); // neueste zuerst
    });
  
    this.scrollToBottom();
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
