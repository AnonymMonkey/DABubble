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
import { RoutingService } from '../../../shared/services/routing-service/routing.service';
import { ChannelService } from '../../../shared/services/channel-service/channel.service';
import { Channel } from '../../../shared/models/channel.model';
import { UserService } from '../../../shared/services/user-service/user.service';
import { Router } from '@angular/router';

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
  openedChannelId: string = '';
  openedChannelData: any;
  routingService = inject(RoutingService);
  channelService = inject(ChannelService);
  userService = inject(UserService);
  currentParams: any;
  allUsersData: any[] = [];
  newChannelData!: Channel;
  currentUserId: string = '';
  router = inject(Router);

  constructor() {}

  ngOnInit() {
    this.newChannelData = new Channel();
    this.routingService.currentRoute$.subscribe((params) => {
      this.currentParams = params;
      this.openedChannelId = '';
      if (this.currentParams['channelId']) {
        this.openedChannelId = this.currentParams['channelId'];
        this.channelService
          .getChannelById(this.openedChannelId)
          .subscribe((data) => {
            this.openedChannelData = data;
          });
      }
    });

    this.userService.allUserData$.subscribe((data) => {
      data.forEach((user) => {
        this.allUsersData.push(user.uid);
      });
    });

    this.currentUserId = this.userService.userId;
  }

  checkChoice() {
    if (this.radioValue != 0) {
      this.invalid = false;
    } else {
      this.invalid = true;
    }
  }

  create() {
    if (this.radioValue == 1) {
      this.newChannelData.admin.userId = this.currentUserId;
      this.newChannelData.channelName = this.channelName;
      this.newChannelData.description = this.description;
      this.bindData();
      this.createNewChannel();
    } else {
      this.addUsersToChannel.newChannelData.channelName = this.channelName;
      this.addUsersToChannel.newChannelData.description = this.description;
      this.createNewOrUpdateExistingChannel();
    }
  }

  createNewOrUpdateExistingChannel() {
    if (this.channelId === '') {
      this.addUsersToChannel.createNewChannel();
    } else {
      this.addUsersToChannel.updateExistingChannel();
    }
  }

  bindData() {
    if (this.openedChannelData) {
      this.bindOpenedChannelData();
    } else {
      this.bindAllUsers();
    }
  }

  bindOpenedChannelData() {
    this.newChannelData.members = this.openedChannelData.members;
  }

  bindAllUsers() {
    this.newChannelData.members = this.allUsersData;
  }

  createNewChannel() {
    this.channelService.createChannel(this.newChannelData).subscribe({
      next: (channelId) => {
        this.router.navigate([
          `/main/${this.currentUserId}/channel/${channelId}`,
        ]);
      },
      error: (error) => {
        console.error('Fehler beim Erstellen des Channels:', error);
      },
    });
  }
}
