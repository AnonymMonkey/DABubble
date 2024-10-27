import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChannelMessage } from '../../shared/models/channel-message.model';
import { MatCard, MatCardModule } from '@angular/material/card';
import { PrivateChatHeaderComponent } from './private-chat-header/private-chat-header.component';
import { PrivateChatPlaceholderComponent } from './private-chat-placeholder/private-chat-placeholder.component';
import { MessageAreaNewMessageComponent } from '../main-message-area/message-area-new-message/message-area-new-message.component';
import { NgIf } from '@angular/common';
import { PrivateChat } from '../../shared/models/private-chat.model';
import { UserService } from '../../shared/services/user-service/user.service';
import { PrivateChatHistoryComponent } from './private-chat-history/private-chat-history.component';

@Component({
  selector: 'app-private-chat',
  templateUrl: './private-chat.component.html',
  styleUrls: ['./private-chat.component.scss'],
  standalone: true,
  imports: [
    MatCard,
    NgIf,
    MatCardModule,
    PrivateChatHeaderComponent,
    PrivateChatPlaceholderComponent,
    PrivateChatHistoryComponent,
    MessageAreaNewMessageComponent,
  ],
})
export class PrivateChatComponent implements OnInit {
  public hasMessages: boolean = false;
  public messages: ChannelMessage[] = [];
  private privateChat!: PrivateChat;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const currentUserId = this.userService.userId; // Holen von der Authentifizierung oder woanders
    const privateChatId: any =
      this.route.snapshot.paramMap.get('privateChatId'); // privateChatId aus den Routenparametern holen

    this.userService.getUserDataByUID(currentUserId).subscribe({
      next: (userData) => {
        this.privateChat = userData.privateChat[privateChatId];
        if (this.privateChat?.messages) {
          this.hasMessages = this.privateChat.messages.length > 0;
          this.messages = this.privateChat.messages;
        }
      },
      error: (err) => {
        console.error('Fehler beim Abrufen der Benutzerdaten:', err);
      }
    });
  }
}
