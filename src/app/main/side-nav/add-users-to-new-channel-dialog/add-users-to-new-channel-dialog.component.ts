import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AddUsersToChannelComponent } from '../../../shared/components/add-users-to-channel/add-users-to-channel.component';

@Component({
  selector: 'app-add-users-to-new-channel-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatIconModule,
    MatRadioModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatChipsModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AddUsersToChannelComponent,
  ],
  templateUrl: './add-users-to-new-channel-dialog.component.html',
  styleUrl: './add-users-to-new-channel-dialog.component.scss',
})
export class AddUsersToNewChannelDialogComponent {
  @ViewChild(AddUsersToChannelComponent)
  addUsersToChannel!: AddUsersToChannelComponent;
  readonly dialogRef = inject(
    MatDialogRef<AddUsersToNewChannelDialogComponent>
  );
  radioValue: number = 0;
  invalid: boolean = true;
  channelName: string = '';
  description: string = '';
  channelId: string = '';

  constructor() {}

  checkChoice() {
    if (this.radioValue != 0) {
      this.invalid = false;
    } else {
      this.invalid = true;
    }
  }

  create() {
    this.addUsersToChannel.newChannelData.channelName = this.channelName;
    this.addUsersToChannel.newChannelData.description = this.description;

    this.addUsersToChannel.createNewChannel();
  }
}
