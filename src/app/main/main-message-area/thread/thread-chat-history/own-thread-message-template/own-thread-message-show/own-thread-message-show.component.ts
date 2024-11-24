import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { AttachmentPreviewComponent } from '../../../../../../shared/components/attachment-preview/attachment-preview.component';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { MessageReactionsComponent } from '../../../../../../shared/components/message-reactions/message-reactions.component';
import { ChannelService } from '../../../../../../shared/services/channel-service/channel.service';
import { UserService } from '../../../../../../shared/services/user-service/user.service';
import { ThreadService } from '../../../../../../shared/services/thread-service/thread.service';
import { MainMessageAreaComponent } from '../../../../main-message-area.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-own-thread-message-show',
  standalone: true,
  imports: [NgIf, DatePipe, MessageReactionsComponent, NgFor, AttachmentPreviewComponent],
  templateUrl: './own-thread-message-show.component.html',
  styleUrl: './own-thread-message-show.component.scss'
})
export class OwnThreadMessageShowComponent implements OnInit, OnDestroy {
  @Input() message: any;
  public displayName: string = '';
  public channelService = inject(ChannelService);
  public userService = inject(UserService);
  public threadService = inject(ThreadService);
  public mainMessageArea = inject(MainMessageAreaComponent);
  private userDataSubscription: Subscription | undefined;
  get threadKeys(): string[] {
    return Object.keys(this.message?.thread || {});
  }
  
  constructor() {}

  ngOnInit() {
    if (this.message) {
      this.loadUserData(this.message.userId);
    }
  }

  loadUserData(userId: string): void {
    this.userDataSubscription = this.userService.userDataMap$.subscribe((userDataMap) => {
      const userData = userDataMap.get(userId);
      if (userData) {
        this.displayName = userData.displayName;
      } else {
        this.displayName = 'Gast';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userDataSubscription) {
      this.userDataSubscription.unsubscribe(); // Verhindert Speicherlecks
    }
  }
}