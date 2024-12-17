import { ThreadMessage } from "./thread-message.model";

export class PrivateChatMessage {
  content: string;
  messageId: string;
  reactions: { 
    emoji: any; 
    count: number; 
    userIds: string[]; 
  }[] = [];
  time: string;
  userId: string;
  thread: { [threadId: string]: ThreadMessage };
  attachmentUrls: string[] = [];

  constructor(
    content: string,
    userId: string,
    messageId: string,
    time?: string,
    attachmentUrls?: string[], 
    reactions?: { emoji: any; count: number; userIds: string[] }[]
  ) {
    this.content = content;
    this.messageId = messageId;
    this.time = time || new Date().toISOString();
    this.userId = userId;
    this.thread = {};
    this.attachmentUrls = attachmentUrls || []; 
    this.reactions = reactions || [];
  }
}