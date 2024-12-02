import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MatCard, MatCardModule } from '@angular/material/card';
import { PrivateChatHeaderComponent } from './private-chat-header/private-chat-header.component';
import { PrivateChatPlaceholderComponent } from './private-chat-placeholder/private-chat-placeholder.component';
import { MessageAreaNewMessageComponent } from '../main-message-area/message-area-new-message/message-area-new-message.component';
import { AsyncPipe, NgIf } from '@angular/common';
import { UserService } from '../../shared/services/user-service/user.service';
import { PrivateChatHistoryComponent } from './private-chat-history/private-chat-history.component';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { PrivateChatService } from '../../shared/services/private-chat-service/private-chat.service';

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
    AsyncPipe,
  ],
})
export class PrivateChatComponent implements OnInit {
  privateChat$!: Observable<any>;
  hasMessages: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private privateChatService: PrivateChatService
  ) {}

  /**
   * Initializes the component by subscribing to route parameters and fetching private chat data.
   */
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => this.handlePrivateChatId(params));
    this.privateChat$ = this.route.paramMap.pipe(
      switchMap((params) => this.resolvePrivateChat(params)),
      catchError((err) => this.handleChatFetchError(err))
    );
  }

  /**
   * Handles the extraction and setting of the private chat ID.
   * @param params - The route parameters.
   */
  private handlePrivateChatId(params: ParamMap): void {
    const privateChatId = params.get('privateChatId');
    if (privateChatId) this.privateChatService.setPrivateChatId(privateChatId);
  }

  /**
   * Resolves private chat data from the parameters.
   * @param params - The route parameters.
   * @returns Observable containing the private chat data or null.
   */
  private resolvePrivateChat(params: ParamMap): Observable<any | null> {
    const privateChatId = params.get('privateChatId');
    if (!privateChatId) {
      console.error('No privateChatId found in route parameters');
      this.hasMessages = false;
      return of(null);
    }
    return this.loadPrivateChat(privateChatId);
  }

  /**
   * Loads private chat data for the current user.
   * @param privateChatId - The private chat ID.
   * @returns Observable containing the private chat data or null.
   */
  private loadPrivateChat(privateChatId: string): Observable<any | null> {
    const currentUserId = this.userService.userId;
    return this.userService
      .getUserDataByUID(currentUserId)
      .pipe(
        switchMap((userData) => this.processUserData(userData, privateChatId))
      );
  }

  /**
   * Processes user data to extract the private chat details.
   * @param userData - The current user data.
   * @param privateChatId - The private chat ID.
   * @returns Observable containing the private chat data or null.
   */
  private processUserData(
    userData: any,
    privateChatId: string
  ): Observable<any | null> {
    if (userData?.privateChat?.[privateChatId]) {
      const privateChat = userData.privateChat[privateChatId];
      this.hasMessages =
        !!privateChat.messages && Object.keys(privateChat.messages).length > 0;
      const messagesArray = privateChat.messages
        ? Object.values(privateChat.messages)
        : [];
      return of({ ...privateChat, messages: messagesArray });
    } else {
      console.warn('No user data or private chat data found');
      this.hasMessages = false;
      return of(null);
    }
  }

  /**
   * Handles errors that occur during private chat data fetching.
   * @param error - The error object.
   * @returns Observable containing null.
   */
  private handleChatFetchError(error: any): Observable<null> {
    console.error('Error fetching private chat:', error);
    this.hasMessages = false;
    return of(null);
  }
}
