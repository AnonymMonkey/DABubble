// import { ChannelMessage } from "./channel-message.model";
// import { ThreadMessage } from "./thread-message.model";

// export class PrivateChat {
//   chatId: string; // Eindeutige ID des privaten Chats
//   messages: ThreadMessage[]; // Array von Nachrichten im privaten Chat
//   user: {
//     userId: string;
//     userName: string;
//     photoURL: string;
//   }[];

//   constructor(chatId: string, user: { userId: string; userName: string; photoURL: string; }[]) {
//     this.chatId = chatId;
//     this.messages = []; // Initialisiere mit leerem Nachrichten-Array
//     this.user = user;
//   }

// //ANCHOR - Robin - Statische Methode, um ein Objekt mit der ID als Schlüssel außen und innen zu erstellen
//   static createWithIdAsKey(chatId: string, user: { userId: string; userName: string; photoURL: string; }[]) {
//     return {
//       [chatId]: new PrivateChat(chatId, user) // Die `chatId` wird sowohl als Schlüssel außen als auch als Attribut im Objekt verwendet
//     };
//   }
// }

import { ChannelMessage } from "./channel-message.model";
import { ThreadMessage } from "./thread-message.model";

export class PrivateChat {
  private static currentId = 1; // Start-ID

  chatId: string; // Eindeutige ID des privaten Chats
  messages: ThreadMessage[]; // Array von Nachrichten im privaten Chat
  user: {
    userId: string;
    userName: string;
    photoURL: string;
  }[];

  constructor(chatId: string, user: { userId: string; userName: string; photoURL: string; }[]) {
    this.chatId = chatId;
    this.messages = []; // Initialisiere mit leerem Nachrichten-Array
    this.user = user;
  }
}

