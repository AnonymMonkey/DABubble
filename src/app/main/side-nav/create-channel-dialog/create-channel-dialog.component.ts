import {
  Component,
  ElementRef,
  Inject,
  inject,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { AddUsersToNewChannelDialogComponent } from '../add-users-to-new-channel-dialog/add-users-to-new-channel-dialog.component';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AddUsersToChannelBottomSheetComponent } from '../add-users-to-channel-bottom-sheet/add-users-to-channel-bottom-sheet/add-users-to-channel-bottom-sheet.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Channel } from '../../../shared/models/channel.model';

@Component({
  selector: 'app-create-channel-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIcon,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './create-channel-dialog.component.html',
  styleUrl: './create-channel-dialog.component.scss',
})
export class CreateChannelDialogComponent {
  @ViewChild('channelNameInput') channelNameInputElement!: ElementRef;
  @ViewChild('descriptionInput') descriptionInputElement!: ElementRef;
  description: string = '';
  isSecondDialogOpen: boolean = false;
  secondDialogRefSubscription: Subscription | undefined;
  bottomSheet = inject(MatBottomSheet);
  breakpointObserver = inject(BreakpointObserver);
  breakpointSubscription!: Subscription;
  mobileVersion: boolean = false;
  createChannelForm!: FormGroup;
  formbuilder = inject(FormBuilder);
  allChannelNames: string[] = [];

  readonly dialogRef = inject(MatDialogRef<CreateChannelDialogComponent>);
  constructor(
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  /**
   * Initializes the component and subscribes to breakpoint changes.
   */
  ngOnInit(): void {
    this.breakpointChanges();
    this.loadAllChannelNames();
    this.channelForm();
  }

  /**
   * Loads all channel names from the data.
   */
  loadAllChannelNames() {
    this.allChannelNames = this.data.allExistingChannelNames;
  }

  /**
   * Subscribes to breakpoint changes and updates the mobileVersion property.
   */
  breakpointChanges() {
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
   * Creates the channel form.
   */
  channelForm() {
    this.createChannelForm = this.formbuilder.group({
      channelName: [
        '',
        [
          Validators.required,
          Validators.maxLength(25),
          this.nameExistsValidator(this.allChannelNames),
        ],
        ,
      ],
    });
  }

  /**
   * Returns the channel name control.
   */
  get channelNameControl(): FormControl {
    return this.createChannelForm.get('channelName') as FormControl;
  }

  /**
   * Custom Validator: proofs if the name already exists
   */
  nameExistsValidator(existingNames: string[]) {
    return (control: FormControl) => {
      if (existingNames.includes(control.value?.trim())) {
        return { nameExists: true };
      }
      return null;
    };
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
    secondDialogRef.componentInstance.channelName =
      this.channelNameControl.value;
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
          channelName: this.channelNameControl.value,
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
