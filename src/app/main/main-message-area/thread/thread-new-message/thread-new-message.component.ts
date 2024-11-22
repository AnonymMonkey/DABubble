import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { ThreadService } from '../../../../shared/services/thread-service/thread.service';
import { ThreadMessage } from '../../../../shared/models/thread-message.model'; // Importiere ThreadMessage
import { ChannelService } from '../../../../shared/services/channel-service/channel.service';
import { collection, getDoc, setDoc } from 'firebase/firestore';
import { PickerComponent, PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { MatMenu, MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { NgClass } from '@angular/common';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { AttachmentPreviewComponent } from '../../../../shared/components/attachment-preview/attachment-preview.component';
import { MentionUserComponent } from '../../../../shared/components/mention-user/mention-user.component';
import { UploadMethodSelectorComponent } from '../../../../shared/components/upload-method-selector/upload-method-selector.component';
import { StorageService } from '../../../../shared/services/storage-service/storage.service';
import { ChannelMessage } from '../../../../shared/models/channel-message.model';

@Component({
  selector: 'app-thread-new-message',
  standalone: true,
  imports: [
    FormsModule,
    MatIcon,
    MatMenuModule,
    PickerModule,
    MatMenu,
    PickerComponent,
    NgClass,
    AttachmentPreviewComponent,
    MentionUserComponent,
    UploadMethodSelectorComponent,
    MatSidenavModule,
  ],
  templateUrl: './thread-new-message.component.html',
  styleUrls: ['./thread-new-message.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ThreadNewMessageComponent implements OnInit {
  newMessageContent: string = '';
  attachmentUrls: string[] = [];
  message?: ChannelMessage | null;
  @ViewChild('threadAttachmentSidenav') threadAttachmentSidenav!: MatSidenav;
  @ViewChild('threadAttachmentSidenav', { read: ElementRef })
  attachmentSidenavElement!: ElementRef;
  currentBorderRadius: string = '30px 30px 30px 30px';

  @ViewChild(MatMenuTrigger) uploadMethodMenuTrigger!: MatMenuTrigger;

  constructor(
    private threadService: ThreadService,
    private firestore: Firestore,
    private channelService: ChannelService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.storageService.onCloseAttachmentPreview().subscribe(() => {
      this.closeAttachmentSidenav();
    });

    this.storageService.onCloseUploadMethodSelector().subscribe(() => {
      this.closeUploadMethodMenu();
    });

    this.threadService.actualMessageSubject.subscribe((message) => {
      this.message = message;
    });
  }

  async sendMessage(): Promise<void> {
    // Überprüfen, ob die Nachricht entweder Text oder Anhänge hat
    if (this.newMessageContent.trim().length > 0 || this.attachmentUrls.length > 0) {
      const currentMessage = this.threadService.actualMessageSubject.value;
      if (!currentMessage) {
        console.error('Es wurde keine aktuelle Nachricht ausgewählt.');
        return;
      }
  
      const channelId = this.channelService.channelId; // channelId zwischenspeichern
      try {
        // Pfad zur Channels-Messages
        const messageDocRef = doc(this.firestore, `channels/${channelId}/messages/${currentMessage.messageId}`);
        const messageDocSnapshot = await getDoc(messageDocRef);
        
        if (!messageDocSnapshot.exists()) {
          console.error('Das Dokument existiert nicht:', messageDocRef.path);
          return;
        }
  
        const timestamp = Date.now();
        const randomId = Math.floor(Math.random() * 1000) + 1; // Zufällige Zahl zwischen 1 und 1000
        const newThreadId = `thread_${timestamp}_${randomId}`;
  
        // Neues Thread-Dokument erstellen
        const newMessage = new ThreadMessage(
          this.newMessageContent.trim() || ' ', // Leerer Text wird durch Leerzeichen ersetzt
          currentMessage.userId,
          newThreadId,
          [], // Leere Reaktionen
          new Date().toISOString(),
          this.attachmentUrls.length > 0 ? this.attachmentUrls : [] // Wenn Anhänge vorhanden sind, füge diese hinzu
        );
  
        this.newMessageContent = ''; // Nachricht zurücksetzen
        const attachmentsToSend = [...this.attachmentUrls];
        this.threadAttachmentSidenav.close();
        this.attachmentUrls = []; // Reset attachment URLs
  
        // Subcollection für den Thread innerhalb der Nachricht erstellen
        const threadCollectionRef = collection(
          this.firestore,
          `channels/${channelId}/messages/${currentMessage.messageId}/thread`
        );
  
        const threadDocRef = doc(threadCollectionRef, newThreadId); // Ein neues Thread-Dokument mit der ID `newThreadId`
        await setDoc(threadDocRef, {
          content: newMessage.content,
          userId: newMessage.userId,
          time: newMessage.time,
          messageId: newMessage.messageId,
          attachmentUrls: attachmentsToSend,
        });
  
        // Optional: Thread-ID in der Nachricht speichern (falls du den Zusammenhang zwischen Nachricht und Threads herstellen möchtest)
        await updateDoc(messageDocRef, {
          [`threadId`]: newThreadId,
        });
      } catch (error) {
        console.error('Fehler beim Speichern der Nachricht in Firestore:', error);
      }
    }
  }
  

  addEmoji(event: any) {
    console.log('Emoji selected:', event);
    const emoji = event.emoji.native || event.emoji;
    this.newMessageContent += emoji;
  }

  insertMention(userName: string): void {
    const mention = `@${userName} `;
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
    this.threadAttachmentSidenav.open();
  }

  closeAttachmentSidenav() {
    this.threadAttachmentSidenav.close();
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
