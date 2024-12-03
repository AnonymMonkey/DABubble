import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  constructor(private snackBar: MatSnackBar) {}
  // Methode zum Loggen von Fehlern
  logError(error: any): void {
    console.error('Error logged:', error);
  }

  // Beispiel für eine Methode zum Senden von Fehlern an einen Server (optional)
  private sendErrorToServer(error: any): void {
    console.log('Error sent to server:', error);
  }

  // Beispiel für eine Methode zum Anzeigen einer Benachrichtigung für den Benutzer (optional)
  // showUserNotification(message: string): void {
  //   alert(message); // Einfaches Beispiel: Alert-Box
  // }

  showUserNotification(message: string): void {
    this.snackBar.open(message, 'Schließen', {
      duration: 3000, // Dauer der Anzeige (in ms)
      panelClass: ['custom-snackbar'], // Optional: custom CSS-Klassen für Styling
    });
  }  
}
