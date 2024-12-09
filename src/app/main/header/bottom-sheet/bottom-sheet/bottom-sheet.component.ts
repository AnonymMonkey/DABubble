import { Component, inject } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../../../shared/services/auth-service/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ProfileInfoDialogComponent } from '../../../../shared/profile-info-dialog/profile-info-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  imports: [MatListModule, MatIconModule],
  templateUrl: './bottom-sheet.component.html',
  styleUrl: './bottom-sheet.component.scss',
})
export class BottomSheetComponent {
  authService = inject(AuthService);
  dialog = inject(MatDialog);
  _bottomSheetRef =
    inject<MatBottomSheetRef<BottomSheetComponent>>(MatBottomSheetRef);

  /**
   * Opens the profile info dialog
   */
  openProfileInfo(): void {
    const dialogRef = this.dialog.open(ProfileInfoDialogComponent);
  }

  /**
   * Logs out the user and closes the bottom sheet
   */
  logOut(): void {
    this.authService.logout();
    this._bottomSheetRef.dismiss();
  }
}
