import { FirestoreDataConverter, DocumentData, DocumentSnapshot } from "firebase/firestore";

export class ChannelMessage {
  content: string;
  messageId: string;
  reactions: {
    emoji: string;
    count: number;
  }[];
  time: string;
  user: {
    userId: string;
    userName: string;
    photoURL: string;
  };

  constructor(
    content: string,
    messageId: string,
    userId: string,
    userName: string,
    photoURL: string,
    time?: string // Zeit optional hinzufügen
  ) {
    this.content = content;
    this.messageId = messageId;
    this.reactions = [];
    this.time = time || new Date().toISOString(); // Nutze übergebenen Zeitstempel oder aktuellen
    this.user = {
      userId,
      userName,
      photoURL,
    };
  }

  channelMessageConverter: FirestoreDataConverter<ChannelMessage> = {
    toFirestore(message: ChannelMessage): DocumentData {
      return {
        content: message.content,
        messageId: message.messageId,
        reactions: message.reactions,
        time: message.time,
        user: message.user,
      };
    },
    fromFirestore(snapshot: DocumentSnapshot<DocumentData>): ChannelMessage {
      const data: any = snapshot.data() || {};
      return new ChannelMessage(
        data.content,
        data.messageId,
        data.user.userId,
        data.user.userName,
        data.user.photoURL,
        data.time // Zeitstempel beim Erstellen des Objekts verwenden
      );
    },
  };

  addReaction(emoji: string): void {
    const existingReaction = this.reactions.find((r) => r.emoji === emoji);
    if (existingReaction) {
      existingReaction.count++;
    } else {
      this.reactions.push({ emoji, count: 1 });
    }
  }
}
