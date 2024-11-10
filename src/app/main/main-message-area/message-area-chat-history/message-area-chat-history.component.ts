import { Component, ElementRef, Input, OnInit, ViewChild, AfterViewChecked } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule, NgFor } from '@angular/common';
import { ChannelService } from '../../../shared/services/channel-service/channel.service';
import { UserService } from '../../../shared/services/user-service/user.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Firestore } from '@angular/fire/firestore';
import { collection, onSnapshot } from 'firebase/firestore';
import { Channel } from '../../../shared/models/channel.model';
import { DocumentData } from 'rxfire/firestore/interfaces';
import { OtherMessageTemplateComponent } from '../chat-components/other-message-template/other-message-template.component';
import { OwnMessageTemplateComponent } from '../chat-components/own-message-template/own-message-template.component';
import { DateOfMessageComponent } from '../chat-components/date-of-message/date-of-message.component';

@Component({
  selector: 'app-message-area-chat-history',
  standalone: true,
  imports: [
    DateOfMessageComponent,
    NgFor,
    MatSidenavModule,
    CommonModule,
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
  showMessages: boolean = false; // Neue Variable

  private usersData: BehaviorSubject<Map<string, any>> = new BehaviorSubject(new Map());

  @ViewChild('messageContainer') messageContainer!: ElementRef;

  constructor(
    private firestore: Firestore,
    private channelService: ChannelService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.currentChannel$ = this.channelService.currentChannel$;
    this.currentChannel$.subscribe({
      next: (channel) => {
        if (channel) {
          this.loadUsersData(channel.channelId);
          this.listenForMessages(channel.channelId);
        }
      },
      error: (err) => {
        console.error('Error loading channel:', err);
      }
    });
  }

  loadUsersData(channelId: string): void {
    this.channelService.getChannelMembers(channelId).subscribe({
      next: (members: any[]) => {
        members.forEach((userId: any) => {
          this.userService.getUserDataByUID(userId).pipe(
            catchError((err) => {
              console.error(`Fehler beim Laden der Daten für Benutzer ${userId}:`, err);
              return of(null);
            })
          ).subscribe((userData) => {
            if (userData) {
              const updatedMap = this.usersData.value;
              updatedMap.set(userId, userData);
              this.usersData.next(updatedMap);
            }
          });
        });
      },
      error: (err) => {
        console.error('Fehler beim Laden der Mitglieder:', err);
      }
    });
  }

  listenForMessages(channelId: string): void {
    const messagesCollectionRef = collection(this.firestore, `channels/${channelId}/messages`);
    onSnapshot(messagesCollectionRef, (snapshot) => {
      if (!snapshot.empty) {
        const newMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        this.groupMessagesByDate(newMessages);
      }
    });
  }

  groupMessagesByDate(messages: any[]): void {
    const grouped = messages.reduce((acc, message) => {
      const messageDate = new Date(message.time);
      const today = new Date();
      let dateString: string;
      if (messageDate.toDateString() === today.toDateString()) {
        dateString = 'Heute';
      } else {
        dateString = messageDate.toLocaleDateString();
      }

      if (!acc[dateString]) {
        acc[dateString] = [];
      }

      const userData = this.usersData.value.get(message.userId);
      const userName = userData?.displayName || 'Unbekannter Benutzer';
      const photoURL = userData?.photoURL || null;

      acc[dateString].push({
        ...message,
        userName,
        photoURL,
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
      this.shouldScroll = false;
    }
  }

  scrollToBottom(): void {
    if (this.messageContainer?.nativeElement) {
      setTimeout(() => {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
      }, 100);
    }
  }
}
