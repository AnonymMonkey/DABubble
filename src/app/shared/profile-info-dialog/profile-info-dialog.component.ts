import { Component, Inject, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { UserData } from '../models/user.model';
import { Subscription } from 'rxjs';
import { UserService } from '../services/user-service/user.service';

@Component({
  selector: 'app-profile-info-dialog',
  standalone: true,
  imports: [MatIconModule, MatInputModule, MatCardModule, CommonModule],
  templateUrl: './profile-info-dialog.component.html',
  styleUrl: './profile-info-dialog.component.scss',
})
export class ProfileInfoDialogComponent {
  ownProfile: boolean = true;
  userData!: UserData;
  subscription!: Subscription;
  userService = inject(UserService);

  readonly dialogRef = inject(MatDialogRef<ProfileInfoDialogComponent>);
  constructor(@Inject(MAT_DIALOG_DATA) public data: { userId: string; userName: string; userPhotoURL: string }) {}

  //ANCHOR - Semir - Überprüfung, ob eigenes oder anderes Profil.
  ngOnInit() {
    if (this.data) {
      this.userData = {
        uid: this.data.userId,
        displayName: this.data.userName,
        photoURL: this.data.userPhotoURL,
      } as UserData; // Verwende den Typ UserData
      if (this.data.userId === this.userService.userId) {
        this.ownProfile = true;
      } else {
        this.ownProfile = false;
      }
    } else {
      this.userService.userData$.subscribe((data) => {
        this.userData = data; // Empfange die Benutzerdaten
      });
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
