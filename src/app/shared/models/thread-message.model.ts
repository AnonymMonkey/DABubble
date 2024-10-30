import { FirestoreDataConverter, DocumentData, DocumentSnapshot } from 'firebase/firestore';

export class ThreadMessage {
  content: string;
  messageId: string; // ID der Thread-Nachricht
  time: string;
  user: {
    userId: string;
    userName: string;
    photoURL: string;
  };
  reactions: {
    emoji: string;
    count: number;
  }[]; // Array für Reaktionen

  constructor(
    content: string,
    userId: string,
    userName: string,
    photoURL: string,
    messageId: string,
    reactions: { emoji: string; count: number }[] = [], // Standardwert als leeres Array
    time?: string
  ) {
    this.content = content;
    this.messageId = messageId;
    this.time = time || new Date().toISOString();
    this.user = {
      userId,
      userName,
      photoURL,
    };
    this.reactions = reactions; // Reaktionen initialisieren
  }

  // Statische Firestore-Konverter für ThreadMessage
  static threadMessageConverter: FirestoreDataConverter<ThreadMessage> = {
    toFirestore(message: ThreadMessage): DocumentData {
      return {
        content: message.content,
        messageId: message.messageId,
        time: message.time,
        user: message.user,
        reactions: message.reactions, // Füge Reaktionen hinzu
      };
    },
    fromFirestore(snapshot: DocumentSnapshot<DocumentData>): ThreadMessage {
      const data: any = snapshot.data() as DocumentData;
      return new ThreadMessage(
        data.content,
        data.user.userId,
        data.user.userName,
        data.user.photoURL,
        data.messageId,
        data.reactions || [], // Reaktionen aus dem Snapshot holen
        data.time
      );
    },
  };
}
