import { Component, ViewEncapsulation } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ProfileInfoDialogComponent } from '../../../shared/profile-info-dialog/profile-info-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-private-chat-header',
  standalone: true,
  imports: [MatToolbarModule, MatMenuModule, ProfileInfoDialogComponent],
  templateUrl: './private-chat-header.component.html',
  styleUrl: './private-chat-header.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class PrivateChatHeaderComponent {
  isMenuOpened: boolean = false;

  constructor(public dialog: MatDialog) {}

  openProfileInfo(): void {
    const dialogRef = this.dialog.open(ProfileInfoDialogComponent);
  }
}
