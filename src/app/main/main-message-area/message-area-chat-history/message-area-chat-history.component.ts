import { CommonModule, NgClass, NgFor } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { doc, onSnapshot } from 'firebase/firestore';
import { MainComponent } from '../../main.component';

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
  isEmojiContainerVisible: number = 0;
  currentChannel$?: Observable<Channel | undefined>;
  currentUserId: any;
  groupedMessages: any[] = []; // Array to store messages grouped by date
  currentChannel: Channel | undefined;

  @ViewChild('messageContainer') messageContainer!: ElementRef;

  constructor(
    private firestore: Firestore,
    private channelService: ChannelService,
    private route: ActivatedRoute
    private main: MainComponent,
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.main.userId;

    // Listen for channel changes in Firestore in real-time
    this.currentChannel$ = this.channelService.currentChannel$;

    this.currentChannel$.subscribe((channel) => {
      if (channel) {
        this.listenForMessages(channel.channelId);
      }
    });
  }

  getUserIdFromUrl(): void {
    this.route.paramMap.subscribe((params) => {
      this.currentUserId = params.get('uid'); // UID aus den URL-Parametern abrufen
    });
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop =
          this.messageContainer.nativeElement.scrollHeight;
      }
    }, 0);
  }

  listenForMessages(channelId: string): void {
    const channelDocRef = doc(this.firestore, `channels/${channelId}`);

    // Set up Firestore listener
    onSnapshot(channelDocRef, (docSnapshot) => {
      const channelData: any = docSnapshot.data();
      if (channelData && channelData.messages) {
        this.groupMessagesByDate(channelData.messages);
        this.scrollToBottom();
      }
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
      acc[dateString].push(message);
      return acc;
    }, {});

    this.groupedMessages = Object.keys(grouped).map((date) => ({
      date,
      messages: grouped[date],
    }));

    // console.log(this.groupedMessages, this.currentUserId);

    this.scrollToBottom();
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
      }
    }, 0);
  }
}
