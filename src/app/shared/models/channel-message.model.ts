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
  attachmentUrl?: string;  // Optionales Feld für die Anhänge (z.B. Bild oder PDF)

  constructor(
    content: string,
    userId: string,
    messageId: string,
    time?: string,
    attachmentUrl?: string
  ) {
    this.content = content;
    this.messageId = messageId;
    this.time = time || new Date().toISOString();
    this.userId = userId;
    this.thread = {};
    this.attachmentUrl = attachmentUrl;  // Setze URL des Anhangs
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
