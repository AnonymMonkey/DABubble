import {
  Component,
  ViewChild,
  ViewEncapsulation,
  AfterViewInit,
  ElementRef,
  OnInit,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MessageAreaHeaderComponent } from './message-area-header/message-area-header.component';
import { MessageAreaChatHistoryComponent } from './message-area-chat-history/message-area-chat-history.component';
import { MessageAreaNewMessageComponent } from './message-area-new-message/message-area-new-message.component';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { NgClass, NgIf } from '@angular/common';
import { ThreadComponent } from './thread/thread.component';
import { Renderer2 } from '@angular/core';
import { ChannelService } from '../../shared/services/channel-service/channel.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { MainComponent } from '../main.component';

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
export class MainMessageAreaComponent implements AfterViewInit, OnInit {
  events: string[] = [];
  opened: boolean = false;
  shouldRun = true;
  threadOpened: boolean = false;
  channelData: any;
  channelId!: string | null;
  public currentUserId!: string;

  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChild('sidenav', { read: ElementRef }) sidenavElement!: ElementRef;

  constructor(
    private renderer: Renderer2,
    private channelService: ChannelService,
    private route: ActivatedRoute,
    private main: MainComponent
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.main.userId;
  
    // Channel-Daten abonnieren
    this.channelService.channelData$.subscribe((data) => {
      this.channelData = data; // Channel-Daten speichern
    });
  
    // Überprüfen, ob sich die URL oder die channelId geändert hat
    this.route.paramMap.subscribe((params) => {
      const newChannelId = params.get('channelId');
      if (newChannelId !== this.channelId) {
        this.channelId = newChannelId; // Setze die neue Channel ID
        this.channelService.setChannel(this.channelId || ''); // Channel setzen
      }
    });
  }
  

  ngAfterViewInit() {
    // Füge box-shadow hinzu, wenn das Sidenav komplett geöffnet ist
    this.sidenav.openedStart.subscribe(() => {
      this.renderer.setStyle(
        this.sidenavElement.nativeElement,
        'box-shadow',
        '0px 2px 2px 0px rgba(0, 0, 0, 0.078)'
      );
    });

    this.sidenav.closedStart.subscribe(() => {
      this.renderer.removeStyle(
        this.sidenavElement.nativeElement,
        'box-shadow'
      );
    });
  }

  openSidenav() {
    this.sidenav.open();
    this.threadOpened = true;
  }

  closeSidenav() {
    this.sidenav.close();
    this.threadOpened = false;
  }
}
