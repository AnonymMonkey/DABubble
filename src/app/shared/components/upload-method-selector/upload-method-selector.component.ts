import { Component, EventEmitter, inject, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getStorage, ref, uploadBytes, UploadResult } from '@angular/fire/storage';
import { getDownloadURL } from 'firebase/storage';

@Component({
  selector: 'app-upload-method-selector',
  standalone: true,
  templateUrl: './upload-method-selector.component.html',
  styleUrls: ['./upload-method-selector.component.scss']
})
export class UploadMethodSelectorComponent {
  @Output() uploadSelected = new EventEmitter<string>();
  storage = getStorage(); // Firebase Storage-Instanz
  private route = inject(ActivatedRoute); // Aktivierte Route

  // Methode zum Öffnen des Datei-Dialogs und Festlegen des akzeptierten Typs
  openFileDialog(fileType: string) {
    let acceptType = '';
    if (fileType === 'document') {
      acceptType = 'application/pdf,application/msword,...'; // Dokumentformate
    } else if (fileType === 'image') {
      acceptType = 'image/*'; // Bilddateien
    }

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = acceptType;
    fileInput.click();

    fileInput.onchange = () => {
      const file = fileInput.files?.[0];
      if (file && file.size <= 500 * 1024) {
        this.uploadFile(file);
      } else {
        console.error('Datei überschreitet das Größenlimit von 500 KB.');
      }
    };
  }

  // Upload-Datei und dynamischer Pfad basierend auf Channel- oder PrivateChat-ID
  async uploadFile(file: File) {
    const channelId = this.route.snapshot.paramMap.get('channelId');
    const privateChatId = this.route.snapshot.paramMap.get('privateChatId');

    let storagePath = 'uploads/'; // Basis-Speicherpfad
    if (channelId) {
      storagePath = `channels/${channelId}/uploads/${file.name}`;
    } else if (privateChatId) {
      storagePath = `privatechats/${privateChatId}/uploads/${file.name}`;
    }

    const storageRef = ref(this.storage, storagePath);

    try {
      const snapshot: UploadResult = await uploadBytes(storageRef, file);
      console.log('Datei erfolgreich hochgeladen:', snapshot);

      // Download-URL abrufen
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('Download-URL:', downloadURL);

      // Download-URL an die Elternkomponente übermitteln
      this.uploadSelected.emit(downloadURL);
    } catch (error) {
      console.error('Fehler beim Hochladen der Datei:', error);
    }
  }

  // Drag & Drop Events
  onDragOver(event: DragEvent) {
    event.preventDefault();
    const dropArea = event.currentTarget as HTMLElement;
    dropArea.classList.add('dragging');
  }

  onDragLeave(event: DragEvent) {
    const dropArea = event.currentTarget as HTMLElement;
    dropArea.classList.remove('dragging');
  }

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
