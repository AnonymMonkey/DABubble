import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { AttachmentPreviewComponent } from '../../../../../../shared/components/attachment-preview/attachment-preview.component';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { MessageReactionsComponent } from '../../../../../../shared/components/message-reactions/message-reactions.component';
import { UserService } from '../../../../../../shared/services/user-service/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-own-thread-message-show',
  standalone: true,
  imports: [
    NgIf,
    DatePipe,
    MessageReactionsComponent,
    NgFor,
    AttachmentPreviewComponent,
  ],
  templateUrl: './own-thread-message-show.component.html',
  styleUrl: './own-thread-message-show.component.scss',
})
export class OwnThreadMessageShowComponent implements OnInit, OnDestroy {
  @Input() message: any;
  public displayName: string = '';
  public userService = inject(UserService);
  private userDataSubscription: Subscription | undefined;
  get threadKeys(): string[] {
    return Object.keys(this.message?.thread || {});
  }

  constructor() {}

  /**
   * Initialize the component and load user data.
   */
  ngOnInit() {
    if (this.message) this.loadUserData(this.message.userId);
  }

  /**
   * Loads user data for the given user ID.
   * @param userId - The ID of the user to load data for.
   */
  loadUserData(userId: string): void {
    this.userDataSubscription = this.userService.userDataMap$.subscribe(
      (userDataMap) => {
        const userData = userDataMap.get(userId);
        if (userData) this.displayName = userData.displayName;
        else this.displayName = 'Gast';
      }
    );
  }

  /**
   * Clean up subscriptions on component destroy.
   */
  ngOnDestroy(): void {
    if (this.userDataSubscription) this.userDataSubscription.unsubscribe();
  }
}
