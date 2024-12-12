import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage-service/storage.service';

@Component({
  selector: 'app-avatar-dialog',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './avatar-dialog.component.html',
  styleUrl: './avatar-dialog.component.scss',
})
export class AvatarDialogComponent {
  photoURL: string = '';
  email: string = '';
  dialogRef = inject(MatDialogRef<AvatarDialogComponent>);
  isUploading = false;
  storageService = inject(StorageService);
  avatars: string[] = [
    'assets/img/profile/elias.webp',
    'assets/img/profile/elise.webp',
    'assets/img/profile/frederik.webp',
    'assets/img/profile/noah.webp',
    'assets/img/profile/sofia.webp',
    'assets/img/profile/steffen.webp',
  ];

  /**
   * Chooses a new avatar
   * @param avatar path to the avatar
   */
  selectAvatar(avatar: string) {
    this.photoURL = avatar;
  }

  /**
   * Closes the dialog
   */
  closeDialog() {
    this.dialogRef.close(this.photoURL);
  }

  /**
   * Uploads an avatar
   * @param event - The event
   */
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        console.error('Nur Bilder können hochgeladen werden.');
        return;
      }
      this.isUploading = true;
      await this.uploadNewAndDeleteOldAvatar(file);
    }
  }

  /**
   * Uploads a new avatar and deletes the old one
   * @param file - The file to upload
   */
  async uploadNewAndDeleteOldAvatar(file: File): Promise<void> {
    try {
      const email = this.email;
      const folderPath = `users/${email}/uploads/`;
      const path = folderPath + file.name;
      await this.storageService.deletePreviousFile(folderPath);
      this.photoURL = await this.storageService.uploadFileRawPath(path, file);
    } catch (error) {
      console.error('Fehler beim Hochladen des Avatars:', error);
    } finally {
      this.isUploading = false;
    }
  }
}
