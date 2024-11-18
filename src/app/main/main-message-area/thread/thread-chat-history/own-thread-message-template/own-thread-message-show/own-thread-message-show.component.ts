import { Component, inject, Input, OnInit } from '@angular/core';
import { AttachmentPreviewComponent } from '../../../../../../shared/components/attachment-preview/attachment-preview.component';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { MessageReactionsComponent } from '../../../../../../shared/components/message-reactions/message-reactions.component';
import { ChannelService } from '../../../../../../shared/services/channel-service/channel.service';
import { UserService } from '../../../../../../shared/services/user-service/user.service';
import { ThreadService } from '../../../../../../shared/services/thread-service/thread.service';
import { MainMessageAreaComponent } from '../../../../main-message-area.component';

@Component({
  selector: 'app-own-thread-message-show',
  standalone: true,
  imports: [NgIf, DatePipe, MessageReactionsComponent, NgFor, AttachmentPreviewComponent],
  templateUrl: './own-thread-message-show.component.html',
  styleUrl: './own-thread-message-show.component.scss'
})
export class OwnThreadMessageShowComponent implements OnInit {
  @Input() message: any;
  public displayName: string = '';
  public channelService = inject(ChannelService);
  public userService = inject(UserService);
  public threadService = inject(ThreadService);
  public mainMessageArea = inject(MainMessageAreaComponent);
  get threadKeys(): string[] {
    return Object.keys(this.message?.thread || {});
  }
  
  constructor() {}

  ngOnInit() {
    if (this.message) {
     this.userService.getUserDataByUID(this.message.userId).subscribe((data) => {
       this.displayName = data.displayName;
     });
    }
  }
}