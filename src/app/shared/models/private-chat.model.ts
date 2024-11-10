import { ThreadMessage } from './thread-message.model';

export class PrivateChat {
  chatId: string; // Eindeutige ID des privaten Chats
  messages: ThreadMessage[]; // Array von Nachrichten im privaten Chat
  user: string[]; // Array von userIds der Benutzer im privaten Chat


  constructor(
    chatId: string,
    user: string[] // Nur userIds der Benutzer im Chat
  ) {
    this.chatId = chatId;
    this.messages = []; // Initialisiere mit leerem Nachrichten-Array
    this.user = user; // Setze die userIds der Benutzer
  }
}
