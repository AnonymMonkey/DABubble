import { Component, OnInit } from '@angular/core';
import { ChannelMessage } from '../../../shared/models/channel-message.model';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, DatePipe, NgFor } from '@angular/common';
import { Firestore, FirestoreDataConverter, DocumentData, DocumentSnapshot } from '@angular/fire/firestore';
import { arrayUnion, collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserService } from '../../../shared/services/user-service/user.service';
import { ActivatedRoute } from '@angular/router';
import { PrivateChat } from '../../../shared/models/private-chat.model';
import { PrivateChatService } from '../../../shared/services/private-chat-service/private-chat.service';
import { ChannelService } from '../../../shared/services/channel-service/channel.service';
import { Channel } from '../../../shared/models/channel.model';
import { ThreadMessage } from '../../../shared/models/thread-message.model';

const channelMessageConverter: FirestoreDataConverter<ChannelMessage> = {
  toFirestore(message: ChannelMessage): DocumentData {
    return {
      content: message.content,
      messageId: message.messageId,
      reactions: message.reactions,
      time: message.time,
      user: message.user
    };
  },
  fromFirestore(snapshot: DocumentSnapshot<DocumentData>): ChannelMessage {
    const data: any = snapshot.data() || {};
    return new ChannelMessage(
      data.content,
      data.messageId,
      data.user.userId,
      data.user.userName,
      data.user.photoURL
    );
  }
};

@Component({
  selector: 'app-message-area-new-message',
  standalone: true,
  imports: [MatIconModule, FormsModule, DatePipe, NgFor, AsyncPipe],
  templateUrl: './message-area-new-message.component.html',
  styleUrls: ['./message-area-new-message.component.scss'],
})
export class MessageAreaNewMessageComponent implements OnInit {
  newMessageContent = '';
  channelId?: string;
  privateChatId?: string;
  userId?: string;
  userName?: string;
  photoURL?: string;
  channel: Channel | undefined;
  
  // Map zur Speicherung der Nachrichtenzähler pro privateChatId
  private static privateChatCounters: Map<string, number> = new Map();

  constructor(
    private firestore: Firestore,
    private userService: UserService,
    private route: ActivatedRoute,
    private privateChatService: PrivateChatService,
    private channelService: ChannelService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      this.userId = this.userService.userId;
      this.privateChatId = params.get('privateChatId') || undefined;
      this.channelId = params.get('channelId') || undefined;

      if (this.channelId) {
        this.channelService.getChannelById(this.channelId).subscribe(channel => {
          if (channel) {
            this.channel = channel;
          } else {
            console.error('Channel existiert nicht.');
          }
        });
      }

      this.getUserData();
    });
  }

  getUserData() {
    if (!this.userId) return;

    this.userService.getUserDataByUID(this.userId).subscribe({
      next: userData => {
        this.userName = userData?.displayName;
        this.photoURL = userData?.photoURL;
      },
      error: error => console.error('Fehler beim Abrufen der Benutzerdaten:', error)
    });
  }

  private static generatePrivateMessageId(): string {;
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const randomNumber = Math.floor(Math.random() * 1000) + 1;
    return `msg_${timestamp}_${randomNumber}`;
}


  async sendMessage() {
    if (!this.newMessageContent) return;

    const messageId = this.privateChatId
      ? MessageAreaNewMessageComponent.generatePrivateMessageId()
      : `msg_${Date.now()}`;

    const newMessage = new ChannelMessage(
      this.newMessageContent,
      this.userId || '',
      this.userName || '',
      this.photoURL || '',
      messageId
    );

    if (this.privateChatId) {
      await this.sendPrivateChatMessage(newMessage);
    } else if (this.channelId) {
      this.channel?.addMessage(messageId, newMessage);
      await this.sendChannelMessage(newMessage);
    } else {
      console.error('Weder privateChatId noch channelId ist definiert.');
    }

    this.newMessageContent = '';
  }

  private async sendChannelMessage(newMessage: ChannelMessage) {
    const messagesRef = collection(this.firestore, `channels/${this.channelId}/messages`);
    try {
      const newMessageDocRef = doc(messagesRef, newMessage.messageId);
      await setDoc(newMessageDocRef, channelMessageConverter.toFirestore(newMessage));
      this.channel?.addMessage(newMessage.messageId, newMessage);
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht im Channel:', error);
    }
  }

  private async sendPrivateChatMessage(newMessage: ThreadMessage) {
    const [userId1, userId2] = this.privateChatId!.split('_');
    const isSelfMessage = this.userId === userId1;

    // Aktuelles Benutzerdokument abrufen
    const userDocRef = doc(this.firestore, `users/${this.userId}`);
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
        console.error('Benutzerdokument existiert nicht.');
        return;
    }

    // Generiere eine neue Nachricht ID mit Timestamp und random number
    const newMessageId = MessageAreaNewMessageComponent.generatePrivateMessageId();

    // Nachricht zum messages-Objekt des spezifischen Chats hinzufügen
    await updateDoc(userDocRef, {
        [`privateChat.${this.privateChatId}.messages.${newMessageId}`]: {
            content: newMessage.content,
            messageId: newMessageId,
            reactions: newMessage.reactions,
            time: newMessage.time,
            user: {
                userId: this.userId,
                userName: this.userName,
                photoURL: this.photoURL,
            },
        }
    });

    // Wenn die Nachricht nicht vom aktuellen Benutzer stammt, speichere sie auch im anderen Benutzer-Dokument
    const otherUserId = isSelfMessage ? userId2 : userId1; // Bestimme die ID des anderen Benutzers
    const otherUserDocRef = doc(this.firestore, `users/${otherUserId}`);

    await updateDoc(otherUserDocRef, {
        [`privateChat.${this.privateChatId}.messages.${newMessageId}`]: {
            content: newMessage.content,
            messageId: newMessageId,
            reactions: newMessage.reactions,
            time: newMessage.time,
            user: {
                userId: this.userId,
                userName: this.userName,
                photoURL: this.photoURL,
            },
        }
    });
  }

private async getLastMessageId(chatId: string): Promise<number | null> {
  const userDocRef = doc(this.firestore, `users/${this.userId}`);
  const userSnapshot = await getDoc(userDocRef);

  if (!userSnapshot.exists()) {
      console.error('Benutzerdokument existiert nicht.');
      return null;
  }

  const chatData = userSnapshot.data()?.['privateChat'][chatId]?.messages;

  if (chatData) {
    // Die IDs der Nachrichten abrufen und die letzte ID finden
    const messageIds = Object.keys(chatData).map(id => parseInt(id.replace('msg_', ''))); // IDs in Zahlen umwandeln
    if (messageIds.length > 0) {
        const lastMessageId = Math.max(...messageIds); // Höchste ID finden
        return lastMessageId; // Rückgabe der letzten ID
    }
  }

  return null; // Falls keine Nachrichten vorhanden sind
}

}
