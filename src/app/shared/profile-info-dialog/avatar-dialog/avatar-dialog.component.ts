import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar-dialog',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './avatar-dialog.component.html',
  styleUrl: './avatar-dialog.component.scss',
})
export class AvatarDialogComponent {
  photoURL: string = '';
  dialogRef = inject(MatDialogRef<AvatarDialogComponent>);

  selectAvatar(avatar: string) {
    this.photoURL = avatar;
  }
}
