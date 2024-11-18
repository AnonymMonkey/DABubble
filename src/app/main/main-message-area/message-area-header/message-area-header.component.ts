import {
  Component,
  ElementRef,
  inject,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Channel } from '../../../shared/models/channel.model';
import { ChannelService } from '../../../shared/services/channel-service/channel.service';
import { UserService } from '../../../shared/services/user-service/user.service';
import { ChannelNewMemberComponent } from './channel-new-member/channel-new-member.component';
import { ChannelMembersListComponent } from './channel-members-list/channel-members-list.component';
import { ChannelDescriptionComponent } from './channel-description/channel-description.component';
import { NgFor, } from '@angular/common';
import { forkJoin } from 'rxjs';

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
    NgFor,
  ],
  templateUrl: './message-area-header.component.html',
  styleUrls: ['./message-area-header.component.scss'],
})
export class MessageAreaHeaderComponent implements OnInit {
  @ViewChild('chooseChannelMenuTrigger')
  chooseChannelMenuTrigger!: MatMenuTrigger;
  @ViewChild('memberListMenuTrigger') memberListMenuTrigger!: MatMenuTrigger;
  @ViewChild('addMemberMenuTrigger') addMemberMenuTrigger!: MatMenuTrigger;

  isMenuOpened: string = '';
  currentBorderRadius: string = '30px 30px 30px 30px'; // Standardwert
  userService = inject(UserService);

  currentChannel: Channel | undefined;

  constructor(private channelService: ChannelService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.channelService.currentChannel$.subscribe({
        next: (channel) => {
          this.currentChannel = channel;
        },
      });
    }, 0);
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

  toggleBorder(menuType: string) {
    switch (menuType) {
      case 'choose-channel':
        this.currentBorderRadius = '0px 30px 30px 30px';
        break;
      case 'member-list':
        this.currentBorderRadius = '30px 0px 30px 30px';
        break;
      case 'add-member':
        this.currentBorderRadius = '30px 0px 30px 30px';
        break;
      default:
        this.currentBorderRadius = '0px 30px 30px 30px';
    }
    document.documentElement.style.setProperty(
      '--border-radius',
      this.currentBorderRadius
    );
  }

  getPhotoURL(userId: string): string {
    return this.userService.getPhotoURL(userId);
  }
}
