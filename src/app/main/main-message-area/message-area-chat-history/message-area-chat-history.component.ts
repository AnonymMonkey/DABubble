import { Component, ElementRef, Input, OnInit, ViewChild, AfterViewChecked, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule, NgFor } from '@angular/common';
import { ChannelService } from '../../../shared/services/channel-service/channel.service';
import { BehaviorSubject, Observable, of, Subscription, tap } from 'rxjs';
import { Firestore } from '@angular/fire/firestore';
import { collection, onSnapshot } from 'firebase/firestore';
import { Channel } from '../../../shared/models/channel.model';
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

export class MessageAreaChatHistoryComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Input() currentUserId: string | undefined;
  currentChannel$?: Observable<Channel | undefined>;
  groupedMessages: any[] = [];
  private shouldScroll: boolean = true;
  firestore = inject(Firestore);

  private usersData = new Map<string, any>();

  private userSubscription?: Subscription;
  private messageSubscription?: () => void;  // Firebase-Abmeldung

  @ViewChild('messageContainer') messageContainer!: ElementRef;

  constructor(
    private channelService: ChannelService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Abonniere den aktuellen Channel und lade Nachrichten
    this.currentChannel$ = this.channelService.currentChannel$;
    this.currentChannel$.subscribe({
      next: (channel) => {
        if (channel) {
          this.channelService.loadUsersDataForChannel(channel.members);
          this.listenForMessages(channel.channelId);
        }
      },
      error: (err) => console.error('Error loading channel:', err),
    });

    // Abonniere User-Daten und aktualisiere die Map
    this.userSubscription = this.channelService.getUsersDataObservable().subscribe({
      next: (usersMap) => {
        if (usersMap) {
          this.usersData = usersMap;
        } else {
          console.error('Leere oder ungültige User-Daten erhalten');
        }
      },
      error: (err) => console.error('Fehler beim Laden der User-Daten:', err),
    });
  }

  ngOnDestroy(): void {
    // Vermeidung von Memory-Leaks: Abmeldung von Observables
    this.userSubscription?.unsubscribe();
    this.messageSubscription?.();  // Abmeldung vom Firestore
  }

  // Echtzeit-Nachrichten-Listener für den aktuellen Channel
  listenForMessages(channelId: string): void {
    const messagesCollectionRef = collection(this.firestore, `channels/${channelId}/messages`);
    this.messageSubscription = onSnapshot(messagesCollectionRef, (snapshot) => {
      if (!snapshot.empty) {
        const newMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        this.groupMessagesByDate(newMessages);
        this.shouldScroll = true;  // Aktiviert das automatische Scrollen bei neuen Nachrichten
      }
    });
  }

  // Gruppierung der Nachrichten nach Datum und Anreicherung mit User-Daten
  groupMessagesByDate(messages: any[]): void {
    const grouped = messages.reduce((acc, message) => {
      const messageDate = new Date(message.time);
      const today = new Date();
      let dateString: string;

      dateString = (messageDate.toDateString() === today.toDateString())
        ? 'Heute'
        : messageDate.toLocaleDateString();

      if (!acc[dateString]) acc[dateString] = [];

      const userData = this.usersData.get(message.userId);
      const userName = userData?.displayName || 'Unbekannter Benutzer';
      const photoURL = userData?.photoURL || null;

      acc[dateString].push({
        ...message,
        userName,
        photoURL,
      });

      return acc;
    }, {});

    // Sortiere die Nachrichten innerhalb der Gruppen und dann die Gruppen selbst chronologisch aufsteigend
    this.groupedMessages = Object.keys(grouped)
      .map((date) => ({
        date,
        messages: grouped[date].sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime())
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    this.updateMessages();  // Aktualisiere die Ansicht
}


  // Aktualisiert die Ansicht, wenn neue Nachrichten hinzukommen
  updateMessages(): void {
    this.groupedMessages = [...this.groupedMessages];  // Neue Referenz für Angular
    this.cdr.detectChanges();  // Change Detection anstoßen
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  // Scrollt die Nachrichtensicht nach unten
  scrollToBottom(): void {
    if (this.messageContainer?.nativeElement) {
      setTimeout(() => {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
      }, 100);
    }
  }
}
