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
      photoURL: string
    ) {
      this.content = content;
      this.messageId = messageId;
      this.reactions = [];
      this.time = new Date().toISOString(); // Aktueller Zeitstempel
      this.user = {
        userId,
        userName,
        photoURL,
      };
    }

    addReaction(emoji: string): void {
      const existingReaction = this.reactions.find(r => r.emoji === emoji);
      if (existingReaction) {
        existingReaction.count++;
      } else {
        this.reactions.push({ emoji, count: 1 });
      }
    }
  }
  