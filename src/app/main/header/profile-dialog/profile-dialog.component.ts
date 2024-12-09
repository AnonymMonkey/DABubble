import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { ProfileInfoDialogComponent } from '../../../shared/profile-info-dialog/profile-info-dialog.component';
import { AuthService } from '../../../shared/services/auth-service/auth.service';

@Component({
  selector: 'app-profile-dialog',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './profile-dialog.component.html',
  styleUrl: './profile-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileDialogComponent {
  authService = inject(AuthService);

  constructor(public dialog: MatDialog) {}

  /**
   * Opens the profile info dialog
   */
  openProfileInfo(): void {
    const dialogRef = this.dialog.open(ProfileInfoDialogComponent);
  }

  /**
   * Logs out the user and closes the dialog
   */
  logOut(): void {
    this.authService.logout();
    this.dialog.closeAll();
  }
}
