import { ChannelMessage } from "./channel-message.model";

export class Channel {
  admin: {
    userId: string;
  };
  channelId: string;
  channelName: string;
  description: string;
  members: string[] = []; 
  messages: { [messageId: string]: ChannelMessage } = {};
  usersLeft: string[] = [];

  constructor(
    admin: { userId: string } = { userId: '' },
    channelId: string = '',
    channelName: string = '',
    description: string = '',
    members: string[] = [], 
    messages: { [messageId: string]: ChannelMessage } = {},
    usersLeft: string[] = [],
  ) {
    this.admin = admin;
    this.channelId = channelId;
    this.channelName = channelName;
    this.description = description;
    this.members = members;
    this.messages = messages;
    this.usersLeft = usersLeft;
  }

  addMessage(messageId: string, message: ChannelMessage) {
    message.messageId = messageId;
    this.messages[messageId] = message;
  }
}
