import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { deleteObject, getStorage, ref } from 'firebase/storage';
import { StorageService } from '../../services/storage-service/storage.service';
import { Firestore } from '@angular/fire/firestore';
import { doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user-service/user.service';
import { MessageService } from '../../services/message-service/message.service';
import { ThreadService } from '../../services/thread-service/thread.service';
import { FilePreviewComponent } from '../file-preview/file-preview.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-attachment-preview',
  standalone: true,
  imports: [NgIf, MatIcon, NgFor, FilePreviewComponent],
  templateUrl: './attachment-preview.component.html',
  styleUrls: ['./attachment-preview.component.scss'],
})
export class AttachmentPreviewComponent {
  @Input() messageId: string | undefined;
  @Input() actualAttachmentUrls: string[] = [];
  @Input() message: any | undefined;
  @Output() attachmentRemoved = new EventEmitter<string>();
  googleDocsViewerUrl: SafeResourceUrl = '';
  private storage = getStorage();
  private channelId: string | undefined;
  private privateChatId: string | undefined;
  public actualAttachmentUrl: string = '';
  public currentAttachmentIndex: number = 0;
  private routeSubscription: Subscription | undefined;

  constructor(
    public sanitizer: DomSanitizer,
    private storageService: StorageService,
    private firestore: Firestore,
    private route: ActivatedRoute,
    public userService: UserService,
    private messageService: MessageService,
    private threadService: ThreadService
  ) {}

  /**
   * Initialize the component and subscribe to route parameters.
   */
  ngOnInit() {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      this.privateChatId = params.get('privateChatId') || undefined;
      this.channelId = params.get('channelId') || undefined;
    });
  }

  /**
   * Update the current attachment index and URL when the component's inputs change.
   */
  ngOnChanges(): void {
    if (!this.message && this.actualAttachmentUrls.length > 0) {
      this.currentAttachmentIndex = this.actualAttachmentUrls.length - 1;
      this.actualAttachmentUrl =
        this.actualAttachmentUrls[this.currentAttachmentIndex];
    }
  }

  /**
   * Unsubscribe from route parameters when the component is destroyed.
   */
  ngOnDestroy(): void {
    if (this.routeSubscription) this.routeSubscription.unsubscribe();
  }

  /**
   * Open the attachment in a new tab.
   * @param fileUrl - The URL of the attachment.
   * @param event - The click event.
   */
  openAttachment(fileUrl: string, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    window.open(fileUrl, '_blank');
  }

  /**
   * Extract the file path from the given URL.
   * @param fileUrl - The URL of the attachment.
   * @returns The file path.
   */
  private extractFilePathFromUrl(fileUrl: string): string {
    const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
    const decodedUrl = decodeURIComponent(fileUrl);

    const pathStartIndex = decodedUrl.indexOf('/o/') + 3;
    const pathEndIndex = decodedUrl.indexOf('?');
    return decodedUrl.substring(pathStartIndex, pathEndIndex);
  }

  /**
   * Delete the attachment and remove it from Firestore.
   * @param attachmentUrl - The URL of the attachment to delete.
   * @param event - The click event.
   */
  onDeleteClick(attachmentUrl: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.deleteAttachment(attachmentUrl);
    if (this.message === undefined && this.actualAttachmentUrls.length === 1)
      this.storageService.triggerCloseAttachmentPreview();
  }

  /**
   * Delete the attachment and remove it from Firestore.
   * @param fileUrl - The URL of the attachment to delete.
   */
  async deleteAttachment(fileUrl: string) {
    const filePath = this.extractFilePathFromUrl(fileUrl);
    await this.deleteFile(filePath);
    await this.deleteAttachmentFromFirestore(fileUrl);
    this.actualAttachmentUrls = this.actualAttachmentUrls.filter(
      (url) => !url.includes(filePath)
    );
    this.attachmentRemoved.emit(fileUrl);
    await this.checkAndDeleteMessage();
  }

  /**
   * Delete the file from Firebase Storage.
   * @param filePath - The path of the file to delete.
   */
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

  /**
 * Removes an attachment URL from the user document in Firestore.
 * @param userId - The ID of the user whose document will be updated.
 * @param privateChatId - The ID of the private chat.
 * @param messageId - The ID of the message.
 * @param fileUrl - The URL of the attachment to be removed.
 */
private async removeAttachmentFromUserDoc(userId: string, privateChatId: string, messageId: string, fileUrl: string) {
  try {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    const userDocSnapshot = await getDoc(userDocRef);
    if (userDocSnapshot.exists()) {
      const updatedUrls = this.getUpdatedAttachmentUrls(
        userDocSnapshot.data(), privateChatId, messageId, fileUrl
      );
      if (updatedUrls) {
        await this.updateUserDocument(userDocRef, privateChatId, messageId, updatedUrls);
      }
    }
  } catch (error) {
    console.error(`Error removing attachment URL from user document (${userId}):`, error);
  }
}

/**
 * Extracts and updates the attachment URLs from the user document data.
 * @param data - The Firestore document data.
 * @param privateChatId - The ID of the private chat.
 * @param messageId - The ID of the message.
 * @param fileUrl - The URL of the attachment to be removed.
 * @returns The updated list of attachment URLs or null if no changes are needed.
 */
private getUpdatedAttachmentUrls(
  data: any,
  privateChatId: string,
  messageId: string,
  fileUrl: string
): string[] | null {
  const attachmentUrls =
    data?.['privateChat'][privateChatId]?.messages?.[messageId]?.attachmentUrls || [];
  const updatedUrls = attachmentUrls.filter((url: string) => url !== fileUrl);
  return updatedUrls.length !== attachmentUrls.length ? updatedUrls : null;
}

/**
 * Updates the user document with the new list of attachment URLs.
 * @param userDocRef - The Firestore document reference.
 * @param privateChatId - The ID of the private chat.
 * @param messageId - The ID of the message.
 * @param updatedUrls - The updated list of attachment URLs.
 */
private async updateUserDocument(
  userDocRef: any,
  privateChatId: string,
  messageId: string,
  updatedUrls: string[]
): Promise<void> {
  const updatePath = `privateChat.${privateChatId}.messages.${messageId}.attachmentUrls`;
  await updateDoc(userDocRef, { [updatePath]: updatedUrls });
}


/**
 * Deletes an attachment from Firestore based on the given file URL.
 * Handles both channel messages and private chat messages.
 * @param fileUrl - The URL of the attachment to be deleted.
 */
private async deleteAttachmentFromFirestore(fileUrl: string) {
  if (!this.message) return;
  const messageId = this.message.messageId;
  if (this.channelId) {
    const docPath = this.getChannelDocPath(messageId);
    await this.removeAttachmentFromFirestore(docPath, fileUrl);
  } else if (this.privateChatId) {
    await this.removePrivateChatAttachments(fileUrl, messageId);
  }
  await this.checkAndDeleteMessage();
}

/**
 * Constructs the Firestore document path for a channel message.
 * @param messageId - The ID of the message.
 * @returns The constructed Firestore document path.
 */
private getChannelDocPath(messageId: string): string {
  if (this.messageId) {
    return `channels/${this.channelId}/messages/${this.threadService.actualMessageSubject.value?.messageId}/thread/${messageId}`;
  }
  return `channels/${this.channelId}/messages/${messageId}`;
}

/**
 * Removes attachment URLs from the user documents involved in a private chat.
 * @param fileUrl - The URL of the attachment to be removed.
 * @param messageId - The ID of the message.
 */
private async removePrivateChatAttachments(fileUrl: string, messageId: string): Promise<void> {
  const userIds = this.privateChatId!.split('_');
  for (const userId of userIds) {
    await this.removeAttachmentFromUserDoc(userId, this.privateChatId!, messageId, fileUrl);
  }
}


/**
 * Removes an attachment URL from a Firestore document.
 * @param docPath - The Firestore document path.
 * @param fileUrl - The URL of the attachment to be removed.
 */
private async removeAttachmentFromFirestore(docPath: string, fileUrl: string): Promise<void> {
  try {
    const docRef = doc(this.firestore, docPath);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const attachmentUrls = this.extractAttachmentUrls(docSnapshot.data());
      const updatedUrls = this.filterAttachmentUrls(attachmentUrls, fileUrl);

      await this.updateAttachmentUrlsIfNeeded(docRef, attachmentUrls, updatedUrls);
    }
  } catch (error) {
    console.error(`Fehler beim Entfernen der Anhangs-URL aus Firestore (${docPath}):`, error);
  }
}

/**
 * Extracts attachment URLs from a Firestore document data.
 * @param data - The data of the Firestore document.
 * @returns An array of attachment URLs.
 */
private extractAttachmentUrls(data: any): string[] {
  return data?.['attachmentUrls'] || [];
}

/**
 * Filters out the specified file URL from the list of attachment URLs.
 * @param attachmentUrls - The list of existing attachment URLs.
 * @param fileUrl - The URL to be removed.
 * @returns An updated list of attachment URLs.
 */
private filterAttachmentUrls(attachmentUrls: string[], fileUrl: string): string[] {
  return attachmentUrls.filter((url: string) => url !== fileUrl);
}

/**
 * Updates the attachment URLs in the Firestore document if changes are needed.
 * @param docRef - The Firestore document reference.
 * @param originalUrls - The original list of attachment URLs.
 * @param updatedUrls - The updated list of attachment URLs.
 */
private async updateAttachmentUrlsIfNeeded(
  docRef: any,
  originalUrls: string[],
  updatedUrls: string[]
): Promise<void> {
  if (updatedUrls.length !== originalUrls.length) {
    await updateDoc(docRef, { attachmentUrls: updatedUrls });
  } else {
    console.log('Keine Übereinstimmung für die URL gefunden.');
  }
}

/**
 * Checks if a message is empty and deletes it if necessary.
 */
async checkAndDeleteMessage(): Promise<void> {
  if (!this.channelId && !this.privateChatId) return;

  const isMessageEmpty = this.isMessageEmpty();
  if (!isMessageEmpty) return;

  try {
    if (this.channelId) {
      await this.handleChannelMessageDeletion();
    } else if (this.privateChatId) {
      await this.handlePrivateChatMessageDeletion();
    }
  } catch (error) {
    console.error('Fehler beim Löschen der Nachricht:', error);
  }
}

/**
 * Determines if the message is empty based on its content and attachment URLs.
 * @returns A boolean indicating whether the message is empty.
 */
private isMessageEmpty(): boolean {
  return (
    this.message?.content === ' ' ||
    (this.message?.content === '' && this.message?.attachmentUrls?.length <= 1)
  );
}

/**
 * Handles the deletion of a message in a channel, considering threads if applicable.
 */
private async handleChannelMessageDeletion(): Promise<void> {
  const path = this.getChannelMessagePath();
  if (path) {
    await this.messageService.deleteMessageInThreadOrChannel(path);
  }
}

/**
 * Constructs the Firestore path for a channel message or a thread message.
 * @returns The Firestore document path for the message.
 */
private getChannelMessagePath(): string | null {
  if (!this.channelId || !this.message) return null;

  if (this.messageId) {
    return `channels/${this.channelId}/messages/${this.threadService.actualMessageSubject.value?.messageId}/thread/${this.messageId}`;
  } else {
    return `channels/${this.channelId}/messages/${this.message.messageId}`;
  }
}

/**
 * Handles the deletion of a message in a private chat.
 */
private async handlePrivateChatMessageDeletion(): Promise<void> {
  if (this.privateChatId && this.message?.messageId) {
    await this.messageService.deleteMessage(this.privateChatId, this.message.messageId);
  }
}


  /**
   * Returns true if the user can delete the message, false otherwise.
   * @param message - The message object.
   * @returns True if the user can delete the message, false otherwise.
   */
  canDelete(message: any): boolean {
    return message?.userId === this.userService.userId || !message;
  }

  /**
   * Returns true if the user can edit the message, false otherwise.
   * @param message - The message object.
   * @returns True if the user can edit the message, false otherwise.
   */
  changeAttachment(direction: number): void {
    let newIndex = this.currentAttachmentIndex + direction;
    if (newIndex < 0) {
      newIndex = this.actualAttachmentUrls.length - 1;
    } else if (newIndex >= this.actualAttachmentUrls.length) {
      newIndex = 0;
    }
    this.currentAttachmentIndex = newIndex;
    this.actualAttachmentUrl =
      this.actualAttachmentUrls[this.currentAttachmentIndex];
  }
}
