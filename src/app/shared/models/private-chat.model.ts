import { ChannelMessage } from "./channel-message.model";

export class PrivateChat {
    chatId: string; // Eindeutige ID des privaten Chats
    messages: ChannelMessage[]; // Array von Nachrichten im privaten Chat
    user: {
        userId: string;
        userName: string;
        photoURL: string;
      }[];
  
    constructor(chatId: string) {
      this.chatId = chatId;
      this.messages = []; // Initialisiere mit leerem Nachrichten-Array
      this.user = [];
    }
  }
  