import { NgFor, NgIf } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { deleteObject, getStorage, ref } from 'firebase/storage';
import { StorageService } from '../../services/storage-service/storage.service';
import { Firestore } from '@angular/fire/firestore';
import { doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import {
  collection,
  deleteDoc,
  deleteField,
  getDocs,
} from 'firebase/firestore';
import { UserService } from '../../services/user-service/user.service';
import { MessageService } from '../../services/message-service/message.service';
import { ThreadService } from '../../services/thread-service/thread.service';
import { FilePreviewComponent } from '../file-preview/file-preview.component';

@Component({
  selector: 'app-attachment-preview',
  standalone: true,
  imports: [NgIf, MatIcon, NgFor, FilePreviewComponent],
  templateUrl: './attachment-preview.component.html',
  styleUrls: ['./attachment-preview.component.scss'],
})
export class AttachmentPreviewComponent {
  @Input() messageId: string | undefined;
  @Input() actualAttachmentUrls: string[] = []; // Array der unsicheren URLs
  @Input() message: any | undefined; // Nachrichtentext
  @Output() attachmentRemoved = new EventEmitter<string>(); // Event für entferntes Attachment
  googleDocsViewerUrl: SafeResourceUrl = ''; // Google Docs Viewer für Word-Dokumente
  private storage = getStorage(); // Firebase Storage-Referenz
  private channelId: string | undefined;
  private privateChatId: string | undefined;
  public actualAttachmentUrl: string = '';
  public currentAttachmentIndex: number = 0;

  constructor(
    public sanitizer: DomSanitizer,
    private storageService: StorageService,
    private firestore: Firestore,
    private route: ActivatedRoute,
    public userService: UserService,
    private messageService: MessageService,
    private threadService: ThreadService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.privateChatId = params.get('privateChatId') || undefined;
      this.channelId = params.get('channelId') || undefined;
    });
  }

  ngOnChanges(): void {
    if (!this.message && this.actualAttachmentUrls.length > 0) {
      this.currentAttachmentIndex = this.actualAttachmentUrls.length - 1; // Setze auf den höchsten Index
      this.actualAttachmentUrl =
        this.actualAttachmentUrls[this.currentAttachmentIndex];
    }
  }

  // Öffnet den Anhang in einem neuen Tab
  openAttachment(fileUrl: string, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    window.open(fileUrl, '_blank');
  }

  // Extrahiert den Dateipfad aus der URL
  private extractFilePathFromUrl(fileUrl: string): string {
    const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
    const decodedUrl = decodeURIComponent(fileUrl);

    const pathStartIndex = decodedUrl.indexOf('/o/') + 3;
    const pathEndIndex = decodedUrl.indexOf('?');
    return decodedUrl.substring(pathStartIndex, pathEndIndex);
  }

  // Lösch-Button-Klick (stoppt Event-Bubbling)
  onDeleteClick(attachmentUrl: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.deleteAttachment(attachmentUrl);
    if (this.message === undefined && this.actualAttachmentUrls.length === 1)
      this.storageService.triggerCloseAttachmentPreview();
  }

  // Löscht einen Anhang
  async deleteAttachment(fileUrl: string) {
    const filePath = this.extractFilePathFromUrl(fileUrl);

    // Löschen aus Firebase Storage
    await this.deleteFile(filePath);

    // Löschen aus Firestore
    await this.deleteAttachmentFromFirestore(fileUrl);

    // Entferne die URL aus dem lokalen Array und emitte das Event
    this.actualAttachmentUrls = this.actualAttachmentUrls.filter(
      (url) => !url.includes(filePath)
    );
    this.attachmentRemoved.emit(fileUrl);

    // Nach dem Löschen eines Anhanges prüfen, ob die gesamte Nachricht gelöscht werden kann
    await this.checkAndDeleteMessage();
  }

  private async deleteFile(filePath: string) {
    const fileRef = ref(this.storage, filePath);

    try {
      await deleteObject(fileRef);
      this.actualAttachmentUrls = this.actualAttachmentUrls.filter(
        (url) => !url.includes(filePath)
      );
    } catch (error) {
      console.error('Fehler beim Löschen der Datei:', error);
    }
  }

  // Entfernt die URL aus einem Benutzer-Dokument im PrivateChat
  private async removeAttachmentFromUserDoc(
    userId: string,
    privateChatId: string,
    messageId: string,
    fileUrl: string
  ) {
    try {
      const userDocRef = doc(this.firestore, `users/${userId}`);
      const path = `privateChat.${privateChatId}.messages.${messageId}.attachmentUrls`;
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const data = userDocSnapshot.data();
        const attachmentUrls =
          data?.['privateChat'][privateChatId]?.messages?.[messageId]
            ?.attachmentUrls || [];

        // Entferne die gewünschte URL
        const updatedUrls = attachmentUrls.filter(
          (url: string) => url !== fileUrl
        );

        // Wenn die URL gefunden und entfernt wurde, Dokument aktualisieren
        if (updatedUrls.length !== attachmentUrls.length) {
          await updateDoc(userDocRef, {
            [`privateChat.${privateChatId}.messages.${messageId}.attachmentUrls`]:
              updatedUrls,
          });
        } else {
          console.log(
            'Keine Übereinstimmung für die URL gefunden im Benutzer-Dokument.'
          );
        }
      } else {
        console.log('Benutzerdokument existiert nicht.');
      }
    } catch (error) {
      console.error(
        `Fehler beim Entfernen der Anhangs-URL aus Benutzer-Dokument (${userId}):`,
        error
      );
    }
  }

  private async deleteAttachmentFromFirestore(fileUrl: string) {
    if (!this.message) return;

    const messageId = this.message.messageId;
    let docPath: string;

    if (this.channelId) {
      // Falls eine messageId vorhanden ist, greifen wir auf die 'thread' Unter-Sammlung zu
      if (this.messageId) {
        docPath = `channels/${this.channelId}/messages/${this.threadService.actualMessageSubject.value?.messageId}/thread/${messageId}`;
      } else {
        // Andernfalls greifen wir direkt auf die 'messages' Sammlung zu
        docPath = `channels/${this.channelId}/messages/${messageId}`;
      }

      // Entferne die Anhang-URL aus Firestore
      await this.removeAttachmentFromFirestore(docPath, fileUrl);

      await this.checkAndDeleteMessage();
    } else if (this.privateChatId) {
      // PrivateChat-Kontext
      const userIds = this.privateChatId.split('_');
      for (const userId of userIds) {
        await this.removeAttachmentFromUserDoc(
          userId,
          this.privateChatId,
          messageId,
          fileUrl
        );
      }
      await this.checkAndDeleteMessage();
    }
  }

  private async removeAttachmentFromFirestore(
    docPath: string,
    fileUrl: string
  ) {
    try {
      const docRef = doc(this.firestore, docPath);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        const data = docSnapshot.data();

        const attachmentUrls = data['attachmentUrls'] || [];

        // Entferne die gewünschte URL
        const updatedUrls = attachmentUrls.filter(
          (url: string) => url !== fileUrl
        );

        if (updatedUrls.length !== attachmentUrls.length) {
          await updateDoc(docRef, {
            attachmentUrls: updatedUrls,
          });
        } else {
          console.log('Keine Übereinstimmung für die URL gefunden.');
        }
      }
    } catch (error) {
      console.error(
        `Fehler beim Entfernen der Anhangs-URL aus Firestore (${docPath}):`,
        error
      );
    }
  }

  async checkAndDeleteMessage(): Promise<void> {
    // Wenn keine channelId und privateChatId vorhanden sind, abbrechen
    if (!this.channelId && !this.privateChatId) return;
    const isMessageEmpty =
      this.message?.content === ' ' ||
      (this.message?.content === '' &&
        this.message?.attachmentUrls?.length <= 1);
    if (isMessageEmpty) {
      try {
        // Wenn sowohl channelId und messageId vorhanden sind, löschen wir die Nachricht im Thread
        if (this.channelId && this.messageId) {
          const path = `channels/${this.channelId}/messages/${this.threadService.actualMessageSubject.value?.messageId}/thread/${this.messageId}`;
          await this.messageService.deleteMessageInThreadOrChannel(path);
        }
        // Wenn nur channelId und messageId nicht vorhanden sind, löschen wir die Nachricht im Channel
        else if (this.channelId && !this.messageId) {
          const path = `channels/${this.channelId}/messages/${this.message.messageId}`;
          await this.messageService.deleteMessageInThreadOrChannel(path);
        }
        // Wenn nur privateChatId vorhanden ist, löschen wir die Nachricht im Private Chat
        else if (this.privateChatId) {
          await this.messageService.deleteMessage(
            this.privateChatId,
            this.message.messageId
          );
        }
      } catch (error) {
        console.error('Fehler beim Löschen der Nachricht:', error);
      }
    }
  }

  canDelete(message: any): boolean {
    return message?.userId === this.userService.userId || !message;
  }

  changeAttachment(direction: number): void {
    // Neuen Index berechnen
    let newIndex = this.currentAttachmentIndex + direction;

    // Zirkuläre Navigation: Springe vom Ende zum Anfang und umgekehrt
    if (newIndex < 0) {
      newIndex = this.actualAttachmentUrls.length - 1; // Gehe zum letzten Element
    } else if (newIndex >= this.actualAttachmentUrls.length) {
      newIndex = 0; // Gehe zum ersten Element
    }

    // Index und URL aktualisieren
    this.currentAttachmentIndex = newIndex;
    this.actualAttachmentUrl =
      this.actualAttachmentUrls[this.currentAttachmentIndex];
  }
}
