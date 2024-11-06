import { FirestoreDataConverter, DocumentData, DocumentSnapshot } from 'firebase/firestore';

export class ThreadMessage {
  content: string;
  messageId: string;
  time: string;
  user: { 
    userId: string;
    userName: string;
    photoURL: string;
  };
  reactions: {
    emoji: string;
    count: number;
  }[];

  constructor(
    content: string,
    userId: string,
    userName: string,
    photoURL: string,
    chatId: string,
    reactions: { emoji: string; count: number }[] = [],
    time: string = new Date().toISOString()
  ) {
    this.content = content;
    this.messageId = ThreadMessage.generateUniqueMessageId();
    this.time = time;
    this.user = { userId, userName, photoURL };
    this.reactions = reactions;
  }

  // Methode zur Generierung einer ID mit Timestamp und zufälliger Zahl
  private static generateUniqueMessageId(): string {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000) + 1; 
    return `thread_${timestamp}_${randomSuffix}`;
  }

  // Statische Methode, um ein Objekt mit der ID als Schlüssel zu erstellen
  static createWithIdAsKey(content: string, userId: string, userName: string, photoURL: string, chatId: string, reactions: { emoji: string; count: number }[] = []): { [key: string]: ThreadMessage } {
    const message = new ThreadMessage(content, userId, userName, photoURL, chatId, reactions);
    return {
      [message.messageId]: message
    };
  }

  // Firestore-Konverter für ThreadMessage
  static threadMessageConverter: FirestoreDataConverter<ThreadMessage> = {
    toFirestore(message: ThreadMessage): DocumentData {
      return {
        content: message.content,
        messageId: message.messageId,
        time: message.time,
        user: message.user,
        reactions: message.reactions,
      };
    },
    fromFirestore(snapshot: DocumentSnapshot<DocumentData>): ThreadMessage {
      const data: any = snapshot.data() as DocumentData;
      return new ThreadMessage(
        data.content,
        data.user.userId,
        data.user.userName,
        data.user.photoURL,
        snapshot.id,
        data.reactions || [],
        data.time
      );
    },
  };
}
