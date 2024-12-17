import { Component, inject, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { MessageReactionsComponent } from '../../../../../shared/components/message-reactions/message-reactions.component';
import { AttachmentPreviewComponent } from '../../../../../shared/components/attachment-preview/attachment-preview.component';
import { UserService } from '../../../../../shared/services/user-service/user.service';

@Component({
  selector: 'app-own-thread-private-message-show',
  standalone: true,
  imports: [
    NgIf,
    DatePipe,
    MessageReactionsComponent,
    NgFor,
    AttachmentPreviewComponent,
  ],
  templateUrl: './own-thread-private-message-show.component.html',
  styleUrl: './own-thread-private-message-show.component.scss',
})
export class OwnThreadPrivateMessageShowComponent {
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
