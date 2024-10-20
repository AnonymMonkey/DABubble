import { Component, OnInit } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatFormField } from '@angular/material/form-field';
import { MatMenu } from '@angular/material/menu';
import { MessageAreaHeaderComponent } from '../message-area-header.component';
import { ChannelEditDescriptionComponent } from './channel-edit-description/channel-edit-description.component';
import { ChannelDisplayDescriptionComponent } from './channel-display-description/channel-display-description.component';
import { ChannelEditNameComponent } from './channel-edit-name/channel-edit-name.component';
import { ChannelDisplayNameComponent } from './channel-display-name/channel-display-name.component';
import { NgIf } from '@angular/common';
import { Channel } from '../../../../shared/models/channel.model';
import { ChannelService } from '../../../../shared/services/channel-service/channel.service';


@Component({
  selector: 'app-channel-description',
  standalone: true,
  imports: [MatIcon, MatCard, MatExpansionModule, NgIf, MatFormField, MatMenu, MessageAreaHeaderComponent, ChannelEditDescriptionComponent, ChannelDisplayDescriptionComponent, ChannelEditNameComponent, ChannelDisplayNameComponent],
  templateUrl: './channel-description.component.html',
  styleUrl: './channel-description.component.scss'
})
export class ChannelDescriptionComponent implements OnInit {
  editName: boolean = false;
  editDescription: boolean = false;
  currentChannel: Channel | null = null;

  constructor(public header: MessageAreaHeaderComponent, public channelService: ChannelService) { }

  ngOnInit(): void {
    this.channelService.currentChannel$.subscribe({
      next: (channel) => {
        this.currentChannel = channel;
      }
    });
  }


  toggleEditName() {
    this.editName = !this.editName;
  }

  toggleEditDescription() {
    this.editDescription = !this.editDescription;
  }
}
