import { NgFor, NgIf } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
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

@Component({
  selector: 'app-attachment-preview',
  standalone: true,
  imports: [NgIf, MatIcon, NgFor],
  templateUrl: './attachment-preview.component.html',
  styleUrls: ['./attachment-preview.component.scss'],
})
export class AttachmentPreviewComponent implements OnChanges {
  @Input() messageId: string | undefined;
  @Input() actualAttachmentUrls: string[] = []; // Array der unsicheren URLs
  @Input() message: any = ''; // Nachrichtentext
  @Output() attachmentRemoved = new EventEmitter<string>(); // Event für entferntes Attachment
  googleDocsViewerUrl: SafeResourceUrl = ''; // Google Docs Viewer für Word-Dokumente
  private storage = getStorage(); // Firebase Storage-Referenz
  private channelId: string | undefined;
  private privateChatId: string | undefined;

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

  ngOnChanges() {
    this.prepareGoogleDocsViewerUrl();
  }

  // Ermittelt den Dateityp und setzt ggf. Google Docs Viewer URL
  private prepareGoogleDocsViewerUrl() {
    if (this.actualAttachmentUrls.length > 0) {
      const latestUrl =
        this.actualAttachmentUrls[this.actualAttachmentUrls.length - 1];
      const fileType = this.getFileType(latestUrl);

      if (fileType === 'doc') {
        const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
          latestUrl
        )}&embedded=true`;
        this.googleDocsViewerUrl =
          this.sanitizer.bypassSecurityTrustResourceUrl(viewerUrl);
      } else {
        this.googleDocsViewerUrl = '';
      }
    }
  }

  // Öffnet den Anhang in einem neuen Tab
  openAttachment(fileUrl: string, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    window.open(fileUrl, '_blank');
  }

  // Ermittelt den Dateityp anhand der URL
  public getFileType(url: string): string {
    const filename = decodeURIComponent(
      url.split('/').pop()?.split('?')[0] || ''
    );
    const extension = filename.split('.').pop()?.toLowerCase();

    if (!extension) return 'unknown';
    if (['pdf'].includes(extension)) return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension))
      return 'image';
    if (['doc', 'docx'].includes(extension)) return 'doc';
    if (['txt', 'csv'].includes(extension)) return 'text';
    if (['xlsx', 'xls'].includes(extension)) return 'excel';
    return 'unknown';
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
    if (this.message === '')
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
      console.log(`Prüfe Dokument: ${docPath}`);

      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        const data = docSnapshot.data();

        // Prüfen, ob 'messageId' definiert ist, bevor du es als Schlüssel verwendest
        if (this.messageId) {
          // Hier gehen wir direkt von einer ChannelMessage aus und nicht von einem Thread
          const attachmentUrls = data['attachmentUrls'] || [];

          // Entferne die gewünschte URL
          const updatedUrls = attachmentUrls.filter(
            (url: string) => url !== fileUrl
          );

          if (updatedUrls.length !== attachmentUrls.length) {
            await updateDoc(docRef, {
              attachmentUrls: updatedUrls,
            });
            console.log('Dokument erfolgreich aktualisiert:', updatedUrls);
          } else {
            console.log('Keine Übereinstimmung für die URL gefunden.');
          }
        } else {
          console.log('messageId ist nicht definiert');
        }
      } else {
        console.log('Dokument existiert nicht.');
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
      this.message?.content === ' ' && this.message?.attachmentUrls?.length === 1;  
    if (isMessageEmpty) {
      try {
        // Wenn sowohl channelId und messageId vorhanden sind, löschen wir die Nachricht im Thread
        if (this.channelId && this.messageId) {
          await this.messageService.deleteMessageInThread(
            this.channelId,
            this.threadService.actualMessageSubject.value?.messageId!,
            this.messageId!
          );
        }
        // Wenn nur channelId und messageId nicht vorhanden sind, löschen wir die Nachricht im Channel
        else if (this.channelId && !this.messageId) {
          await this.messageService.deleteChannelMessage(
            this.channelId,
            this.message.messageId!
          );
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
}
