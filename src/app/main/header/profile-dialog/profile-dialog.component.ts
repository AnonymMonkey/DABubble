import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { ProfileInfoDialogComponent } from '../../../shared/profile-info-dialog/profile-info-dialog.component';

@Component({
  selector: 'app-profile-dialog',
  standalone: true,
  imports: [MatCardModule, ProfileInfoDialogComponent],
  templateUrl: './profile-dialog.component.html',
  styleUrl: './profile-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ProfileDialogComponent {
  constructor(public dialog: MatDialog) {}
  openProfileInfo(): void {
    const dialogRef = this.dialog.open(ProfileInfoDialogComponent);
  }
}
