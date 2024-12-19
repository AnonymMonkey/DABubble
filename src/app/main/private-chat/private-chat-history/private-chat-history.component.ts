import {
  Component,
  Input,
  SimpleChanges,
  ElementRef,
  ViewChild,
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
export class PrivateChatHistoryComponent {
  @Input() messages: any[] = [];
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  groupedMessages: { date: string; messages: any[] }[] = [];
  scrollAllowed: boolean = true;

  constructor(public userService: UserService) {}

  /**
   * Group and sort messages based on date oninit.
   */
  ngOnInit(): void {
    this.groupAndSortMessages();
  }

  /**
   * Group and sort messages based on date onchanges.
   * @param changes - The changes object.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['messages'] && !changes['messages'].firstChange) {
      this.messages = changes['messages'].currentValue;
      this.groupAndSortMessages();
    }
  }

  /**
   * Groups messages by date and sorts them chronologically.
   */
  private groupAndSortMessages(): void {
    const grouped = this.groupMessagesByDate(this.messages);
    this.groupedMessages = this.sortGroupedMessages(grouped);
  }

  /**
   * Groups messages by their date.
   * @param messages - The array of messages to group.
   * @returns An object where the keys are dates and values are arrays of messages.
   */
  private groupMessagesByDate(messages: any[]): { [date: string]: any[] } {
    return messages.reduce((grouped, message) => {
      const date = new Date(message.time).toLocaleDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(message);
      return grouped;
    }, {} as { [date: string]: any[] });
  }

  /**
 * Sorts grouped messages and orders them by ascending date.
 * @param grouped - The grouped messages object.
 * @returns A sorted array of message groups.
 */
  private sortGroupedMessages(grouped: { [date: string]: any[] }): any[] {
    return Object.keys(grouped)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map((date) => ({
        date,
        messages: grouped[date].sort(
          (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
        ),
      }))
      .reverse();
  }
  
  
  


  /**
   * Check if a message is sent by the current user.
   * @param userId - The ID of the user who sent the message.
   * @returns True if the message is sent by the current user, false otherwise.
   */
  isOwnMessage(userId: string): boolean {
    return userId === this.userService.userId;
  }
}
