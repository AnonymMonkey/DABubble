import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-info-dialog',
  standalone: true,
  imports: [MatIconModule, MatInputModule, MatCardModule, CommonModule],
  templateUrl: './profile-info-dialog.component.html',
  styleUrl: './profile-info-dialog.component.scss',
})
export class ProfileInfoDialogComponent {
  ownProfile: boolean = false;

  readonly dialogRef = inject(MatDialogRef<ProfileInfoDialogComponent>);
  constructor() {}

  closeDialog() {
    this.dialogRef.close();
  }
}
