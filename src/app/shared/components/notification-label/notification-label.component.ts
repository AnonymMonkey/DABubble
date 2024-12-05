import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification-service/notification.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-label',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-label.component.html',
  styleUrl: './notification-label.component.scss',
})
export class NotificationLabelComponent implements OnInit {
  message: string | null = null;
  isAnimating: boolean = false;

  constructor(private notificationService: NotificationService) {}

  /**
   * Initialises the component
   */
  ngOnInit() {
    this.notificationService.getNotificationObservable().subscribe((msg) => {
      if (!this.isAnimating) {
        this.message = msg;
        this.isAnimating = true;

        setTimeout(() => {
          this.message = null;
          this.isAnimating = false;
        }, 2000);
      }
    });
  }
}
