import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user-service/user.service';
import { AuthService } from '../../services/auth-service/auth.service';

@Component({
  selector: 'app-edit-dialog',
  standalone: true,
  imports: [MatCardModule, MatIconModule, CommonModule, FormsModule],
  templateUrl: './edit-dialog.component.html',
  styleUrl: './edit-dialog.component.scss',
})
export class EditDialogComponent {
  user: any;
  newName: string = '';
  newEmail: string = '';
  readonly dialogRef = inject(MatDialogRef<EditDialogComponent>);
  userService = inject(UserService);
  authService = inject(AuthService);

  closeDialog() {
    this.dialogRef.close();
  }

  test() {
    this.userService.saveProfileChanges(
      this.user.uid,
      this.newName,
      this.newEmail
    );
    if (this.newEmail !== this.user.email) {
      this.authService.changeEmail(this.newEmail);
    }
    this.closeDialog();
  }
}
