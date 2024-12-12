import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  constructor(private snackBar: MatSnackBar) {}

  /**
   *  Logs an error.
   * @param error - The error to log
   */
  logError(error: any): void {
    console.error('Error logged:', error);
  }

  /**
   * Shows a user notification.
   * @param message - The message to show
   */
  showUserNotification(message: string): void {
    this.snackBar.open(message, 'Schließen', {
      duration: 3000,
      panelClass: ['custom-snackbar'],
    });
  }
}
