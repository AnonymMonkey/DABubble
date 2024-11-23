import { inject, Injectable } from '@angular/core';
import { UserService } from '../user-service/user.service';
import {
  deleteObject,
  getDownloadURL,
  getMetadata,
  listAll,
  ref,
  getStorage,
  uploadBytes,
} from 'firebase/storage';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  userService = inject(UserService);
  storage = getStorage();
  private closeAttachmentPreviewSubject = new Subject<void>();
  private closeUploadMethodSelector = new Subject<void>();

  constructor() {}

  async uploadProfilePicture(file: File) {
    const sanitizedFileName = file.name
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `users/${this.userService.userId}/uploads/${sanitizedFileName}`;
    const storageRef = ref(this.storage, storagePath);
    const folderPath = `users/${this.userService.userId}/uploads/`;

    try {
      // Lösche vorhandene Dateien im Ordner
      await this.deleteExistingFiles(folderPath);

      // Lade die neue Datei hoch
      await uploadBytes(storageRef, file);
    } catch (error) {
      console.error('Fehler beim Hochladen der Datei:', error);
    }
  }

  async deleteExistingFiles(folderPath: string) {
    const folderRef = ref(this.storage, folderPath);

    try {
      const listResult = await listAll(folderRef); // Liste alle Dateien im Ordner auf
      const deletePromises = listResult.items.map((itemRef) =>
        deleteObject(itemRef)
      ); // Lösche jede Datei
      await Promise.all(deletePromises); // Warte, bis alle Löschvorgänge abgeschlossen sind
    } catch (error) {
      console.error('Fehler beim Löschen vorhandener Dateien:', error);
    }
  }

  async deleteSpecificFile(fileUrl: string) {
    const filePath = this.extractFilePathFromUrl(fileUrl);
    const fileRef = ref(this.storage, filePath);

    try {
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Fehler beim Löschen der Datei:', error);
    }
  }

  private extractFilePathFromUrl(fileUrl: string): string {
    const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
    const decodedUrl = decodeURIComponent(fileUrl);

    const pathStartIndex = decodedUrl.indexOf('/o/') + 3;
    const pathEndIndex = decodedUrl.indexOf('?');
    return decodedUrl.substring(pathStartIndex, pathEndIndex);
  }

  async getUniqueFileName(path: string, fileName: string): Promise<string> {
    const fileNameParts = fileName.split('.');
    const baseName = fileNameParts.slice(0, -1).join('.');
    const extension = fileNameParts[fileNameParts.length - 1];
    let uniqueName = fileName;
    let counter = 0;

    // Debugging-Ausgabe: Überprüfe den Anfangsdateinamen
    console.log(`Initial fileName: ${uniqueName}`);

    // Überprüfen, ob der Dateiname bereits existiert
    while (await this.fileExists(`${path}${uniqueName}`)) {
      counter++;
      uniqueName = `${baseName}(${counter}).${extension}`;

      // Debugging-Ausgabe: Überprüfe den neuen Dateinamen in jeder Schleifeniteration
      console.log(`Checking for file: ${path}${uniqueName}`);
    }

    // Debugging-Ausgabe: Überprüfe den endgültigen Dateinamen
    console.log(`Unique file name: ${uniqueName}`);
    return uniqueName;
  }

  // Methode zur Überprüfung, ob eine Datei existiert
  async fileExists(path: string): Promise<boolean> {
    try {
      const fileRef = ref(this.storage, path); // Hier rufst du ref() korrekt auf
      await getDownloadURL(fileRef); // Hole die Download-URL der Datei
      return true; // Datei existiert
    } catch (error: any) {
      if (error.code === 'storage/object-not-found') {
        return false; // Datei existiert nicht
      }
      // Fehlerbehandlung für andere Fehler
      console.error('Fehler beim Prüfen der Datei:', error);
      return false;
    }
  }

  triggerCloseAttachmentPreview() {
    this.closeAttachmentPreviewSubject.next();
  }

  onCloseAttachmentPreview() {
    return this.closeAttachmentPreviewSubject.asObservable();
  }

  triggerCloseUploadMethodSelector() {
    this.closeUploadMethodSelector.next();
  }

  onCloseUploadMethodSelector() {
    return this.closeUploadMethodSelector.asObservable();
  }
}
