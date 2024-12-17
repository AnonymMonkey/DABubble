import { ThreadMessage } from './thread-message.model';

export class PrivateChat {
  chatId: string;
  messages: ThreadMessage[];
  user: string[];
  thread: { [threadId: string]: ThreadMessage };


  constructor(
    chatId: string,
    user: string[]
  ) {
    this.chatId = chatId;
    this.messages = [];
    this.user = user;
    this.thread = {};
  }
}
