import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../../../../../shared/services/user-service/user.service';
import { PrivateChatService } from '../../../../../shared/services/private-chat-service/private-chat.service';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { MessageReactionsComponent } from '../../../../../shared/components/message-reactions/message-reactions.component';
import { EmojiPickerComponent } from '../../../../../shared/components/emoji-picker/emoji-picker.component';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { AttachmentPreviewComponent } from '../../../../../shared/components/attachment-preview/attachment-preview.component';
import { filter, map, Subscription } from 'rxjs';

@Component({
  selector: 'app-other-thread-message-template',
  standalone: true,
  imports: [
    NgClass,
    NgFor,
    AttachmentPreviewComponent,
    DatePipe,
    MatIcon,
    MatMenu,
    MatMenuTrigger,
    EmojiPickerComponent,
    MessageReactionsComponent,
    NgIf,
  ],
  templateUrl: './other-thread-message-template.component.html',
  styleUrl: './other-thread-message-template.component.scss',
})
export class OtherThreadMessageTemplateComponent implements OnInit, OnDestroy {
  isEmojiContainerVisible: number = 0;
  @Input() message: any = '';
  displayName: string = '';
  photoURL: string = '';
  public userService = inject(UserService);
  public privateChatService = inject(PrivateChatService);
  private subscriptions: Subscription[] = [];
  isMenuOpen: boolean = false;
  private userDataSubscription: Subscription | undefined;

  constructor() {}

  ngOnInit() {
    if (this.message) {
      this.loadUserData(this.message.userId);
    }
  }

  loadUserData(userId: string): void {
    this.userDataSubscription = this.userService.userDataMap$.subscribe((userDataMap) => {
      const userData = userDataMap.get(userId);
      if (userData) {
        this.photoURL = userData.photoURL;
        this.displayName = userData.displayName;
      } else {
        this.photoURL = 'src/assets/img/profile/placeholder-img.webp';
        this.displayName = 'Gast';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userDataSubscription) {
      this.userDataSubscription.unsubscribe(); // Verhindert Speicherlecks
    }
  }
  menuOpened(): void {
    this.isMenuOpen = true;
  }

  menuClosed(): void {
    this.isMenuOpen = false;
    this.isEmojiContainerVisible = 0; // Optional, um den Hover zurückzusetzen
  }

  showEmojiContainer(id: number): void {
    this.isEmojiContainerVisible = id;
  }

  hideEmojiContainer(): void {
    if (!this.isMenuOpen) {
      this.isEmojiContainerVisible = 0;
    }
  }

  getLastReplyTime(messages: any[]): string {
    // Nimm die letzte Nachricht aus dem Array
    const lastMessage = messages[messages.length - 1];

    if (lastMessage && lastMessage.time) {
      // Formatiere die Zeit (Hier anpassen, falls nötig)
      const date = new Date(lastMessage.time);
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // Für 24-Stunden-Format, ändern auf true für 12-Stunden-Format
      };
      return date.toLocaleTimeString([], options) + ' Uhr';
    }

    return 'Keine Antworten'; // Falls keine Nachrichten vorhanden sind
  }
}
