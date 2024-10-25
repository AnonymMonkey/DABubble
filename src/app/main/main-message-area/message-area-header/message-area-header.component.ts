import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Channel } from '../../../shared/models/channel.model'; // Importiere dein Channel Interface
import { ChannelService } from '../../../shared/services/channel-service/channel.service';
import { Subscription } from 'rxjs';
import { ChannelNewMemberComponent } from './channel-new-member/channel-new-member.component';
import { ChannelMembersListComponent } from './channel-members-list/channel-members-list.component';
import { ChannelDescriptionComponent } from './channel-description/channel-description.component';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-message-area-header',
  standalone: true,
  imports: [
    MatMenuModule,
    MatIcon,
    MatToolbarModule,
    MatMenuTrigger,
    MatToolbarModule,
    ChannelNewMemberComponent,
    ChannelMembersListComponent,
    ChannelDescriptionComponent,
    NgFor
  ],
  templateUrl: './message-area-header.component.html',
  styleUrls: ['./message-area-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MessageAreaHeaderComponent implements OnInit {
  @ViewChild('chooseChannelMenuTrigger') chooseChannelMenuTrigger!: MatMenuTrigger;
  @ViewChild('memberListMenuTrigger') memberListMenuTrigger!: MatMenuTrigger;
  @ViewChild('addMemberMenuTrigger') addMemberMenuTrigger!: MatMenuTrigger;

  isMenuOpened: string = '';

  currentChannel: Channel | undefined;

  constructor(private channelService: ChannelService) {}

  ngOnInit(): void {
    this.channelService.currentChannel$.subscribe({
      next: (channel) => {
        this.currentChannel = channel;
      }
    });
  }

  closeMenu(menuType: 'choose-channel' | 'member-list' | 'add-member') {
    switch (menuType) {
      case 'choose-channel':
        this.chooseChannelMenuTrigger?.closeMenu();
        break;
      case 'member-list':
        this.memberListMenuTrigger?.closeMenu();
        break;
      case 'add-member':
        this.addMemberMenuTrigger?.closeMenu();
        break;
    }
  }

  openMenu(menuType: 'add-member') {
    if (menuType === 'add-member') {
      this.addMemberMenuTrigger.openMenu();
    }
  }
}
