import { User } from 'firebase/auth';
import { FieldValue, Timestamp } from 'firebase/firestore';
import { PrivateChat } from './private-chat.model';

export class UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  lastLogin: FieldValue | Timestamp;
  channels: string[] = [];
  privateChat: { [chatId: string]: PrivateChat } = {};

  constructor(user: User, displayName?: string, channels: string[] = []) {
    this.uid = user.uid;
    this.email = user.email || '';
    this.displayName = user.displayName || displayName || '';
    this.photoURL = user.photoURL || 'assets/img/profile/placeholder-img.webp';
    this.lastLogin = Timestamp.now();
    this.channels = channels;
  }

  /**
   * Formats the display name
   * @returns the formatted display name
   */
  formatDisplayName(): string {
    return this.displayName
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
