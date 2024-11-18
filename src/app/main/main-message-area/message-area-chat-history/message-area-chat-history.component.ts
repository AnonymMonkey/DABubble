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
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Firestore } from '@angular/fire/firestore';
import { collection, onSnapshot } from 'firebase/firestore';
import { Channel } from '../../../shared/models/channel.model';
import { OtherMessageTemplateComponent } from '../chat-components/other-message-template/other-message-template.component';
import { OwnMessageTemplateComponent } from '../chat-components/own-message-template/own-message-template.component';
import { DateOfMessageComponent } from '../chat-components/date-of-message/date-of-message.component';
import { UserService } from '../../../shared/services/user-service/user.service';

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

  private usersData = new Map<string, any>();

  private userSubscription?: Subscription;
  private messageSubscription?: () => void; // Firebase-Abmeldung

  @ViewChild('messageContainerWrapper') messageContainer!: ElementRef;

  constructor(
    private channelService: ChannelService,
    private cdr: ChangeDetectorRef,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Abonniere den aktuellen Channel und lade Nachrichten
    this.currentChannel$ = this.channelService.currentChannel$;
    this.currentChannel$.subscribe({
      next: (channel) => {
        if (channel) {
          this.groupedMessages = [];
          this.channelService.loadUsersDataForChannel(
            channel.members,
            channel.usersLeft
          );
          this.listenForMessages(channel.channelId);
        }
      },
      error: (err) => console.error('Fehler beim Laden des Channels:', err),
    });

    // Abonniere User-Daten und aktualisiere die Map
    this.userSubscription = this.channelService
      .getUsersDataObservable()
      .subscribe({
        next: (usersMap) => {
          if (usersMap) {
            let hasChanges = false;
            usersMap.forEach((userData, userId) => {
              if (!this.usersData.has(userId)) {
                this.usersData.set(userId, userData);
                hasChanges = true;
              } else {
                const existingData = this.usersData.get(userId);
                if (
                  existingData.displayName !== userData.displayName ||
                  existingData.photoURL !== userData.photoURL
                ) {
                  this.usersData.set(userId, userData);
                  hasChanges = true;
                }
              }
            });

            if (hasChanges) {
              this.groupMessagesByDate(this.getAllMessages()); // Gruppiere erneut
            }
          } else {
            console.error('Leere oder ungültige User-Daten erhalten');
          }
        },
        error: (err) => console.error('Fehler beim Laden der User-Daten:', err),
      });

      this.scrollToBottom();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }
  

  getAllMessages(): any[] {
    return this.groupedMessages.flatMap(group => group.messages);
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
      if (!snapshot.empty) {
        const newMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        this.groupMessagesByDate(newMessages);
        this.shouldScroll = true;
      }
    });
  }

  groupMessagesByDate(messages: any[]): void {
    const grouped = messages.reduce((acc, message) => {
      const messageDate = new Date(message.time);
      const today = new Date();
      let dateString: string;
  
      dateString =
        messageDate.toDateString() === today.toDateString()
          ? 'Heute'
          : messageDate.toLocaleDateString();
  
      if (!acc[dateString]) acc[dateString] = [];
  
      const userData = this.usersData.get(message.userId);
      const userName = userData ? userData.displayName : 'Unbekannter Benutzer';
      const photoURL = userData ? userData.photoURL : null;
  
      acc[dateString].push({
        ...message,
        userName,
        photoURL,
      });
  
      return acc;
    }, {});
  
    this.groupedMessages = Object.keys(grouped)
      .map((date) => ({
        date,
        messages: grouped[date].sort(
          (a: any, b: any) =>
            new Date(a.time).getTime() - new Date(b.time).getTime()
        ),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
    this.cdr.detectChanges(); // Change Detection anstoßen
  }
  

  // Aktualisiert die Ansicht, wenn neue Nachrichten hinzukommen
  updateMessages(): void {
    this.groupedMessages = [...this.groupedMessages]; // Neue Referenz für Angular
    this.cdr.detectChanges(); // Change Detection anstoßen
  }

  // Scrollt die Nachrichtensicht nach unten
  scrollToBottom(): void {
    if (this.messageContainer?.nativeElement) {
      // Sofortiges Scrollen ohne Verzögerung
      this.messageContainer.nativeElement.scrollTop =
        this.messageContainer.nativeElement.scrollHeight;
  
      // Wenn es eine neue Nachricht gibt, scrollen wir etwas schneller, z. B. durch eine geringe Verzögerung
      if (this.shouldScroll) {
        this.shouldScroll = false; // Verhindert weiteres Scrollen
      }
    }
  }
  
}
