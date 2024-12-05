import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationSubject = new Subject<string>();

  /**
   *  Returns the notification observable
   * @returns - The notification observable
   */
  getNotificationObservable() {
    return this.notificationSubject.asObservable();
  }

  /**
   * Shows a notification
   * @param message - The message to show
   */
  showNotification(message: string) {
    this.notificationSubject.next(message);
  }
}
