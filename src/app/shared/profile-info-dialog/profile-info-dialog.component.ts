import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef } from '@angular/material/dialog';
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
  constructor() {}

  ngOnInit() {
    this.userService.userData$.subscribe((data) => {
      this.userData = data; // Empfange die Benutzerdaten
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
