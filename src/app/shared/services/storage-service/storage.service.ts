import { inject, Injectable } from '@angular/core';
import { UserService } from '../user-service/user.service';
import { getBytes, getStorage, ref, uploadBytes } from '@angular/fire/storage';
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

  /**
   * Gets the download URL of a file in Firebase Storage.
   * @param path - The path to the file in Firebase Storage.
   * @returns A Promise that resolves to the download URL of the file.
   */
  getDownloadURL(path: string): Promise<string> {
    const fileRef = ref(this.storage, path);
    return getDownloadURL(fileRef);
  }

  /**
   * Uploads a file to Firebase Storage and returns its download URL.
   * @param file - The file to upload.
   * @param uid - The uid of the user.
   * @returns A Promise that resolves to the download URL of the uploaded file.
   */
  async uploadProfilePicture(file: File, uid?: string): Promise<string> {
    const storagePath = uid
      ? `users/${uid}/uploads/${file.name}`
      : `temp/${
          this.userService.getTempRegistrationData()?.email || 'guest'
        }/uploads/${file.name}`;
    const storageRef = ref(this.storage, storagePath);
    try {
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (error) {
      console.error('Fehler beim Hochladen und Generieren der URL:', error);
      throw error;
    }
  }

  /**
   * A method to upload a file and return its download URL.
   * @param path - The path to upload the file to.
   * @param file - The file to upload.
   * @returns A Promise that resolves to the download URL of the uploaded file.
   */
  async uploadFile(path: string, file: File): Promise<string> {
    const fileRef = ref(this.storage, path);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  }

  /**
   * A method to upload a temporary avatar and return its download URL.
   * @param email - The email of the user.
   * @param file - The file to upload.
   * @returns A Promise that resolves to the download URL of the uploaded avatar.
   */
  async uploadTempAvatar(email: string, file: File): Promise<string> {
    const path = `temp/${email}/uploads/${file.name}`;
    await this.uploadFile(path, file);
    return this.getDownloadURL(path);
  }

  /**
   * A method to upload a file with a raw path.
   * @param path - The path to upload the file to.
   * @param file - The file to upload.
   * @returns A Promise that resolves to the download URL of the uploaded file.
   */
  async uploadFileRawPath(path: string, file: File): Promise<string> {
    try {
      const storageRef = ref(this.storage, path);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (error) {
      console.error('Fehler beim Hochladen mit Raw Path:', error);
      throw error;
    }
  }

  /**
   * A method to move a file from one location to another.
   * @param sourcePath - The path of the file to move.
   * @param targetPath - The path to move the file to.
   * @returns A Promise that resolves to the download URL of the moved file.
   */
  async moveFile(sourcePath: string, targetPath: string): Promise<string> {
    const sourceRef = ref(this.storage, sourcePath);
    const targetRef = ref(this.storage, targetPath);
    try {
      const fileBytes = await getBytes(sourceRef);
      await uploadBytes(targetRef, fileBytes);
      await deleteObject(sourceRef);
      const downloadUrl = await getDownloadURL(targetRef);
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

  /**
   * Deletes a specific file from Firebase Storage based on its URL.
   * @param fileUrl - The URL of the file to be deleted.
   */
  async deleteSpecificFile(fileUrl: string) {
    const filePath = this.extractFilePathFromUrl(fileUrl);
    const fileRef = ref(this.storage, filePath);

    try {
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Fehler beim Löschen der Datei:', error);
    }
  }

  /**
   * Deletes the previous file from the specified folder path.
   * @param folderPath - The path of the folder containing the previous file.
   */
  async deletePreviousFile(folderPath: string) {
    const folderRef = ref(this.storage, folderPath);
    try {
      const listResult = await listAll(folderRef);
      if (listResult.items.length !== 0) {
        const fileRef = ref(this.storage, listResult.items[0].fullPath);
        deleteObject(fileRef);
        return;
      }
    } catch (error) {
      console.error('Fehler beim Löschen der Dateien:', error);
    }
  }

  /**
   * Extracts the file path from the provided URL.
   * @param fileUrl - The URL of the file.
   * @returns The extracted file path.
   */
  private extractFilePathFromUrl(fileUrl: string): string {
    const decodedUrl = decodeURIComponent(fileUrl);
    const pathStartIndex = decodedUrl.indexOf('/o/') + 3;
    const pathEndIndex = decodedUrl.indexOf('?');
    return decodedUrl.substring(pathStartIndex, pathEndIndex);
  }

  /**
   * Generates a unique file name by appending a timestamp to the base name.
   * @param path - The path of the file.
   * @param fileName - The base name of the file.
   * @returns A promise that resolves to the unique file name.
   */
  async getUniqueFileName(path: string, fileName: string): Promise<string> {
    const fileNameParts = fileName.split('.');
    const baseName = fileNameParts.slice(0, -1).join('.');
    const extension = fileNameParts[fileNameParts.length - 1];
    const timestamp = Date.now();
    let uniqueName = `${baseName}_${timestamp}.${extension}`;
    return uniqueName;
  }

  /**
   * Triggers the closeAttachmentPreview event.
   */
  triggerCloseAttachmentPreview() {
    this.closeAttachmentPreviewSubject.next();
  }

  /**
   * A stream that emits when the attachment preview is closed.
   * @returns A stream that emits when the attachment preview is closed.
   */
  onCloseAttachmentPreview() {
    return this.closeAttachmentPreviewSubject.asObservable();
  }

  /**
   * Triggers the closeUploadMethodSelector event.
   */
  triggerCloseUploadMethodSelector() {
    this.closeUploadMethodSelector.next();
  }

  /**
   * A stream that emits when the upload method selector is closed.
   * @returns A stream that emits when the upload method selector is closed.
   */
  onCloseUploadMethodSelector() {
    return this.closeUploadMethodSelector.asObservable();
  }
}
