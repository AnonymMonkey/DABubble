import { FirestoreDataConverter, DocumentSnapshot } from "firebase/firestore";
import { ThreadMessage } from "./thread-message.model";
import { DocumentData } from "rxfire/firestore/interfaces";

export class ChannelMessage {
  content: string;
  messageId: string;
  reactions: { 
    emoji: any; 
    count: number; 
    userIds: string[]; // Nur die userIds, die das Emoji gewählt haben
  }[] = [];
  time: string;
  userId: string;  // Nur userId anstelle von einem kompletten user Objekt
  thread: { [threadId: string]: ThreadMessage };  // Nur die userIds im Thread

  constructor(
    content: string,
    userId: string,
    messageId: string,
    time?: string
  ) {
    this.content = content;
    this.messageId = messageId;
    this.time = time || new Date().toISOString();
    this.userId = userId;  // Nur userId speichern
    this.thread = {};
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
        userId: message.userId,  // Nur die userId wird gespeichert
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
      };
    },
    fromFirestore(snapshot: DocumentSnapshot<DocumentData>): ChannelMessage {
      const data = snapshot.data() as DocumentData;
      const message = new ChannelMessage(
        data['content'],
        data['userId'],  // Nur die userId wird verwendet
        snapshot.id,
        data['time']
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
            threadData.userId,  // Nur userId im Thread
            threadData.time
          ),
        ])
      );
      return message;
    },
  };
}
