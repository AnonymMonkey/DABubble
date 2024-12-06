import { FirestoreDataConverter, DocumentSnapshot } from "firebase/firestore";
import { ThreadMessage } from "./thread-message.model";
import { DocumentData } from "rxfire/firestore/interfaces";

export class ChannelMessage {
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

  channelMessageConverter: FirestoreDataConverter<ChannelMessage> = {
    toFirestore(message: ChannelMessage): DocumentData {
      return {
        content: message.content,
        reactions: message.reactions.map((reaction) => ({
          emoji: reaction.emoji,
          count: reaction.count,
          userIds: Array.isArray(reaction.userIds) ? reaction.userIds : [], 
        })),
        time: message.time,
        userId: message.userId,
        thread: Object.fromEntries(
          Object.entries(message.thread).map(([id, t]) => [
            id,
            {
              content: t.content,
              time: t.time,
              userId: t.userId,
            },
          ])
        ),
        attachmentUrls: message.attachmentUrls,
      };
    },
    fromFirestore(snapshot: DocumentSnapshot<DocumentData>): ChannelMessage {
      const data = snapshot.data() as DocumentData;
      const message = new ChannelMessage(
        data['content'],
        data['userId'],
        snapshot.id,
        data['time'],
        data['attachmentUrls'] || []
      );
      message.reactions = (data['reactions'] || []).map((reaction: any) => ({
        emoji: reaction.emoji,
        count: reaction.count,
        userIds: Array.isArray(reaction.userIds) ? reaction.userIds : [], 
      }));
      message.thread = Object.fromEntries(
        Object.entries(data['thread'] || {}).map(([id, threadData]: [string, any]) => [
          id,
          new ThreadMessage(
            threadData.content,
            threadData.userId,
            threadData.time
          ),
        ])
      );
      return message;
    },
  };
}
