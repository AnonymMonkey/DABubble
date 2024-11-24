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
  implements OnInit, OnChanges, OnDestroy
{
  @Input() messages: any[] = []; // Erwartet ein Array von Nachrichten
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  groupedMessages: { date: string; messages: any[] }[] = [];
  scrollAllowed: boolean = true;

  constructor(public userService: UserService) {}

  ngOnInit(): void {
    this.groupAndSortMessages();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['messages'] && !changes['messages'].firstChange) {
      this.messages = changes['messages'].currentValue;
      this.groupAndSortMessages();
    }
  }  

  private groupAndSortMessages(): void {
    const grouped: { [date: string]: any[] } = {};
  
    // Sortiere Nachrichten nach der Zeit (älteste zuerst)
    this.messages
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
      .forEach((message) => {
        const date = new Date(message.time).toLocaleDateString();
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(message);
      });
  
    // Gruppierte Nachrichten erstellen und umkehren, sodass die ältesten Gruppen zuerst kommen
    this.groupedMessages = Object.keys(grouped)
      .map((date) => ({
        date,
        messages: grouped[date],
      }))
      .reverse(); // Umkehren der Reihenfolge der Gruppen
  }

  isOwnMessage(userId: string): boolean {
    return userId === this.userService.userId;
  }

  ngOnDestroy(): void {
    this.scrollAllowed = true;
  }
}
