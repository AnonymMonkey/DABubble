import { NgFor, NgIf } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { deleteObject, getStorage, ref} from 'firebase/storage';

@Component({
  selector: 'app-attachment-preview',
  standalone: true,
  imports: [NgIf, MatIcon, NgFor],
  templateUrl: './attachment-preview.component.html',
  styleUrls: ['./attachment-preview.component.scss'],
})
export class AttachmentPreviewComponent implements OnChanges {
  @Input() actualAttachmentUrls: string[] = []; // Array der unsicheren URLs
  sanitizedUrl!: SafeResourceUrl; // Die sichere URL
  fileType: string = ''; // Der Typ der Datei (z. B. "pdf", "image", "doc", etc.)
  googleDocsViewerUrl: SafeResourceUrl = ''; // Google Docs Viewer URL für Word-Dateien
  private storage = getStorage();

  constructor(public sanitizer: DomSanitizer) {}

  ngOnChanges() {
    if (this.actualAttachmentUrls.length > 0) {
      const latestUrl =
        this.actualAttachmentUrls[this.actualAttachmentUrls.length - 1];
      this.sanitizedUrl =
        this.sanitizer.bypassSecurityTrustResourceUrl(latestUrl);
      this.fileType = this.getFileType(latestUrl); // Dateityp ermitteln
      if (this.fileType === 'doc') {
        const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
          latestUrl
        )}&embedded=true`;
        this.googleDocsViewerUrl =
          this.sanitizer.bypassSecurityTrustResourceUrl(viewerUrl);
      }
    } else {
      this.sanitizedUrl = '';
      this.fileType = '';
      this.googleDocsViewerUrl = '';
    }
  }

  openFileInNewTab() {
    if (this.actualAttachmentUrls.length > 0) {
      const latestUrl =
        this.actualAttachmentUrls[this.actualAttachmentUrls.length - 1];
      window.open(latestUrl, '_blank');
    }
  }

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

  extractFilePathFromUrl(fileUrl: string): string {
    const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
    const decodedUrl = decodeURIComponent(fileUrl); // Dekodiere `%2F` zu `/`

    // Extrahiere den Pfad zwischen `/o/` und `?`
    const pathStartIndex = decodedUrl.indexOf('/o/') + 3;
    const pathEndIndex = decodedUrl.indexOf('?');

    return decodedUrl.substring(pathStartIndex, pathEndIndex);
  }

  async deleteAttachment(fileUrl: string) {
    const filePath = this.extractFilePathFromUrl(fileUrl); // Pfad extrahieren
    await this.deleteFile(filePath); // Datei löschen
  }

  async deleteFile(filePath: string) {
    const fileRef = ref(this.storage, filePath);

    try {
      await deleteObject(fileRef);
      console.log(`Datei ${filePath} wurde erfolgreich gelöscht.`);
      this.actualAttachmentUrls = this.actualAttachmentUrls.filter(
        (url) => !url.includes(filePath)
      ); // Aktualisiere die Liste
    } catch (error) {
      console.error('Fehler beim Löschen der Datei:', error);
    }
  }
}
