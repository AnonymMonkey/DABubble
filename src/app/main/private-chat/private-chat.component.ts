import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MessageAreaChatHistoryComponent } from '../main-message-area/message-area-chat-history/message-area-chat-history.component';
import { MessageAreaNewMessageComponent } from '../main-message-area/message-area-new-message/message-area-new-message.component';
import { PrivateChatHeaderComponent } from './private-chat-header/private-chat-header.component';
import { PrivateChatPlaceholderComponent } from './private-chat-placeholder/private-chat-placeholder.component';
import { NgIf } from '@angular/common';
import { PrivateChatService } from '../../shared/services/private-chat-service/private-chat.service';
import { MainComponent } from '../main.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-private-chat',
  standalone: true,
  imports: [MatCard, NgIf, MatCardContent, PrivateChatHeaderComponent, MessageAreaChatHistoryComponent, PrivateChatPlaceholderComponent, MessageAreaNewMessageComponent],
  templateUrl: './private-chat.component.html',
  styleUrl: './private-chat.component.scss'
})
export class PrivateChatComponent implements OnInit {
  public hasMessages: boolean = false;
  public currentChat$ = this.privateChatService.currentPrivateChat$;

  constructor(private privateChatService: PrivateChatService, private main: MainComponent, private route: ActivatedRoute) {
    this.currentChat$ = this.privateChatService.currentPrivateChat$;
  }

  ngOnInit(): void {
    // Beispiel: Lade den privaten Chat für den Benutzer beim Initialisieren der Komponente
    const currentUserId = this.main.userId;
    const privateChatId = this.route.snapshot.paramMap.get('privateChatId') || '';
    this.privateChatService.getPrivateChat(currentUserId, privateChatId);

    // Auf Änderungen des Chats reagieren, um die Anzeige dynamisch zu aktualisieren
    this.currentChat$.subscribe(chat => {
      this.hasMessages = !!chat?.messages?.length;
    });
  }
}
