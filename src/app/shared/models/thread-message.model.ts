import { FirestoreDataConverter, DocumentData, DocumentSnapshot } from 'firebase/firestore';

export class ThreadMessage {
  content: string;
  messageId: string;
  time: string;
  userId: string;
  reactions: {
    emoji: string;
    count: number;
    userIds: string[]; 
  }[] = [];
  attachmentUrls?: string[];

  constructor(
    content: string,
    userId: string,
    chatId: string,
    reactions: { emoji: string; count: number, userIds: string[] }[] = [],
    time: string = new Date().toISOString(),
    attachmentUrls?: string[]
  ) {
    this.content = content;
    this.messageId = ThreadMessage.generateUniqueMessageId();
    this.time = time;
    this.userId = userId;
    this.reactions = reactions;
    this.attachmentUrls = attachmentUrls; 
  }

  /**
   * Generates a unique message ID.
   */
  private static generateUniqueMessageId(): string {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000) + 1;
    return `thread_${timestamp}_${randomSuffix}`;
  }


  /**
   * Creates a ThreadMessage object with a unique ID as the key.
   * @param {string} content - The content of the message.
   * @param {string} userId - The ID of the user who sent the message.
   * @param {string} chatId - The ID of the chat where the message was sent.
   * @param {Object[]} reactions - An array of reaction objects.
   * @param {string} attachmentUrls - An array of attachment URLs.
   * @returns {Object} An object with a unique ID as the key and the ThreadMessage object as the value.
   */
  static createWithIdAsKey(content: string, userId: string, chatId: string, reactions: { emoji: string; count: number; userIds: string[] }[] = [], attachmentUrls?: string[]): { [key: string]: ThreadMessage } {
    const message = new ThreadMessage(content, userId, chatId, reactions, undefined, attachmentUrls);
    return {
      [message.messageId]: message
    };
  }

  /**
   * Firebase Firestore data converter for ThreadMessage objects.
   * @type {FirestoreDataConverter<ThreadMessage>}
   * @readonly
   */
  static threadMessageConverter: FirestoreDataConverter<ThreadMessage> = {
    toFirestore(message: ThreadMessage): DocumentData {
      return {
        content: message.content,
        messageId: message.messageId,
        time: message.time,
        userId: message.userId,
        reactions: message.reactions.map(reaction => ({
          emoji: reaction.emoji,
          count: reaction.count,
          userIds: reaction.userIds
        })),
        attachmentUrls: message.attachmentUrls || [] 
      };
    },
    fromFirestore(snapshot: DocumentSnapshot<DocumentData>): ThreadMessage {
      const data: any = snapshot.data() as DocumentData;
      return new ThreadMessage(
        data.content,
        data.userId, 
        snapshot.id,
        data.reactions || [],
        data.time,
        data.attachmentUrls || []
      );
    },
  };
}
