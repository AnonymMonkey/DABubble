import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { NewMessageHeaderComponent } from './new-message-header/new-message-header.component';
import { NewMessagePlaceholderNewMessageComponent } from './new-message-placeholder-new-message/new-message-placeholder-new-message.component';
import { CommonModule } from '@angular/common';
import { BehaviorService } from '../../shared/services/behavior-service/behavior.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-message-placeholder',
  standalone: true,
  imports: [
    MatCardModule,
    CommonModule,
    NewMessageHeaderComponent,
    NewMessagePlaceholderNewMessageComponent,
  ],
  templateUrl: './new-message-placeholder.component.html',
  styleUrl: './new-message-placeholder.component.scss',
})
export class NewMessagePlaceholderComponent {
  behaviorService = inject(BehaviorService);
  sideNavOpened = true;
  subscription!: Subscription;

  /**
   * Subscribe to the sideNavOpened$ observable and update the sideNavOpened property.
   */
  ngOnInit(): void {
    this.subscription = this.behaviorService.sideNavOpened$.subscribe(
      (value) => {
        this.sideNavOpened = value;
      }
    );
  }

  /**
   * Clean up subscriptions on component destroy.
   */
  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }
}
