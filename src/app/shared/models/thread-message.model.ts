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
  attachmentUrls?: string[];  // Array von Anhängen (optional)

  constructor(
    content: string,
    userId: string,
    chatId: string,
    reactions: { emoji: string; count: number, userIds: string[] }[] = [],
    time: string = new Date().toISOString(),
    attachmentUrls?: string[]  // optionales Array für Anhänge
  ) {
    this.content = content;
    this.messageId = ThreadMessage.generateUniqueMessageId();
    this.time = time;
    this.userId = userId;  // Nur userId speichern
    this.reactions = reactions;
    this.attachmentUrls = attachmentUrls;  // Array von Anhängen speichern
  }

  // Methode zur Generierung einer ID mit Timestamp und zufälliger Zahl
  private static generateUniqueMessageId(): string {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000) + 1;
    return `thread_${timestamp}_${randomSuffix}`;
  }

  // Statische Methode, um ein Objekt mit der ID als Schlüssel zu erstellen
  static createWithIdAsKey(content: string, userId: string, chatId: string, reactions: { emoji: string; count: number; userIds: string[] }[] = [], attachmentUrls?: string[]): { [key: string]: ThreadMessage } {
    const message = new ThreadMessage(content, userId, chatId, reactions, undefined, attachmentUrls);
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
        attachmentUrls: message.attachmentUrls || []  // Speichert das Array von Anhängen
      };
    },
    fromFirestore(snapshot: DocumentSnapshot<DocumentData>): ThreadMessage {
      const data: any = snapshot.data() as DocumentData;
      return new ThreadMessage(
        data.content,
        data.userId,  // Nur userId anstelle des gesamten Benutzerobjekts
        snapshot.id,
        data.reactions || [],  // Falls keine Reaktionen vorhanden sind, wird ein leeres Array zurückgegeben
        data.time,
        data.attachmentUrls || []  // Holt das Array von Anhängen (oder ein leeres Array, wenn keine Anhänge vorhanden sind)
      );
    },
  };
}
