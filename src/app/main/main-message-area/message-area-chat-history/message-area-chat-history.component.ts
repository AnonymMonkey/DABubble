import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  AfterViewChecked,
  inject,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule, NgFor } from '@angular/common';
import { ChannelService } from '../../../shared/services/channel-service/channel.service';
import { Observable, Subscription } from 'rxjs';
import { Firestore } from '@angular/fire/firestore';
import { collection, onSnapshot } from 'firebase/firestore';
import { Channel } from '../../../shared/models/channel.model';
import { OtherMessageTemplateComponent } from '../chat-components/other-message-template/other-message-template.component';
import { OwnMessageTemplateComponent } from '../chat-components/own-message-template/own-message-template.component';
import { DateOfMessageComponent } from '../chat-components/date-of-message/date-of-message.component';
import { UserService } from '../../../shared/services/user-service/user.service';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../../shared/services/message-service/message.service';
import { ChannelMessage } from '../../../shared/models/channel-message.model';

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
export class MessageAreaChatHistoryComponent
  implements OnInit, AfterViewChecked, OnDestroy, AfterViewChecked
{
  @Input() currentUserId: string | undefined;
  currentChannel$?: Observable<Channel | undefined>;
  groupedMessages: any[] = [];
  private shouldScroll: boolean = true;
  firestore = inject(Firestore);
  private messageService = inject(MessageService);

  private usersData = new Map<string, any>();

  private userSubscription?: Subscription;
  private messageSubscription?: () => void; // Firebase-Abmeldung

  @ViewChild('messageContainerWrapper') messageContainer!: ElementRef;

  constructor(
    public channelService: ChannelService,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentChannel$ = this.channelService.currentChannel$;
    this.loadChatHistory();
  }

  loadChatHistory(): void {
    this.currentChannel$?.subscribe({
      next: (channel) => {
        if (channel) {
          this.groupedMessages = []; // Löscht alte Nachrichten
          this.channelService.loadUsersDataForChannel(
            channel.members,
            channel.usersLeft
          );
          // Nachrichten-Map des aktuellen Channels abonnieren
          this.messageService.messagesDataMap$.subscribe((messagesDataMap) => {
            const channelMessages = messagesDataMap.get(channel.channelId); // Hole Nachrichten des aktuellen Channels
            if (channelMessages) {
              const messagesArray = Array.from(channelMessages.values()); // Map in ein Array konvertieren
              this.groupMessagesByDate(messagesArray);
            }
          });
        } else {
          this.groupedMessages = []; // Keine Channel-Daten, also leeren
          this.cdr.detectChanges(); // Ansicht aktualisieren
        }
      },
      error: (err) => console.error('Fehler beim Laden des Channels:', err),
  
      complete: () => {
        this.checkLoadingComplete();
      },
    });
  
    this.userSubscription = this.channelService
      .getUsersDataObservable()
      .subscribe({
        next: (usersMap) => {
          if (usersMap) {
            this.usersData = usersMap;
            this.checkLoadingComplete();
          }
        },
        error: (err) => console.error('Fehler beim Laden der User-Daten:', err),
      });
  }
  

  private checkLoadingComplete(): void {
    if (this.groupedMessages.length > 0 && this.usersData.size > 0) {
      this.channelService.loading = false;
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
    }
  }

  getAllMessages(): any[] {
    return this.groupedMessages.flatMap((group) => group.messages);
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.messageSubscription?.();
  }

  loadUsersData(usersLeft: string[]): void {
    usersLeft.forEach((userId) => {
      if (!this.usersData.has(userId)) {
        this.userService.getUserDataByUID(userId).subscribe({
          next: (userData) => {
            if (userData) {
              this.usersData.set(userId, userData);
            }
          },
          error: (err) =>
            console.error(`Fehler beim Laden von Benutzer ${userId}:`, err),
        });
      }
    });
  }

  listenForMessages(channelId: string): void {
    const messagesCollectionRef = collection(
      this.firestore,
      `channels/${channelId}/messages`
    );
    this.messageSubscription = onSnapshot(messagesCollectionRef, (snapshot) => {
      if (snapshot.empty) {
        this.groupedMessages = []; // Leere Nachrichtengruppe
        this.cdr.detectChanges(); // Ansicht aktualisieren
      } else {
        const newMessages: any = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        this.groupMessagesByDate(newMessages);
        this.shouldScroll = true;
      }
    });
  }

  groupMessagesByDate(messages: ChannelMessage[]): void {
    const grouped = messages.reduce<{ [key: string]: ChannelMessage[] }>((acc, message) => {
      const messageDate = new Date(message.time);
      const today = new Date();
      let dateString: string;
  
      dateString =
        messageDate.toDateString() === today.toDateString()
          ? 'Heute'
          : messageDate.toLocaleDateString();
  
      // Falls der Schlüssel noch nicht existiert, initialisieren
      if (!acc[dateString]) acc[dateString] = [];
  
      acc[dateString].push({
        ...message,
      });
  
      return acc;
    }, {}); // Initialwert: ein leeres Objekt mit dem richtigen Typ
  
    // Gruppierte Nachrichten verarbeiten
    this.groupedMessages = Object.keys(grouped)
      .map((date) => ({
        date,
        messages: grouped[date].sort(
          (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
        ),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
    // Change Detection anstoßen
    this.cdr.detectChanges();
  }

  // Scrollt die Nachrichtensicht nach unten
  scrollToBottom(): void {
    if (this.messageContainer?.nativeElement) {
      this.messageContainer.nativeElement.scrollTop =
        this.messageContainer.nativeElement.scrollHeight;
      if (this.shouldScroll) {
        this.shouldScroll = false; // Verhindert weiteres Scrollen
      }
    }
  }
}
