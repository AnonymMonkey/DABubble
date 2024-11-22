import { Component, Input, OnInit } from '@angular/core';
import { MainMessageAreaComponent } from '../../main-message-area.component';
import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChannelService } from '../../../../shared/services/channel-service/channel.service';
import { ThreadService } from '../../../../shared/services/thread-service/thread.service';
import { MatIcon } from '@angular/material/icon';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { MatMenuModule } from '@angular/material/menu';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { MessageService } from '../../../../shared/services/message-service/message.service';
import { MessageReactionsComponent } from '../../../../shared/components/message-reactions/message-reactions.component';
import { EmojiPickerComponent } from '../../../../shared/components/emoji-picker/emoji-picker.component';
import { AttachmentPreviewComponent } from '../../../../shared/components/attachment-preview/attachment-preview.component';
import { UserService } from '../../../../shared/services/user-service/user.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-other-message-template',
  standalone: true,
  imports: [
    NgClass,
    DatePipe,
    NgIf,
    MatIcon,
    PickerModule,
    EmojiComponent,
    MatMenuModule,
    MessageReactionsComponent,
    EmojiPickerComponent,
    AttachmentPreviewComponent,
    NgFor,
    AsyncPipe,
    NgClass,
  ],
  templateUrl: './other-message-template.component.html',
  styleUrl: './other-message-template.component.scss',
})
export class OtherMessageTemplateComponent implements OnInit {
  isEmojiContainerVisible: number = 0;
  emojis: string = '';
  @Input() message: any = '';
  isMenuOpen: boolean = false;
  currentBorderRadius = '30px 30px 30px 30px';
  public threadMessages$: Observable<any[]> | undefined; 
  public loading: boolean = false; 
  photoURL: string = '';
  displayName: string = '';

  constructor(
    public mainMessageArea: MainMessageAreaComponent,
    public channelService: ChannelService,
    public threadService: ThreadService,
    private firestore: Firestore,
    private messageService: MessageService,
    public userService: UserService
  ) {}

  ngOnInit(): void {
    if (this.channelService.channelId && this.message?.messageId) {
      this.loadThreadMessages(
        this.channelService.channelId,
        this.message.messageId
      );
    }
    if (this.message) {
      this.userService
        .getUserDataByUID(this.message.userId)
        .subscribe((data) => {
          this.photoURL = data.photoURL;
          this.displayName = data.displayName;
        });
    }
  }

  // Methode zum Abrufen der Thread-Nachrichten aus der Firestore-Unterkollektion
  loadThreadMessages(channelId: string, messageId: string): void {
    const threadRef = collection(
      this.firestore,
      `channels/${channelId}/messages/${messageId}/thread`
    );
    this.threadMessages$ = collectionData(threadRef, { idField: 'id' });
  }

  showEmojiContainer(id: number): void {
    this.isEmojiContainerVisible = id;
  }

  hideEmojiContainer(): void {
    if (!this.isMenuOpen) {
      this.isEmojiContainerVisible = 0;
    }
  }

  menuOpened(): void {
    this.isMenuOpen = true;
  }

  menuClosed(): void {
    this.isMenuOpen = false;
    this.isEmojiContainerVisible = 0; // Optional, um den Hover zurückzusetzen
  }

  getLastReplyTime(thread: { [key: string]: any }): string {
    // Extrahiere die Nachrichten aus dem Objekt (Werte des Objekts)
    const messages = Object.values(thread);

    // Nimm die letzte Nachricht aus dem Array der Nachrichten
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

  addReaction(messageId: string, emoji: any): void {
    this.messageService.setActualMessage(this.message);
    this.messageService.addOrChangeReaction(messageId, emoji);
  }

  toggleBorder(menuType: string) {
    switch (menuType) {
      case 'emoji':
        this.currentBorderRadius = '30px 30px 30px 30px';
        break;
      default:
        this.currentBorderRadius = '0px 30px 30px 30px';
    }
    document.documentElement.style.setProperty(
      '--border-radius',
      this.currentBorderRadius
    );
  }
}
