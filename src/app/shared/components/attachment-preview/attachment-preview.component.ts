import { NgIf } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-attachment-preview',
  standalone: true,
  imports: [NgIf],
  templateUrl: './attachment-preview.component.html',
  styleUrls: ['./attachment-preview.component.scss'],
})
export class AttachmentPreviewComponent implements OnChanges {
  @Input() actualAttachmentUrls: string[] = []; // Array der unsicheren URLs
  sanitizedUrl!: SafeResourceUrl; // Die sichere URL
  fileType: string = ''; // Der Typ der Datei (z. B. "pdf", "image", "doc", etc.)
  googleDocsViewerUrl: SafeResourceUrl = ''; // Google Docs Viewer URL für Word-Dateien

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges() {
    if (this.actualAttachmentUrls.length > 0) {
      const latestUrl = this.actualAttachmentUrls[this.actualAttachmentUrls.length - 1];
      this.sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(latestUrl);
      this.fileType = this.getFileType(latestUrl); // Dateityp ermitteln
      if (this.fileType === 'doc') {
        const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(latestUrl)}&embedded=true`;
        this.googleDocsViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(viewerUrl);
      }
    }
    else {
      this.sanitizedUrl = '';
      this.fileType = '';
      this.googleDocsViewerUrl = '';
    }
  }

  openFileInNewTab() {
    if (this.actualAttachmentUrls.length > 0) {
      const latestUrl = this.actualAttachmentUrls[this.actualAttachmentUrls.length - 1];
      window.open(latestUrl, '_blank');
    }
  }

  private getFileType(url: string): string {
    const filename = decodeURIComponent(url.split('/').pop()?.split('?')[0] || '');
    const extension = filename.split('.').pop()?.toLowerCase();

    if (!extension) return 'unknown';
    if (['pdf'].includes(extension)) return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
    if (['doc', 'docx'].includes(extension)) return 'doc';
    if (['txt', 'csv'].includes(extension)) return 'text';
    if (['xlsx', 'xls'].includes(extension)) return 'excel';
    return 'unknown';
  }
}
