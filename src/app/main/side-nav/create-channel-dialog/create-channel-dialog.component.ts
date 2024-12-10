import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { AddUsersToNewChannelDialogComponent } from '../add-users-to-new-channel-dialog/add-users-to-new-channel-dialog.component';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AddUsersToChannelBottomSheetComponent } from '../add-users-to-channel-bottom-sheet/add-users-to-channel-bottom-sheet/add-users-to-channel-bottom-sheet.component';
import { BreakpointObserver } from '@angular/cdk/layout';

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
  bottomSheet = inject(MatBottomSheet);
  breakpointObserver = inject(BreakpointObserver);
  breakpointSubscription!: Subscription;
  mobileVersion: boolean = false;

  readonly dialogRef = inject(MatDialogRef<CreateChannelDialogComponent>);
  constructor(public dialog: MatDialog) {}

  /**
   * Initializes the component and subscribes to breakpoint changes.
   */
  ngOnInit(): void {
    this.breakpointSubscription = this.breakpointObserver
      .observe(['(max-width: 600px)'])
      .subscribe((result) => {
        this.mobileVersion = result.matches ? true : false;
        if (this.mobileVersion && this.isSecondDialogOpen) {
          this.openAddUsersToChannelBottomSheet();
        }
      });
  }

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
    this.breakpointSubscription?.unsubscribe();
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

  /**
   * Opens the add users to channel bottom sheet.
   */
  openAddUsersToChannelBottomSheet() {
    const bottomSheetRef = this.bottomSheet.open(
      AddUsersToChannelBottomSheetComponent,
      {
        data: {
          channelName: this.channelName,
          description: this.description,
        },
      }
    );
    bottomSheetRef.afterDismissed().subscribe(() => {
      this.isSecondDialogOpen = true;
      this.dialogRef.close();
    });
  }

  /**
   * Opens the add users to channel dialog or the add users to channel bottom sheet.
   */
  openAddUsersToChannel() {
    if (this.mobileVersion) this.openAddUsersToChannelBottomSheet();
    else this.openAddUsersToChannelDialog();
  }
}
