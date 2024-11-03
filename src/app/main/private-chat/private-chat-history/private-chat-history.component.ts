import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { DateOfMessageComponent } from '../../main-message-area/chat-components/date-of-message/date-of-message.component';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { OtherPrivateMessageTemplateComponent } from '../chat-components/other-private-message-template/other-private-message-template.component';
import { OwnPrivateMessageTemplateComponent } from '../chat-components/own-private-message-template/own-private-message-template.component';
import { PrivateChatPlaceholderComponent } from '../private-chat-placeholder/private-chat-placeholder.component';
import { PrivateChatHeaderComponent } from '../private-chat-header/private-chat-header.component';
import { UserService } from '../../../shared/services/user-service/user.service';

@Component({
  selector: 'app-private-chat-history',
  standalone: true,
  imports: [
    DateOfMessageComponent,
    NgFor,
    MatCardModule,
    AsyncPipe,
    NgIf,
    OtherPrivateMessageTemplateComponent,
    OwnPrivateMessageTemplateComponent,
    PrivateChatPlaceholderComponent,
    PrivateChatHeaderComponent,
  ],
  templateUrl: './private-chat-history.component.html',
  styleUrls: ['./private-chat-history.component.scss'],
})
export class PrivateChatHistoryComponent
  implements OnInit, OnChanges, AfterViewInit
{
  @Input() messages: any[] = []; // Erwartet ein Array von Nachrichten
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  privateChatId: string = '';
  groupedMessages: { date: string; messages: any[] }[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.groupAndSortMessages();
    this.scrollToBottom();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['messages'] && !changes['messages'].firstChange) {
      this.groupAndSortMessages();
      this.scrollToBottom(); // Zum neuesten Nachrichtenblock scrollen
    }
  }

  ngAfterViewInit(): void {
    this.scrollToBottom(); // Initiales Scrollen zum unteren Rand
  }

  private groupAndSortMessages(): void {
    const grouped: { [date: string]: any[] } = {};

    // Nachrichten gruppieren und nach Datum sortieren
    this.messages
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()) // Nachrichten nach Zeit sortieren
      .forEach((message) => {
        const date = new Date(message.time).toLocaleDateString(); // Verwende ein einheitliches Datumsformat
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(message);
      });

    this.groupedMessages = Object.keys(grouped).map((date) => ({
      date,
      messages: grouped[date],
    }));
  }

  private async scrollToBottom(): Promise<void> {
    if (this.chatContainer) {
      try {
        await new Promise(resolve => setTimeout(resolve, 50)); // Kurze Verzögerung, um DOM-Aktualisierung abzuwarten
        this.chatContainer.nativeElement.scrollTop =
          this.chatContainer.nativeElement.scrollHeight;
      } catch (err) {
        console.error('Scroll Error:', err);
      }
    }
  }

  isOwnMessage(userId: string): boolean {
    return userId === this.userService.userId;
  }
}
