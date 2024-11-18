import { Component, ElementRef, Input, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { ThreadService } from '../../../../shared/services/thread-service/thread.service';
import { ChannelMessage } from '../../../../shared/models/channel-message.model';
import { ThreadMessage } from '../../../../shared/models/thread-message.model';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OtherThreadMessageTemplateComponent } from './other-thread-message-template/other-thread-message-template.component';
import { OwnThreadMessageTemplateComponent } from './own-thread-message-template/own-thread-message-template.component';

@Component({
  selector: 'app-thread-chat-history',
  standalone: true,
  imports: [NgIf, NgFor, CommonModule, OtherThreadMessageTemplateComponent, OwnThreadMessageTemplateComponent],
  templateUrl: './thread-chat-history.component.html',
  styleUrls: ['./thread-chat-history.component.scss']
})
export class ThreadChatHistoryComponent implements OnInit, OnDestroy {
  @Input() currentUserId: any; // Derzeitiger Benutzer
  public currentMessage: ChannelMessage | null = null; // Aktuelle Nachricht
  public threadMessages: ThreadMessage[] = []; // Lokale Variable für Thread-Nachrichten

  @ViewChild('messageContainer') messageContainer!: ElementRef;
  private unsubscribe$ = new Subject<void>(); // Subject zum Steuern der Zerstörung

  constructor(private threadService: ThreadService) {}

  ngOnInit(): void {
    this.threadService.actualMessage$.pipe(takeUntil(this.unsubscribe$)).subscribe((message) => {
      this.currentMessage = message;
    });
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(); // Signalisiert die Zerstörung
    this.unsubscribe$.complete(); // Schließt das Subject
  }

  isCurrentUser(message: ChannelMessage): boolean {
    return message.userId === this.currentUserId;
  }

  isCurrentUserThread(message: ThreadMessage): boolean {
    return message.userId === this.currentUserId;
  }

  private scrollToBottom(): void {
    if (this.messageContainer) {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    }
  }
}
