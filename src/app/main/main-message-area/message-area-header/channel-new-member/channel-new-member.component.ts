import { Component, inject, ViewChild } from '@angular/core';
import { MessageAreaHeaderComponent } from '../message-area-header.component';
import { MatIcon } from '@angular/material/icon';
import { Channel } from '../../../../shared/models/channel.model';
import { ChannelService } from '../../../../shared/services/channel-service/channel.service';
import { MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { AddUsersToChannelComponent } from '../../../../shared/components/add-users-to-channel/add-users-to-channel.component';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-channel-new-member',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatIcon,
    AddUsersToChannelComponent,
    CommonModule,
  ],
  templateUrl: './channel-new-member.component.html',
  styleUrl: './channel-new-member.component.scss',
})
export class ChannelNewMemberComponent {
  @ViewChild(AddUsersToChannelComponent)
  addUsersToChannel!: AddUsersToChannelComponent;
  currentChannel: Channel | undefined;
  channelId: string = '';
  invalid: boolean = true;
  channelService = inject(ChannelService);

  constructor(
    public header: MessageAreaHeaderComponent,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.channelService.currentChannel$.subscribe((data) => {
      if (data) {
        this.currentChannel = data;
      }
    });
    this.route.params.subscribe((params) => {
      this.channelId = params['channelId'];
    });
  }

  handleUsersEmpty(isEmpty: boolean): void {
    this.invalid = isEmpty;
    console.log(this.invalid);
  }

  create() {
    if (this.channelId === '') {
      this.addUsersToChannel.createNewChannel();
    } else {
      this.addUsersToChannel.updateExistingChannel();
    }
  }
}
