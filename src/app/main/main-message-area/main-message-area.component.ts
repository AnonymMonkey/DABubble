import { Component, ViewChild, ViewEncapsulation, AfterViewInit, ElementRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MessageAreaHeaderComponent } from './message-area-header/message-area-header.component';
import { MessageAreaChatHistoryComponent } from './message-area-chat-history/message-area-chat-history.component';
import { MessageAreaNewMessageComponent } from './message-area-new-message/message-area-new-message.component';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { NgClass, NgIf } from '@angular/common';
import { ThreadComponent } from './thread/thread.component';
import { Renderer2 } from '@angular/core';
import { ChannelService } from '../../shared/services/channel-service/channel.service';

@Component({
  selector: 'app-main-message-area',
  standalone: true,
  imports: [
    MatCardModule,
    NgIf,
    NgClass,
    ThreadComponent,
    MessageAreaHeaderComponent,
    MessageAreaChatHistoryComponent,
    MessageAreaNewMessageComponent,
    MatSidenavModule,
  ],
  templateUrl: './main-message-area.component.html',
  styleUrls: ['./main-message-area.component.scss'],
})
export class MainMessageAreaComponent implements AfterViewInit {
  events: string[] = [];
  opened: boolean = false;
  shouldRun = true;
  threadOpened: boolean = false;

  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChild('sidenav', { read: ElementRef }) sidenavElement!: ElementRef;

  constructor(private renderer: Renderer2, private channelService: ChannelService) {}

  ngAfterViewInit() {
    this.channelService.setChannel('aWD9P0ibWthJ7zAqdMYw');  //ANCHOR -  Setze den Channel in der Sidebar - für Semir.


    // Füge box-shadow hinzu, wenn das Sidenav komplett geöffnet ist
    this.sidenav.openedStart.subscribe(() => {
      this.renderer.setStyle(
        this.sidenavElement.nativeElement,
        'box-shadow',
        '0px 2px 2px 0px rgba(0, 0, 0, 0.078)',
      );
    });

    this.sidenav.closedStart.subscribe(() => {
      this.renderer.removeStyle(this.sidenavElement.nativeElement, 'box-shadow');
    });
  }

  toggleSidenav() {
    this.sidenav.toggle();
    this.threadOpened = !this.threadOpened;
  }
}
