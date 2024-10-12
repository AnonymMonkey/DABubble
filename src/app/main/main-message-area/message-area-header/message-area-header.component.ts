import { ChangeDetectorRef, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ChannelDescriptionComponent } from './channel-description/channel-description.component';
import { ChannelMembersListComponent } from './channel-members-list/channel-members-list.component';
import { ChannelNewMemberComponent } from './channel-new-member/channel-new-member.component';

@Component({
  selector: 'app-message-area-header',
  standalone: true,
  imports: [
    MatMenuModule,
    MatIcon,
    MatToolbarModule,
    ChannelDescriptionComponent,
    MatMenuTrigger,
    ChannelMembersListComponent,
    ChannelNewMemberComponent
  ],
  templateUrl: './message-area-header.component.html',
  styleUrl: './message-area-header.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class MessageAreaHeaderComponent {
  @ViewChild('chooseChannelMenuTrigger') chooseChannelMenuTrigger!: MatMenuTrigger;
  @ViewChild('memberListMenuTrigger') memberListMenuTrigger!: MatMenuTrigger;
  @ViewChild('addMemberMenuTrigger') addMemberMenuTrigger!: MatMenuTrigger;

  isMenuOpened: string = '';

  closeMenu(menuType: string) {
    if (menuType === 'choose-channel' && this.chooseChannelMenuTrigger) {
      this.chooseChannelMenuTrigger.closeMenu();
    } else if (menuType === 'member-list' && this.memberListMenuTrigger) {
      this.memberListMenuTrigger.closeMenu();
    } else if (menuType === 'add-member' && this.addMemberMenuTrigger) {
      this.addMemberMenuTrigger.closeMenu();
    }
  }

  openMenu(menuType: string) {
    if (menuType === 'add-member') {
      this.addMemberMenuTrigger.openMenu();
    }
  }
}
