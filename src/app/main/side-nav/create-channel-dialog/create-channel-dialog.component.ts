import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { AddUsersToNewChannelDialogComponent } from '../add-users-to-new-channel-dialog/add-users-to-new-channel-dialog.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-channel-dialog',
  standalone: true,
  imports: [MatButtonModule, MatIcon, FormsModule, CommonModule],
  templateUrl: './create-channel-dialog.component.html',
  styleUrl: './create-channel-dialog.component.scss',
})
export class CreateChannelDialogComponent {
  channelName: string = '';
  description: string = '';
  invalid: boolean = true;
  isSecondDialogOpen: boolean = false;

  readonly dialogRef = inject(MatDialogRef<CreateChannelDialogComponent>);
  constructor(public dialog: MatDialog) {}

  checkInputEmpty() {
    if (this.channelName.length == 0) {
      this.invalid = true;
    } else {
      this.invalid = false;
    }
  }

  openAddUsersToChannelDialog() {
    this.isSecondDialogOpen = true;
    const secondDialogRef = this.dialog.open(
      AddUsersToNewChannelDialogComponent
    );
    secondDialogRef.componentInstance.channelName = this.channelName;
    secondDialogRef.componentInstance.description = this.description;

    secondDialogRef.afterClosed().subscribe(() => {
      this.isSecondDialogOpen = true;
      this.dialogRef.close();
    });
  }
}
