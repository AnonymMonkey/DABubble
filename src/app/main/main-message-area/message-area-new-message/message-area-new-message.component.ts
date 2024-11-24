import {
  Component,
  OnInit,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { ChannelMessage } from '../../../shared/models/channel-message.model';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import {
  Firestore,
  FirestoreDataConverter,
  DocumentData,
  DocumentSnapshot,
} from '@angular/fire/firestore';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserService } from '../../../shared/services/user-service/user.service';
import { ActivatedRoute } from '@angular/router';
import { ChannelService } from '../../../shared/services/channel-service/channel.service';
import { Channel } from '../../../shared/models/channel.model';
import { ThreadMessage } from '../../../shared/models/thread-message.model';
import { PickerComponent, PickerModule } from '@ctrl/ngx-emoji-mart';
import { MatMenu, MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MentionUserComponent } from '../../../shared/components/mention-user/mention-user.component';
import { UploadMethodSelectorComponent } from '../../../shared/components/upload-method-selector/upload-method-selector.component';
import { NgClass, NgIf } from '@angular/common';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { AttachmentPreviewComponent } from '../../../shared/components/attachment-preview/attachment-preview.component';
import { StorageService } from '../../../shared/services/storage-service/storage.service';

const channelMessageConverter: FirestoreDataConverter<ChannelMessage> = {
  toFirestore(message: ChannelMessage): DocumentData {
    return {
      content: message.content,
      messageId: message.messageId,
      reactions: message.reactions,
      time: message.time,
      userId: message.userId,
      attachmentUrls: message.attachmentUrls,
    };
  },
  fromFirestore(snapshot: DocumentSnapshot<DocumentData>): ChannelMessage {
    const data: any = snapshot.data() || {};
    return new ChannelMessage(data.content, data.messageId, data.userId);
  },
};

@Component({
  selector: 'app-message-area-new-message',
  standalone: true,
  imports: [
    MatIconModule,
    MatMenu,
    MatMenuModule,
    FormsModule,
    PickerModule,
    PickerComponent,
    MentionUserComponent,
    UploadMethodSelectorComponent,
    NgIf,
    MatSidenavModule,
    AttachmentPreviewComponent,
    NgClass,
  ],
  templateUrl: './message-area-new-message.component.html',
  styleUrls: ['./message-area-new-message.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MessageAreaNewMessageComponent implements OnInit {
  newMessageContent = '';
  channelId?: string;
  privateChatId?: string;
  userId?: string;
  userName?: string;
  photoURL?: string;
  channel: Channel | undefined;
  currentBorderRadius: string = '30px 30px 30px 30px';
  attachmentUrls: string[] = [];

  @ViewChild('attachmentSidenav') attachmentSidenav!: MatSidenav;
  @ViewChild('attachmentSidenav', { read: ElementRef })
  attachmentSidenavElement!: ElementRef;

  @ViewChild('editableMessage', { static: false }) editableMessage!: ElementRef;

  @ViewChild(MatMenuTrigger) uploadMethodMenuTrigger!: MatMenuTrigger;

  constructor(
    private firestore: Firestore,
    private userService: UserService,
    private route: ActivatedRoute,
    private channelService: ChannelService,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      this.userId = this.userService.userId;
      this.privateChatId = params.get('privateChatId') || undefined;
      this.channelId = params.get('channelId') || undefined;

      if (this.channelId) {
        this.channelService
          .getChannelById(this.channelId)
          .subscribe((channel) => {
            if (channel) {
              this.channel = channel;
            }
          });
      }

      this.getUserData();
    });

    this.storageService.onCloseAttachmentPreview().subscribe(() => {
      this.closeAttachmentSidenav();
    });

    this.storageService.onCloseUploadMethodSelector().subscribe(() => {
      this.closeUploadMethodMenu();
    });
  }

  onKeyDown(event: KeyboardEvent) {
    const key = event.key;
    event.preventDefault();

    if (key.length === 1) {
      this.newMessageContent += key;
    }

    if (event.key === 'Backspace' || event.key === 'Delete') {
      this.newMessageContent = this.newMessageContent.slice(0, -1);
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault(); // Verhindert das Standardverhalten des Browsers (Text direkt einfügen)

    console.log('Paste Event ausgelöst'); // Überprüfung, ob das Event ausgelöst wird

    // Versuche, den Text aus der Zwischenablage zu bekommen
    const pastedText = event.clipboardData?.getData('text');
    console.log('Pasted Text:', pastedText); // Debugging des eingefügten Textes

    if (pastedText) {
      // Hole das contenteditable-Element
      const editableDiv = event.target as HTMLElement;

      // Füge den eingefügten Text zum neuen Inhalt hinzu
      const currentContent = editableDiv.innerHTML;
      const cursorPosition = this.getCursorPosition(editableDiv); // Position des Cursors

      // Text vor und nach der Cursorposition
      const textBefore = currentContent.substring(0, cursorPosition);
      const textAfter = currentContent.substring(cursorPosition);

      // Erstelle den neuen Inhalt mit dem eingefügten Text
      const newContent = textBefore + pastedText + textAfter;

      // Aktualisiere den Inhalt des divs
      editableDiv.innerHTML = newContent;

      // Setze die neue Nachricht
      this.newMessageContent = newContent;
    }
  }

  getCursorPosition(editableDiv: HTMLElement): number {
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);

    if (range) {
      const preCursor = editableDiv.innerHTML.substring(0, range.startOffset);
      return preCursor.length;
    }

    return 0; // Default: Anfang des Textes
  }

  onDragOver(event: DragEvent) {
    event.preventDefault(); // Standardaktion verhindern, damit der Drop funktioniert
  }

  // Für das Ablegen des Textes
  onDrop(event: DragEvent) {
    event.preventDefault();

    // Zugriff auf die Daten, die während des Ziehens abgelegt wurden
    const text = event.dataTransfer?.getData('text/plain');

    if (text) {
      // Füge den Text zum Nachrichteninhalt hinzu
      this.newMessageContent += text;
    }
  }

  getUserData() {
    if (!this.userId) return;

    this.userService.getUserDataByUID(this.userId).subscribe({
      next: (userData) => {
        this.userName = userData?.displayName;
        this.photoURL = userData?.photoURL;
      },
      error: (error) =>
        console.error('Fehler beim Abrufen der Benutzerdaten:', error),
    });
  }

  private static generatePrivateMessageId(): string {
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.]/g, '')
      .slice(0, 14);
    const randomNumber = Math.floor(Math.random() * 1000) + 1;
    return `msg_${timestamp}_${randomNumber}`;
  }

  async sendMessage() {
    if (!this.newMessageContent && this.attachmentUrls.length === 0) return;

    // Nachricht sofort auslesen und Felder leeren
    const messageContent = this.newMessageContent;
    this.editableMessage.nativeElement.innerHTML = '';
    this.newMessageContent = '';

    // Generiere Message-ID
    const messageId = this.privateChatId
      ? MessageAreaNewMessageComponent.generatePrivateMessageId()
      : `msg_${Date.now()}`;

    const newMessage = new ChannelMessage(
      messageContent,
      this.userId || '',
      messageId,
      new Date().toISOString(), // Zeit als ISO-String
      this.attachmentUrls // attachmentUrl hinzufügen
    );

    const attachmentsToSend = [...this.attachmentUrls];
    this.attachmentSidenav.close();
    this.attachmentUrls = []; // Reset attachment URLs

    // Nachricht je nach Kontext (privat oder channel) senden
    if (this.privateChatId) {
      await this.sendPrivateChatMessage(newMessage, attachmentsToSend);
    } else if (this.channelId) {
      this.channel?.addMessage(messageId, newMessage);
      await this.sendChannelMessage(newMessage, attachmentsToSend);
    } else {
      console.error('Weder privateChatId noch channelId ist definiert.');
    }
  }

  private async sendChannelMessage(
    newMessage: ChannelMessage,
    attachments: string[]
  ) {
    // Stelle sicher, dass die Anhänge in der Nachricht enthalten sind
    newMessage.attachmentUrls = attachments;

    const messagesRef = collection(
      this.firestore,
      `channels/${this.channelId}/messages`
    );
    try {
      const newMessageDocRef = doc(messagesRef, newMessage.messageId);
      // Speichern der Nachricht zusammen mit den Anhängen in Firestore
      await setDoc(
        newMessageDocRef,
        channelMessageConverter.toFirestore(newMessage)
      );
      this.channel?.addMessage(newMessage.messageId, newMessage);
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht im Channel:', error);
    }
  }

  private async sendPrivateChatMessage(
    newMessage: ThreadMessage,
    attachments: string[]
  ) {
    const [userId1, userId2] = this.privateChatId!.split('_');
    const isSelfMessage = this.userId === userId1;

    // Aktuelles Benutzerdokument abrufen
    const userDocRef = doc(this.firestore, `users/${this.userId}`);
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
      console.error('Benutzerdokument existiert nicht.');
      return;
    }

    // Generiere eine neue Nachricht ID mit Timestamp und random number
    const newMessageId =
      MessageAreaNewMessageComponent.generatePrivateMessageId();

    // Nachricht zum messages-Objekt des spezifischen Chats hinzufügen
    await updateDoc(userDocRef, {
      [`privateChat.${this.privateChatId}.messages.${newMessageId}`]: {
        content: newMessage.content,
        messageId: newMessageId,
        reactions: newMessage.reactions,
        time: newMessage.time,
        userId: this.userId,
        attachmentUrls: attachments,
      },
    });

    // Wenn die Nachricht nicht vom aktuellen Benutzer stammt, speichere sie auch im anderen Benutzer-Dokument
    const otherUserId = isSelfMessage ? userId2 : userId1; // Bestimme die ID des anderen Benutzers
    const otherUserDocRef = doc(this.firestore, `users/${otherUserId}`);

    await updateDoc(otherUserDocRef, {
      [`privateChat.${this.privateChatId}.messages.${newMessageId}`]: {
        content: newMessage.content,
        messageId: newMessageId,
        reactions: newMessage.reactions,
        time: newMessage.time,
        userId: this.userId,
        attachmentUrls: attachments,
      },
    });
  }

  addEmoji(event: any) {
    const emoji = event.emoji.native || event.emoji;
    this.newMessageContent += emoji;
  }

  insertMention(userName: string): void {
    const mention = ` <span class="mention">@${userName}</span> `;
    this.newMessageContent += mention;
  }

  toggleBorder(menuType: string) {
    switch (menuType) {
      case 'upload':
        this.currentBorderRadius = '30px 30px 30px 30px';
        break;
      case 'emoji':
        this.currentBorderRadius = '30px 30px 30px 30px';
        break;
      case 'mention':
        this.currentBorderRadius = '30px 30px 30px 0px';
        break;
      default:
        this.currentBorderRadius = '30px 30px 30px 30px';
    }
    document.documentElement.style.setProperty(
      '--border-radius',
      this.currentBorderRadius
    );
  }

  openAttachmentSidenav() {
    this.attachmentSidenav.open();
  }

  closeAttachmentSidenav() {
    if (this.attachmentUrls.length > 1) return;
    this.attachmentSidenav.close();
  }

  closeUploadMethodMenu() {
    this.uploadMethodMenuTrigger.closeMenu();
  }
  addDownloadLink(url: string) {
    this.attachmentUrls = [...this.attachmentUrls, url];
  }

  removeAttachment(index: number) {
    this.attachmentUrls.splice(index, 1); // URL aus dem Array entfernen
  }

  onAttachmentRemoved(removedUrl: string) {
    this.attachmentUrls = this.attachmentUrls.filter(
      (url) => url !== removedUrl
    );
  }
}
