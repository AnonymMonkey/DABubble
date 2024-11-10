import { ChannelMessage } from "./channel-message.model";

export class Channel {
  admin: {
    userId: string;
  };
  channelId: string;
  channelName: string;
  description: string;
  members: string[] = [];  // Standardwert ist ein leeres Array
  messages: { [messageId: string]: ChannelMessage } = {};

  constructor(
    admin: { userId: string } = { userId: '' },
    channelId: string = '',
    channelName: string = '',
    description: string = '',
    members: string[] = [],  // Standardwert ist ein leeres Array
    messages: { [messageId: string]: ChannelMessage } = {}
  ) {
    this.admin = admin;
    this.channelId = channelId;
    this.channelName = channelName;
    this.description = description;
    this.members = members;
    this.messages = messages;
  }

  addMessage(messageId: string, message: ChannelMessage) {
    message.messageId = messageId;
    this.messages[messageId] = message;
  }
}
