import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { ChannelMessage } from '../../../../shared/models/channel-message.model';
import { ThreadMessage } from '../../../../shared/models/thread-message.model';
import { distinctUntilChanged, Subject, Subscription, takeUntil } from 'rxjs';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ThreadPrivateChatService } from '../../../../shared/services/thread-private-chat/thread-private-chat.service';
import { OwnThreadPrivateMessageTemplateComponent } from '../own-thread-private-message-template/own-thread-private-message-template.component';
import { OtherThreadPrivateMessageTemplateComponent } from '../other-thread-private-message-template/other-thread-private-message-template.component';
import { PrivateChatComponent } from '../../private-chat.component';

@Component({
  selector: 'app-thread-private-chat-history',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    CommonModule,
    OwnThreadPrivateMessageTemplateComponent,
    OtherThreadPrivateMessageTemplateComponent,
  ],
  templateUrl: './thread-private-chat-history.component.html',
  styleUrl: './thread-private-chat-history.component.scss',
})
export class ThreadPrivateChatHistoryComponent {
  @Input() currentUserId: any;

  public currentMessage: ChannelMessage | null = null;
  public threadMessages: ThreadMessage[] = [];
  private threadSubscription: Subscription | undefined;
  private threadMessagesSubscription: Subscription | undefined;

  @ViewChild('messageContainerThread') messageContainer!: ElementRef;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private threadService: ThreadPrivateChatService,
    private cdr: ChangeDetectorRef,
    private privateChat: PrivateChatComponent
  ) {}

  /**
   * Initialize the component and subscribe to actual message and thread messages changes.
   */
  ngOnInit(): void {
    this.subscribeToActualMessage();
    this.subscribeToThreadMessages();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  /**
   * Subscribe to actual message and thread messages changes.
   */
  private subscribeToActualMessage(): void {
    this.threadSubscription = this.threadService.actualMessage$
      .pipe(
        takeUntil(this.unsubscribe$),
        distinctUntilChanged(
          (prev, curr) => prev?.messageId === curr?.messageId
        )
      )
      .subscribe((message) => this.handleActualMessage(message));
  }

  /**
   * Handles the actual message and scrolls to the bottom if necessary.
   * @param message - The actual message to handle.
   */
  private handleActualMessage(message: any): void {
    if (
      !this.currentMessage ||
      this.currentMessage.messageId !== message?.messageId
    ) {
      this.currentMessage = message;
      this.scrollToBottom();
    }

    if (message === null || message === undefined)
      this.privateChat.closeSidenav();
  }

  /**
   * Subscribe to thread messages changes and handle them.
   */
  private subscribeToThreadMessages(): void {
    this.threadMessagesSubscription = this.threadService.threadMessages$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((messages) => this.handleThreadMessages(messages));
  }

  /**
   * Handles the thread messages and scrolls to the bottom if necessary.
   * @param messages - The thread messages to handle.
   */
  private handleThreadMessages(messages: any[]): void {
    if (JSON.stringify(messages) !== JSON.stringify(this.threadMessages)) {
      this.threadMessages = messages;
      this.scrollToBottom();
      this.cdr.detectChanges();
    }
  }

  /**
   * Clean up subscriptions on component destroy.
   */
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.threadSubscription?.unsubscribe();
    this.threadMessagesSubscription?.unsubscribe();
  }

  /**
   * Checks if the given message is sent by the current user for channel messages.
   * @param message - The message to check.
   * @returns True if the message is sent by the current user, false otherwise.
   */
  isCurrentUser(message: ChannelMessage): boolean {
    return message.userId === this.currentUserId;
  }

  /**
   * Checks if the given message is sent by the current user for thread messages.
   * @param message - The message to check.
   * @returns True if the message is sent by the current user, false otherwise.
   */
  isCurrentUserThread(message: ThreadMessage): boolean {
    return message.userId === this.currentUserId;
  }

  /**
   * Scrolls the message container to the bottom.
   */
  private scrollToBottom(): void {
    if (this.messageContainer) {
      this.messageContainer.nativeElement.scrollBottom =
        this.messageContainer.nativeElement.scrollHeight;
    }
  }
}
