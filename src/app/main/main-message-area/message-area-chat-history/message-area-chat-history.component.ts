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
import { user } from '@angular/fire/auth';

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
  private previousUsersCount: number = 0;
  private usersData = new Map<string, any>();
  private userSubscription?: Subscription;
  private usersDataSubscription?: Subscription;
  private channelServiceSubscription?: Subscription;
  private messageDataMapSubscription?: Subscription;
  private messageSubscription?: () => void;
  @ViewChild('messageContainerWrapper') messageContainer!: ElementRef;

  constructor(
    public channelService: ChannelService,
    private cdr: ChangeDetectorRef,
    private userService: UserService
  ) {}

  /**
   * Initialises the component and loads the chat history.
   */
  ngOnInit(): void {
    this.currentChannel$ = this.channelService.currentChannel$;
    this.loadChatHistory();
  }

  /**
   * Loads the chat history for the current channel.
   */
  loadChatHistory(): void {
    this.channelServiceSubscription = this.currentChannel$?.subscribe({
      next: (channel) => {
        if (channel) {
          this.getUsersData(channel);
          this.getAllMessagesFromChannel(channel.channelId);
        } else this.resetAndDetectChanges();
      },
      error: (err) => console.error('Fehler beim Laden des Channels:', err),
      complete: () => {
        this.checkLoadingComplete();
      },
    });
    this.subscribeUsersData();
  }

  /**
   * Loads the users data for the current channel.
   * @param channel - The channel object.
   */
  getUsersData(channel: Channel): void {
    this.groupedMessages = [];
    this.channelService.loadUsersDataForChannel(
      channel.members,
      channel.usersLeft
    );
  }

  /**
   * Groups the messages by date and updates the groupedMessages array.
   * @param messages - An array of ChannelMessage objects.
   */
  getAllMessagesFromChannel(channelId: string): void {
    this.messageDataMapSubscription = this.messageService.messagesDataMap$.subscribe((messagesDataMap) => {
      const channelMessages = messagesDataMap.get(channelId);
      if (channelMessages) {
        const messagesArray = Array.from(channelMessages.values());
        this.groupMessagesByDate(messagesArray);
      }
    });
  }

  /**
   * Resets the groupedMessages array and triggers change detection.
   */
  resetAndDetectChanges(): void {
    this.groupedMessages = [];
    this.cdr.detectChanges();
  }

  /**
   * Subscribes to the users data observable and updates the usersData map.
   */
  private async subscribeUsersData(): Promise<void> {
    try {
      this.userSubscription = this.channelService
        .getUsersDataObservable()
        .subscribe({
          next: (usersMap) => {
            if (usersMap) {
              this.usersData = usersMap;
              this.checkLoadingComplete();
            }
          },
          error: (err) =>
            console.error('Fehler beim Laden der User-Daten:', err),
        });
    } catch (err) {
      console.error('Fehler beim Abonnieren der User-Daten:', err);
    }
  }

  /**
   * Checks if the loading is complete and updates the loading state.
   */
  private checkLoadingComplete(): void {
    const currentUsersCount = this.usersData.size;
    if (this.groupedMessages.length > 0 && currentUsersCount > 0 ) {
      if (currentUsersCount === this.previousUsersCount)
        this.channelService.loading = false;
      else this.previousUsersCount = currentUsersCount;
    }
  }

  /**
   * Scrolls the message container to the bottom if the shouldScroll flag is true.
   */
  ngAfterViewChecked(): void {
    if (this.shouldScroll) this.scrollToBottom();
  }

  /**
   * Returns an array of all messages in the groupedMessages array.
   */
  getAllMessages(): any[] {
    return this.groupedMessages.flatMap((group) => group.messages);
  }

  /**
   * Unsubscribes the user subscription, message subscription, channel service subscription, message data map subscription, and users data subscription.
   */
  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.messageSubscription?.();
    if (this.channelServiceSubscription) this.channelServiceSubscription.unsubscribe();
    if (this.messageDataMapSubscription) this.messageDataMapSubscription.unsubscribe();
    if (this.usersDataSubscription) this.usersDataSubscription.unsubscribe();
  }

  /**
   * Loads user data for the given user IDs.
   * @param usersLeft - An array of user IDs.
   */
  loadUsersData(usersLeft: string[]): void {
    usersLeft.forEach((userId) => {
      if (!this.usersData.has(userId)) {
        this.usersDataSubscription = this.userService.getUserDataByUID(userId).subscribe({
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

  /**
   * Starts listening for new messages in the channel.
   * @param channelId - The ID of the channel to listen to.
   */
  listenForMessages(channelId: string): void {
    const messagesCollectionRef = collection(
      this.firestore,
      `channels/${channelId}/messages`
    );
    this.messageSubscription = onSnapshot(messagesCollectionRef, (snapshot) => {
      if (snapshot.empty) {
        this.groupedMessages = [];
        this.cdr.detectChanges();
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

  /**
   * Groups the messages by date and updates the groupedMessages array.
   * @param messages - An array of ChannelMessage objects.
   */
  groupMessagesByDate(messages: ChannelMessage[]): void {
    const grouped = this.groupeMessages(messages);
    this.groupedMessages = Object.keys(grouped)
      .map((date) => ({
        date,
        messages: grouped[date].sort(
          (a: ChannelMessage, b: ChannelMessage) =>
            new Date(a.time).getTime() - new Date(b.time).getTime()
        ),
      }))
      .sort(
        (a: { date: string }, b: { date: string }) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    this.cdr.detectChanges();
  }

  /**
   * Groups the messages by date.
   * @param messages - An array of ChannelMessage objects.
   * @returns An object containing the grouped messages.
   */
  groupeMessages(messages: ChannelMessage[]): any {
    const grouped = messages.reduce<{ [key: string]: ChannelMessage[] }>(
      (acc, message) => {
        const messageDate = new Date(message.time);
        const today = new Date();
        const dateString =
          messageDate.toDateString() === today.toDateString()
            ? 'Heute'
            : messageDate.toLocaleDateString();
        if (!acc[dateString]) acc[dateString] = [];
        acc[dateString].push({ ...message });
        return acc;
      },
      {}
    );
    return grouped;
  }

  /**
   * Scrolls the message container to the bottom.
   */
  scrollToBottom(): void {
    if (this.messageContainer?.nativeElement) {
      this.messageContainer.nativeElement.scrollTop =
        this.messageContainer.nativeElement.scrollHeight;
      if (this.shouldScroll) this.shouldScroll = false;
    }
  }
}
