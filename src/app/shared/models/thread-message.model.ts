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
  attachmentUrl?: string;  // Optional für den Anhang

  constructor(
    content: string,
    userId: string,
    chatId: string,
    reactions: { emoji: string; count: number, userIds: string[] }[] = [],
    time: string = new Date().toISOString(),
    attachmentUrl?: string  // optionaler Parameter für den Anhang
  ) {
    this.content = content;
    this.messageId = ThreadMessage.generateUniqueMessageId();
    this.time = time;
    this.userId = userId;  // Nur userId speichern
    this.reactions = reactions;
    this.attachmentUrl = attachmentUrl;  // Anhang URL speichern
  }

  // Methode zur Generierung einer ID mit Timestamp und zufälliger Zahl
  private static generateUniqueMessageId(): string {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000) + 1;
    return `thread_${timestamp}_${randomSuffix}`;
  }

  // Statische Methode, um ein Objekt mit der ID als Schlüssel zu erstellen
  static createWithIdAsKey(content: string, userId: string, chatId: string, reactions: { emoji: string; count: number; userIds: string[] }[] = [], attachmentUrl?: string): { [key: string]: ThreadMessage } {
    const message = new ThreadMessage(content, userId, chatId, reactions, undefined, attachmentUrl);
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
        attachmentUrl: message.attachmentUrl || null  // Speichert den Anhang-Link (optional)
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
        data.attachmentUrl  // Holt die Attachment-URL aus den Daten
      );
    },
  };
}
