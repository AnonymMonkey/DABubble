import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  // Methode zum Loggen von Fehlern
  logError(error: any): void {
    // Hier kannst du das Fehler-Handling anpassen, je nach Bedarf
    // Beispiel: Fehler in der Konsole anzeigen
    console.error('Error logged:', error);

    // Optional: Fehler an einen externen Service senden (z.B. ein Logging-API)
    // this.sendErrorToServer(error);

    // Optional: Benutzer informieren (Toast, Snackbar etc.)
    // this.showUserNotification('Ein Fehler ist aufgetreten.');
  }

  // Beispiel für eine Methode zum Senden von Fehlern an einen Server (optional)
  private sendErrorToServer(error: any): void {
    // Implementiere hier den Code, um Fehler an einen externen Dienst zu senden
    console.log('Error sent to server:', error);
  }

  // Beispiel für eine Methode zum Anzeigen einer Benachrichtigung für den Benutzer (optional)
  private showUserNotification(message: string): void {
    // Implementiere hier die Logik zur Anzeige von Benachrichtigungen
    alert(message); // Einfaches Beispiel: Alert-Box
  }
}
