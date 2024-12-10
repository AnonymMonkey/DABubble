import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../services/auth-service/auth.service';

@Component({
  selector: 'app-email-notification-dialog',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './email-notification-dialog.component.html',
  styleUrl: './email-notification-dialog.component.scss',
})
export class EmailNotificationDialogComponent {
  readonly dialogRef = inject(MatDialogRef<EmailNotificationDialogComponent>);
  authService = inject(AuthService);
  email: string = '';

  constructor(public dialog: MatDialog) {}

  /**
   * Logs out the user.
   */
  logOut() {
    this.dialog.closeAll();
    this.authService.logout();
  }
}
