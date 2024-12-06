import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { AddUsersToNewChannelDialogComponent } from '../add-users-to-new-channel-dialog/add-users-to-new-channel-dialog.component';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

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
  secondDialogRefSubscription: Subscription | undefined;

  readonly dialogRef = inject(MatDialogRef<CreateChannelDialogComponent>);
  constructor(public dialog: MatDialog) {}

  /**
   * Checks if the input is empty.
   */
  checkInputEmpty() {
    if (this.channelName.length == 0) this.invalid = true;
    else this.invalid = false;
  }

  /**
   * Unsubscribes from the second dialog ref subscription when the component is destroyed.
   */
  ngOnDestroy(): void {
    this.secondDialogRefSubscription?.unsubscribe();
  }

  /**
   * Opens the add users to new channel dialog.
   */
  openAddUsersToChannelDialog() {
    this.isSecondDialogOpen = true;
    const secondDialogRef = this.dialog.open(
      AddUsersToNewChannelDialogComponent
    );
    secondDialogRef.componentInstance.channelName = this.channelName;
    secondDialogRef.componentInstance.description = this.description;

    this.secondDialogRefSubscription = secondDialogRef
      .afterClosed()
      .subscribe(() => {
        this.isSecondDialogOpen = true;
        this.dialogRef.close();
      });
  }
}
