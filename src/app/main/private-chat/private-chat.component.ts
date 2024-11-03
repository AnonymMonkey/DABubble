import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCard, MatCardModule } from '@angular/material/card';
import { PrivateChatHeaderComponent } from './private-chat-header/private-chat-header.component';
import { PrivateChatPlaceholderComponent } from './private-chat-placeholder/private-chat-placeholder.component';
import { MessageAreaNewMessageComponent } from '../main-message-area/message-area-new-message/message-area-new-message.component';
import { AsyncPipe, NgIf } from '@angular/common';
import { UserService } from '../../shared/services/user-service/user.service';
import { PrivateChatHistoryComponent } from './private-chat-history/private-chat-history.component';
import { catchError, Observable, of, switchMap } from 'rxjs';

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
    AsyncPipe
  ],
})
export class PrivateChatComponent implements OnInit {
  privateChat$!: Observable<any>;
  hasMessages: boolean = false;

  constructor(private route: ActivatedRoute, private userService: UserService) {}

  ngOnInit(): void {
    // Hier wird der switchMap verwendet, um die Route-Parameter zu verarbeiten
    this.privateChat$ = this.route.paramMap.pipe(
      switchMap(params => {
        const privateChatId = params.get('privateChatId');
        const currentUserId = this.userService.userId;

        if (privateChatId) {
          return this.userService.getUserDataByUID(currentUserId).pipe(
            switchMap(userData => {
              const privateChat = userData.privateChat[privateChatId];
              // Überprüfen, ob Nachrichten vorhanden sind
              this.hasMessages = privateChat?.messages && Object.keys(privateChat.messages).length > 0;

              // Umwandeln der Nachrichten in ein Array
              const messagesArray = privateChat?.messages ? Object.values(privateChat.messages) : [];
              
              // Rückgabe des privateChat-Objekts mit dem Array von Nachrichten
              return of({ ...privateChat, messages: messagesArray });
            }),
            catchError(err => {
              console.error('Error fetching user data:', err);
              this.hasMessages = false;
              return of(null); // gibt ein Observable mit null zurück
            })
          );
        } else {
          console.error('No privateChatId found in the route parameters');
          this.hasMessages = false;
          return of(null);
        }
      })
    );
  }
}
