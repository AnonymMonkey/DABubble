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

  // Map, um für jeden Chat eine eigene ID-Nummerierung zu speichern
  private static chatIdCounters: Map<string, number> = new Map();

  constructor(
    content: string,
    userId: string,
    userName: string,
    photoURL: string,
    chatId: string,
    reactions: { emoji: string; count: number }[] = [],
    time?: string
  ) {
    this.content = content;
    this.messageId = ThreadMessage.generateMessageId(chatId); // Generiere eine ID spezifisch für diesen Chat
    this.time = time || new Date().toISOString();
    this.user = { userId, userName, photoURL };
    this.reactions = reactions;
  }

  // Methode, die eine neue, aufsteigende ID für jeden Chat zurückgibt
  private static generateMessageId(chatId: string): string {
    const randomCount = Math.floor(Math.random() * 1000) + 1; 
    return `thread_${randomCount}_${Date.now()}`; // Generierung einer ID mit Timestamp
  }

  // Statische Methode, um ein Objekt mit der ID als Schlüssel außen und innen zu erstellen
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
        snapshot.id, // Verwenden Sie die Dokument-ID als messageId
        data.reactions || [],
        data.time
      );
    },
  };
}
