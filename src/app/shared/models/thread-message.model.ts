import { FirestoreDataConverter, DocumentData, DocumentSnapshot } from 'firebase/firestore';

export class ThreadMessage {
  content: string;
  messageId: string;
  time: string;
  userId: string;  // Nur userId anstelle des gesamten user Objekts
  reactions: {
    emoji: string;
    count: number;
    userIds: string[]; 
  }[] = [];

  constructor(
    content: string,
    userId: string,
    chatId: string,
    reactions: { emoji: string; count: number, userIds: string[] }[] = [],
    time: string = new Date().toISOString()
  ) {
    this.content = content;
    this.messageId = ThreadMessage.generateUniqueMessageId();
    this.time = time;
    this.userId = userId;  // Nur userId speichern
    this.reactions = reactions;
  }

  // Methode zur Generierung einer ID mit Timestamp und zufälliger Zahl
  private static generateUniqueMessageId(): string {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000) + 1;
    return `thread_${timestamp}_${randomSuffix}`;
  }

  // Statische Methode, um ein Objekt mit der ID als Schlüssel zu erstellen
  static createWithIdAsKey(content: string, userId: string, chatId: string, reactions: { emoji: string; count: number; userIds: string[] }[] = []): { [key: string]: ThreadMessage } {
    const message = new ThreadMessage(content, userId, chatId, reactions);
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
        userId: message.userId,  // Nur userId anstelle des gesamten Benutzerobjekts
        reactions: message.reactions.map(reaction => ({
          emoji: reaction.emoji,
          count: reaction.count,
          userIds: reaction.userIds
        })), // Mappt die Reaktionen mit allen drei Feldern
      };
    },
    fromFirestore(snapshot: DocumentSnapshot<DocumentData>): ThreadMessage {
      const data: any = snapshot.data() as DocumentData;
      return new ThreadMessage(
        data.content,
        data.userId,  // Nur userId anstelle des gesamten Benutzerobjekts
        snapshot.id,
        data.reactions || [],  // Falls keine Reaktionen vorhanden sind, wird ein leeres Array zurückgegeben
        data.time
      );
    },
  };
}
