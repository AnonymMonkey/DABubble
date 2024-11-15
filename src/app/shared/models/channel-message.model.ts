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
  attachmentUrls: string[] = [];  // Array von Anhängen (URLs)

  constructor(
    content: string,
    userId: string,
    messageId: string,
    time?: string,
    attachmentUrls?: string[]  // Array von URLs für Anhänge
  ) {
    this.content = content;
    this.messageId = messageId;
    this.time = time || new Date().toISOString();
    this.userId = userId;
    this.thread = {};
    this.attachmentUrls = attachmentUrls || [];  // Setze die URLs des Anhangs (als Array)
  }

  channelMessageConverter: FirestoreDataConverter<ChannelMessage> = {
    toFirestore(message: ChannelMessage): DocumentData {
      return {
        content: message.content,
        reactions: message.reactions.map((reaction) => ({
          emoji: reaction.emoji,
          count: reaction.count,
          userIds: Array.isArray(reaction.userIds) ? reaction.userIds : [],  // Nur userIds
        })),
        time: message.time,
        userId: message.userId,
        thread: Object.fromEntries(
          Object.entries(message.thread).map(([id, t]) => [
            id,
            {
              content: t.content,
              time: t.time,
              userId: t.userId,  // Nur die userId im Thread
            },
          ])
        ),
        attachmentUrls: message.attachmentUrls,  // Array der Anhänge (URLs)
      };
    },
    fromFirestore(snapshot: DocumentSnapshot<DocumentData>): ChannelMessage {
      const data = snapshot.data() as DocumentData;
      const message = new ChannelMessage(
        data['content'],
        data['userId'],
        snapshot.id,
        data['time'],
        data['attachmentUrls'] || []  // Array von Anhängen holen (default auf leeres Array)
      );
      message.reactions = (data['reactions'] || []).map((reaction: any) => ({
        emoji: reaction.emoji,
        count: reaction.count,
        userIds: Array.isArray(reaction.userIds) ? reaction.userIds : [],  // Nur userIds
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
