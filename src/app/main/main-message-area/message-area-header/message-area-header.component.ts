import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import {MatMenuModule, MatMenuTrigger} from '@angular/material/menu';
import {MatToolbarModule} from '@angular/material/toolbar';
import { ChannelDescriptionComponent } from './channel-description/channel-description.component';



@Component({
  selector: 'app-message-area-header',
  standalone: true,
  imports: [MatMenuModule, MatIcon, MatToolbarModule, ChannelDescriptionComponent, MatMenuTrigger],
  templateUrl: './message-area-header.component.html',
  styleUrl: './message-area-header.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class MessageAreaHeaderComponent {
  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger = {} as MatMenuTrigger;

  closeMenu() {
    this.menuTrigger.closeMenu();
  }
}
