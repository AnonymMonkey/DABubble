import { Component, ElementRef, ViewChild } from '@angular/core';
import { DateOfMessageComponent } from '../../main-message-area/chat-components/date-of-message/date-of-message.component';
import { OtherMessageTemplateComponent } from '../../main-message-area/chat-components/other-message-template/other-message-template.component';
import { OwnMessageTemplateComponent } from '../../main-message-area/chat-components/own-message-template/own-message-template.component';
import { NgFor, NgIf } from '@angular/common';
import { Firestore } from '@angular/fire/firestore';
import { MainComponent } from '../../main.component';
import { doc, onSnapshot } from 'firebase/firestore';
import { ChannelMessage } from '../../../shared/models/channel-message.model';
import { ActivatedRoute } from '@angular/router';
import { PrivateChat } from '../../../shared/models/private-chat.model';
import { Observable } from 'rxjs';
import { PrivateChatService } from '../../../shared/services/private-chat-service/private-chat.service';

@Component({
  selector: 'app-private-chat-history',
  standalone: true,
  imports: [DateOfMessageComponent, OtherMessageTemplateComponent, OwnMessageTemplateComponent, NgIf, NgFor],
  templateUrl: './private-chat-history.component.html',
  styleUrls: ['./private-chat-history.component.scss']
})
export class PrivateChatHistoryComponent {
  isEmojiContainerVisible: number = 0;
  currentPrivateChat$?: Observable<PrivateChat | undefined>;
  currentUserId: any;
  privateChatId: string | undefined;
  groupedMessages: any[] = []; // Array to store messages grouped by date
  currentPrivateChat: PrivateChat | undefined;

  @ViewChild('messageContainer') messageContainer!: ElementRef;

  constructor(
    private firestore: Firestore,
    private main: MainComponent,
    private privateChatService: PrivateChatService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.main.userId;

    this.currentPrivateChat$ = this.privateChatService.currentPrivateChat$;
    this.route.params.subscribe(params => {
      this.privateChatId = params['privateChatId'];
      if (this.privateChatId) {
        this.listenForMessages(this.privateChatId);
      }
    });
  }

  listenForMessages(privateChatId: string): void {
    const chatDocRef = doc(this.firestore, `users/${this.currentUserId}/privateChat/${privateChatId}`);

    // Set up Firestore listener
    onSnapshot(chatDocRef, (docSnapshot) => {
      const chatData: any = docSnapshot.data();
      if (chatData && chatData.messages) {
        this.groupMessagesByDate(chatData.messages);
        this.scrollToBottom();
      }
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

      // Add a flag to check if the message is from the current user
      acc[dateString].push({
        ...message,
        isOwnMessage: message.senderId === this.currentUserId
      });
      return acc;
    }, {});

    this.groupedMessages = Object.keys(grouped).map((date) => ({
      date,
      messages: grouped[date],
    }));
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
