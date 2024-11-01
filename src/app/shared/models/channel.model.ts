import { ChannelMessage } from './channel-message.model'; // Stelle sicher, dass der Pfad korrekt ist

export class Channel {
  admin: {
    userId: string;
    userName: string;
    photoURL: string;
  };
  channelId: string;
  channelName: string;
  description: string;
  members: {
    userId: string;
    userName: string;
    photoURL: string;
  }[];
  messages: { [messageId: string]: ChannelMessage };  //ANCHOR - messageId vor den einzelnen Nachrichten

  constructor(
    admin: { userId: string; userName: string; photoURL: string } = {
      userId: '',
      userName: '',
      photoURL: '',
    },
    channelId: string = '',
    channelName: string = '',
    description: string = '',
    members: { userId: string; userName: string; photoURL: string }[] = [],
    messages: { [messageId: string]: ChannelMessage } = {} // Verwende das neue Objekt
  ) {
    this.admin = admin;
    this.channelId = channelId;
    this.channelName = channelName;
    this.description = description;
    this.members = members;
    this.messages = messages; // Setze die Nachrichten
  }

  addMessage(messageId: string, message: ChannelMessage) {
    // Setze die messageId direkt in der Nachricht und füge sie in das Dictionary ein
    message.messageId = messageId;
    this.messages[messageId] = message;
  }
}
