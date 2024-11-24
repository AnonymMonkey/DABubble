import { User } from 'firebase/auth';
import { FieldValue, Timestamp } from 'firebase/firestore';
import { PrivateChat } from './private-chat.model';

export class UserData {
  uid: string; // Eindeutige Benutzer-ID
  email: string; // E-Mail-Adresse des Benutzers
  displayName: string; // Formatierter Anzeigename des Benutzers
  photoURL: string; // URL des Profilbildes
  lastLogin: FieldValue | Timestamp; // Zeitpunkt des letzten Logins
  channels: string[] = []; // Liste der Channels, denen der Benutzer zugeordnet ist
  privateChat: { [chatId: string]: PrivateChat } = {};

  constructor(user: User, displayName?: string, channels: string[] = []) {
    // Initialisiert die Benutzerdaten aus dem Firebase `User` Objekt
    this.uid = user.uid;
    this.email = user.email || ''; // Setzt die E-Mail-Adresse oder einen leeren String
    this.displayName = user.displayName || displayName || ''; // Setzt den Anzeigenamen, falls verfügbar
    this.photoURL = user.photoURL || 'assets/img/profile/placeholder-img.webp'; // Setzt das Profilbild, falls verfügbar
    this.lastLogin = Timestamp.now(); // Setzt den aktuellen Zeitpunkt als letzten Login
    this.channels = channels;
  }

  // Formatiert den Anzeigenamen, indem der erste Buchstabe jedes Wortes großgeschrieben wird
  formatDisplayName(): string {
    return this.displayName
      .trim() // Entfernt Leerzeichen am Anfang und Ende
      .replace(/\s+/g, ' ') // Ersetzt mehrere aufeinanderfolgende Leerzeichen durch ein einzelnes
      .split(' ') // Teilt den Namen in Wörter auf
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Erster Buchstabe groß, Rest klein
      .join(' '); // Fügt die Wörter wieder zusammen
  }
}
