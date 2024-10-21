import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { CreateChannelDialogComponent } from './create-channel-dialog/create-channel-dialog.component';
import { ClickStopPropagationDirective } from '../../shared/directives/click-stop-propagation.directive';
import { UserData } from '../../shared/models/user.model';
import { ChannelService } from '../../shared/services/channel-service/channel.service';
import { Channel } from '../../shared/models/channel.model';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [
    MatIconModule,
    MatSidenavModule,
    MatButtonModule,
    MatToolbarModule,
    MatExpansionModule,
    CommonModule,
    ClickStopPropagationDirective,
  ],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
  encapsulation: ViewEncapsulation.None,
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideNavComponent {
  readonly panelOpenState = signal(false);
  channelService = inject(ChannelService);
  @Input() userData!: UserData;
  allChannelsData: Channel[] = [];

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadAllChannelsData();
  }

  openCreateChannelDialog(): void {
    this.dialog.open(CreateChannelDialogComponent, {
      panelClass: 'create-channel-dialog',
    });
  }

  loadAllChannelsData(): void {
    setTimeout(() => {
      this.userData.channels.forEach((channel) => {
        this.channelService
          .getChannelById(channel)
          .subscribe((channelData) => this.allChannelsData.push(channelData));
      });
    }, 0);
  }
}
