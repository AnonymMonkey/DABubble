import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  AfterViewChecked,
  OnDestroy,
} from '@angular/core';
import { DateOfMessageComponent } from '../../main-message-area/chat-components/date-of-message/date-of-message.component';
import { NgFor, NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { OtherPrivateMessageTemplateComponent } from '../chat-components/other-private-message-template/other-private-message-template.component';
import { OwnPrivateMessageTemplateComponent } from '../chat-components/own-private-message-template/own-private-message-template.component';
import { UserService } from '../../../shared/services/user-service/user.service';
import { UserData } from '../../../shared/models/user.model';

@Component({
  selector: 'app-private-chat-history',
  standalone: true,
  imports: [
    DateOfMessageComponent,
    NgFor,
    MatCardModule,
    NgIf,
    OtherPrivateMessageTemplateComponent,
    OwnPrivateMessageTemplateComponent,
  ],
  templateUrl: './private-chat-history.component.html',
  styleUrls: ['./private-chat-history.component.scss'],
})
export class PrivateChatHistoryComponent
  implements OnInit, OnChanges, AfterViewChecked, OnDestroy {
  
  @Input() messages: any[] = []; // Erwartet ein Array von Nachrichten
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  groupedMessages: { date: string; messages: any[] }[] = [];
  userCache: { [userId: string]: UserData } = {};
  scrollAllowed: boolean = true;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.groupAndSortMessages();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
    this.scrollAllowed = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['messages'] && !changes['messages'].firstChange) {
      this.groupAndSortMessages();
    }
  }

  private groupAndSortMessages(): void {
    const grouped: { [date: string]: any[] } = {};

    this.messages
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
      .forEach((message) => {
        const date = new Date(message.time).toLocaleDateString();
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(message);
        this.loadUserData(message.userId);
      });

    this.groupedMessages = Object.keys(grouped).map((date) => ({
      date,
      messages: grouped[date],
    }));
  }

  private loadUserData(userId: string): void {
    if (!this.userCache[userId]) {
      this.userService.getUserDataByUID(userId).subscribe(
        (userData) => {
          this.userCache[userId] = userData;
        },
        (error) => {
          console.error('Fehler beim Laden der Benutzerdaten:', error);
        }
      );
    }
  }

  getUserData(userId: string): UserData {
    if (!this.userCache[userId]) {
      this.userService.getUserDataByUID(userId).subscribe((userData) => {
        this.userCache[userId] = userData;
      });
      return {} as UserData; // Platzhalter, falls Daten noch nicht geladen sind
    }
    return this.userCache[userId];
  }

  private scrollToBottom(): void {
    if (this.chatContainer && this.scrollAllowed) {
      const container = this.chatContainer.nativeElement;
      if (container.scrollHeight !== container.scrollTop + container.clientHeight) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }

  isOwnMessage(userId: string): boolean {
    return userId === this.userService.userId;
  }

  ngOnDestroy(): void {
    this.scrollAllowed = true;    
  }
}
