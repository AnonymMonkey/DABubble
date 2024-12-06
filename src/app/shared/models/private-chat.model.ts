import { ThreadMessage } from './thread-message.model';

export class PrivateChat {
  chatId: string;
  messages: ThreadMessage[];
  user: string[];


  constructor(
    chatId: string,
    user: string[]
  ) {
    this.chatId = chatId;
    this.messages = [];
    this.user = user;
  }
}
