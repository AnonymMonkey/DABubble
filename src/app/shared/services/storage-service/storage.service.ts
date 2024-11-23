import { inject, Injectable } from '@angular/core';
import { UserService } from '../user-service/user.service';
import {
  getBytes,
  getStorage,
  ref,
  uploadBytes,
  UploadResult,
} from '@angular/fire/storage';
import { deleteObject, getDownloadURL, listAll } from 'firebase/storage';
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

  getDownloadURL(path: string): Promise<string> {
    const fileRef = ref(this.storage, path); // Kein encodeURIComponent
    return getDownloadURL(fileRef); // URL abrufen
  }

  async uploadProfilePicture(file: File, uid?: string): Promise<string> {
    // Bestimme den Speicherpfad
    const storagePath = uid
      ? `users/${uid}/uploads/${file.name}`
      : `temp/${
          this.userService.getTempRegistrationData()?.email || 'guest'
        }/uploads/${file.name}`;

    const storageRef = ref(this.storage, storagePath);

    try {
      // Datei hochladen
      await uploadBytes(storageRef, file);

      // Generiere eine Download-URL mit Token
      const downloadUrl = await getDownloadURL(storageRef);
      console.log('Download-URL:', downloadUrl);
      return downloadUrl;
    } catch (error) {
      console.error('Fehler beim Hochladen und Generieren der URL:', error);
      throw error;
    }
  }

  async uploadFile(path: string, file: File): Promise<string> {
    const fileRef = ref(this.storage, path); // Kein encodeURIComponent hier!
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  }

  // Temporäres Hochladen
  async uploadTempAvatar(email: string, file: File): Promise<string> {
    const path = `temp/${email}/uploads/${file.name}`;
    await this.uploadFile(path, file);
    return this.getDownloadURL(path); // Rückgabe der URL
  }

  // Avatar verschieben nach Benutzererstellung
  /*   async moveAvatarToUserFolder(
    email: string,
    uid: string,
    fileName: string
  ): Promise<string> {
    const sourcePath = `temp/${email}/uploads/${fileName}`;
    const targetPath = `users/${uid}/uploads/${fileName}`;
    return this.moveFile(sourcePath, targetPath);
  }
 */

  async uploadFileRawPath(path: string, file: File): Promise<string> {
    try {
      // Nutze den Pfad direkt
      const storageRef = ref(this.storage, path);

      // Lade die Datei hoch
      await uploadBytes(storageRef, file);

      // Abrufen der Download-URL
      const downloadUrl = await getDownloadURL(storageRef);
      console.log('Datei hochgeladen:', downloadUrl);
      return downloadUrl;
    } catch (error) {
      console.error('Fehler beim Hochladen mit Raw Path:', error);
      throw error;
    }
  }

  async moveFile(sourcePath: string, targetPath: string): Promise<string> {
    const sourceRef = ref(this.storage, sourcePath);
    const targetRef = ref(this.storage, targetPath);

    console.log('Versuche, Datei zu verschieben:');
    console.log('Quelle:', sourcePath);
    console.log('Ziel:', targetPath);

    try {
      // Datei-Inhalt abrufen und in das Ziel hochladen
      const fileBytes = await getBytes(sourceRef);
      await uploadBytes(targetRef, fileBytes);

      // Quelle löschen
      await deleteObject(sourceRef);

      // Ziel-URL abrufen
      const downloadUrl = await getDownloadURL(targetRef);
      console.log('Download-URL für verschobene Datei:', downloadUrl);
      return downloadUrl;
    } catch (error) {
      console.error('Fehler beim Verschieben der Datei:', error);
      throw error;
    }
  }

  /*   async deleteExistingFiles(folderPath: string): Promise<void> {
    const encodedFolderPath = encodeURIComponent(folderPath);
    const folderRef = ref(this.storage, encodedFolderPath);

    try {
      const listResult = await listAll(folderRef);
      if (!listResult.items.length) {
        console.log('Keine Dateien gefunden, die gelöscht werden könnten.');
        return;
      }
      const deletePromises = listResult.items.map((itemRef) =>
        deleteObject(itemRef)
      );
      await Promise.all(deletePromises);
      console.log('Vorhandene Dateien erfolgreich gelöscht.');
    } catch (error) {
      console.error('Fehler beim Löschen vorhandener Dateien:', error);
    }
  } */

  /*   async clearTempFiles(email: string): Promise<void> {
    const tempPath = `temp/${email}/uploads/`;
    const folderRef = ref(this.storage, tempPath);

    try {
      console.log('Pfad ist:' + tempPath);
      console.log('Ref ist:' + folderRef);
      const listResult = await listAll(folderRef);
      if (listResult.items.length === 0) {
        console.log('Keine temporären Dateien zum Löschen gefunden.');
        return;
      }

      const deletePromises = listResult.items.map((itemRef) =>
        deleteObject(itemRef)
      );
      await Promise.all(deletePromises);
      console.log('Temporäre Dateien erfolgreich gelöscht.');
    } catch (error) {
      console.error('Fehler beim Löschen temporärer Dateien:', error);
    }
  } */

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
