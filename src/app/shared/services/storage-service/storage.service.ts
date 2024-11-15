import { inject, Injectable } from '@angular/core';
import { UserService } from '../user-service/user.service';
import {
  getStorage,
  ref,
  uploadBytes,
  UploadResult,
} from '@angular/fire/storage';
import { deleteObject, getDownloadURL, listAll } from 'firebase/storage';
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  userService = inject(UserService);
  storage = getStorage();

  constructor() {}

  async uploadProfilePicture(file: File) {
    const storagePath = `users/${this.userService.userId}/uploads/${file.name}`;
    const storageRef = ref(this.storage, storagePath);
    const folderPath = `users/${this.userService.userId}/uploads/`;
  
    try {
      // Lösche vorhandene Dateien im Ordner
      await this.deleteExistingFiles(folderPath);
  
      // Lade die neue Datei hoch
      await uploadBytes(storageRef, file);
      console.log('Datei erfolgreich hochgeladen:', file.name);
    } catch (error) {
      console.error('Fehler beim Hochladen der Datei:', error);
    }
  }

  async deleteExistingFiles(folderPath: string) {
    const folderRef = ref(this.storage, folderPath);
  
    try {
      const listResult = await listAll(folderRef); // Liste alle Dateien im Ordner auf
      const deletePromises = listResult.items.map((itemRef) => deleteObject(itemRef)); // Lösche jede Datei
      await Promise.all(deletePromises); // Warte, bis alle Löschvorgänge abgeschlossen sind
      console.log('Vorhandene Dateien erfolgreich gelöscht.');
    } catch (error) {
      console.error('Fehler beim Löschen vorhandener Dateien:', error);
    }
  }
  
  
}
