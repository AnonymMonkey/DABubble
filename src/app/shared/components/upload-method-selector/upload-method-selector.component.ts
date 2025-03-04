import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getStorage, ref, uploadBytes } from '@angular/fire/storage';
import { getDownloadURL } from 'firebase/storage';
import { StorageService } from '../../services/storage-service/storage.service';
import { ErrorService } from '../../services/error-service/error.service';

@Component({
  selector: 'app-upload-method-selector',
  standalone: true,
  templateUrl: './upload-method-selector.component.html',
  styleUrls: ['./upload-method-selector.component.scss'],
})
export class UploadMethodSelectorComponent {
  @Output() uploadSelected = new EventEmitter<string>();
  @Input() messageId: string | undefined;
  storage = getStorage();
  private route = inject(ActivatedRoute);

  constructor(
    private storageService: StorageService,
    private errorService: ErrorService,
  ) {}

  /**
   * Opens a file dialog based on the provided file type.
   * The file input will accept different file types based on the argument passed ('document' or 'image').
   * @param fileType The type of file to accept: 'document' or 'image'.
   */
  openFileDialog(fileType: string): void {
    const acceptType = this.getAcceptType(fileType);
    if (!acceptType) {
      console.error('Ungültiger Dateityp.');
      return;
    }
    const fileInput = this.createFileInput(acceptType);
    fileInput.click();
    fileInput.onchange = () => this.handleFileSelection(fileInput);
  }

  /**
   * Returns the MIME types that should be accepted based on the file type.
   * @param fileType The type of file to accept ('document' or 'image').
   * @returns A comma-separated string of MIME types or an empty string if the file type is invalid.
   */
  private getAcceptType(fileType: string): string {
    if (fileType === 'document') {
      return this.getDocumentAcceptTypes();
    } else if (fileType === 'image') {
      return 'image/*';
    }
    return '';
  }

  /**
   * Returns a string of MIME types for document files.
   * @returns A comma-separated string of accepted MIME types for document files.
   */
  private getDocumentAcceptTypes(): string {
    return [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
    ].join(',');
  }

  /**
   * Creates a file input element with the specified accepted file types.
   * @param acceptType A string of MIME types to accept.
   * @returns The created file input element.
   */
  private createFileInput(acceptType: string): HTMLInputElement {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = acceptType;
    return fileInput;
  }

  /**
   * Handles the file selection after the user picks a file in the file input dialog.
   * It checks if the file size is within the limit (500 KB) and uploads the file if valid.
   * @param fileInput The file input element from which the file is selected.
   */
  private handleFileSelection(fileInput: HTMLInputElement): void {
    const file = fileInput.files?.[0];
    if (file) {
      if (file.size <= 500 * 1024) {
        this.uploadFile(file);
      } else {
        this.errorService.showUserNotification(
          'Datei überschreitet das Größenlimit von 500 KB.'
        );
      }
    }
  }

  /**
   * Uploads a file to Firebase Storage with a sanitized and unique filename.
   * The file is uploaded to a specific path based on the context (channel or private chat).
   * Once uploaded, the download URL is emitted through the `uploadSelected` event.
   * @param file The file to upload.
   */
  async uploadFile(file: File): Promise<void> {
    const storagePath = this.getStoragePath(); 
    const sanitizedFileName = this.sanitizeFileName(file.name);
    const uniqueFileName = await this.getUniqueFileName(
      storagePath,
      sanitizedFileName
    );
    const storageRef = ref(
      this.storage,
      `${storagePath}${encodeURIComponent(uniqueFileName)}`
    );
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      this.uploadSelected.emit(downloadURL);
    } catch (error) {
      console.error('Fehler beim Hochladen der Datei:', error);
    }
    this.storageService.triggerCloseUploadMethodSelector();
  }

  /**
   * Determines the storage path based on the context (channel or private chat).
   * @returns The storage path for the file upload.
   */
  private getStoragePath(): string {
    const channelId = this.route.snapshot.paramMap.get('channelId');
    const privateChatId = this.route.snapshot.paramMap.get('privateChatId');
    const messageId = this.messageId;
    if (messageId && !privateChatId) {
      return `channels/${channelId}/messages/${messageId}/uploads/`;
    } else if (channelId) {
      return `channels/${channelId}/uploads/`;
    } else if (privateChatId && !messageId) {
      return `privateChats/${privateChatId}/uploads/`;
    } else if (messageId && privateChatId) {
      return `privateChats/${privateChatId}/messages/${messageId}/uploads/`;
    }
    return 'uploads/';
  }

  /**
   * Sanitizes the file name by replacing spaces and non-alphanumeric characters.
   * @param fileName The original file name.
   * @returns A sanitized file name.
   */
  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '_'); 
  }

  /**
   * Generates a unique file name by appending a timestamp to the sanitized file name.
   * @param storagePath The path where the file will be stored.
   * @param sanitizedFileName The sanitized file name.
   * @returns A unique file name.
   */
  private async getUniqueFileName(
    storagePath: string,
    sanitizedFileName: string
  ): Promise<string> {
    return this.storageService.getUniqueFileName(
      storagePath,
      sanitizedFileName
    );
  }

  /**
   * Handles drag and drop events for file upload.
   *
   * @param event The drag event.
   */
  onDragOver(event: DragEvent) {
    event.preventDefault();
    const dropArea = event.currentTarget as HTMLElement;
    dropArea.classList.add('dragging');
  }

  /**
   * Handles drag and drop events for file upload.
   *
   * @param event The drag event.
   */
  onDragLeave(event: DragEvent) {
    const dropArea = event.currentTarget as HTMLElement;
    dropArea.classList.remove('dragging');
  }

  /**
   * Handles drop events for file upload.
   *
   * @param event The drop event.
   */
  onDrop(event: DragEvent) {
    event.preventDefault();
    const dropArea = event.currentTarget as HTMLElement;
    dropArea.classList.remove('dragging');
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size <= 500 * 1024) {
        this.uploadFile(file);
      } else {
        console.error('Datei überschreitet das Größenlimit von 500 KB.');
      }
    }
  }
}
