import { Component, inject, Input } from '@angular/core';
import { ChannelService } from '../../../../../shared/services/channel-service/channel.service';
import { NgIf, DatePipe } from '@angular/common';
import { ThreadService } from '../../../../../shared/services/thread-service/thread.service';
import { MainMessageAreaComponent } from '../../../main-message-area.component';

@Component({
  selector: 'app-own-message-show',
  standalone: true,
  imports: [NgIf, DatePipe],
  templateUrl: './own-message-show.component.html',
  styleUrl: './own-message-show.component.scss'
})
export class OwnMessageShowComponent {
  @Input() message: any;
  public channelService = inject(ChannelService);
  public threadService = inject(ThreadService);
  public mainMessageArea = inject(MainMessageAreaComponent);

  constructor() {}

  getLastReplyTime(messages: any[]): string {
    return messages[messages.length - 1].time;
  }
}
