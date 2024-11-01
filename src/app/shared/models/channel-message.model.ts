import { FirestoreDataConverter, DocumentSnapshot } from "firebase/firestore";
import { ThreadMessage } from "./thread-message.model";
import { DocumentData } from "rxfire/firestore/interfaces";

export class ChannelMessage {
  content: string;
  messageId: string; // Haupt-ID der Nachricht
  reactions: {
    emoji: string;
    count: number;
  }[] = [];
  time: string;
  user: {
    userId: string;
    userName: string;
    photoURL: string;
  };
  
  thread: { [threadId: string]: ThreadMessage }; //ANCHOR Objekt für Thread-Nachrichten mit threadId als Schlüssel

  constructor(
    content: string,
    userId: string,
    userName: string,
    photoURL: string,
    messageId: string, // ID-Format für Channel Message
    time?: string
  ) {
    this.content = content;
    this.messageId = messageId; // Verwende die übergebene messageId
    this.time = time || new Date().toISOString();
    this.user = {
      userId,
      userName,
      photoURL,
    };
    this.thread = {}; // Initialisiere das thread-Objekt als leeres Objekt
  }

  // Firestore-Konverter für ChannelMessage
 // Firestore-Konverter für ChannelMessage
channelMessageConverter: FirestoreDataConverter<ChannelMessage> = {
  toFirestore(message: ChannelMessage): DocumentData {
    return {
      content: message.content,
      reactions: message.reactions,
      time: message.time,
      user: message.user,
      thread: Object.fromEntries(
        Object.entries(message.thread).map(([id, t]) => [
          id, // Die threadId als Schlüssel
          {
            content: t.content,
            time: t.time,
            user: t.user,
          }
        ])
      ),
    };
  },
  fromFirestore(snapshot: DocumentSnapshot<DocumentData>): ChannelMessage {
    const data: any = snapshot.data() as DocumentData;
    const message = new ChannelMessage(
      data.content,
      data.user.userId,
      data.user.userName,
      data.user.photoURL,
      snapshot.id, // Verwende die ID des Dokuments als messageId
      data.time
    );
    message.thread = Object.fromEntries(
      Object.entries(data.thread || {}).map(([id, threadData]: [string, any]) => [
        id, // Verwende die ID aus dem Schlüssel
        new ThreadMessage(
          threadData.content,
          threadData.user.userId,
          threadData.user.userName,
          threadData.user.photoURL,
          id, // Verwende die threadId aus dem Schlüssel
          threadData.time
        )
      ])
    );
    return message;
  }
};
}
