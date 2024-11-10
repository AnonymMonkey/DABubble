import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ChannelMessage } from '../../../shared/models/channel-message.model';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Firestore, FirestoreDataConverter, DocumentData, DocumentSnapshot } from '@angular/fire/firestore';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserService } from '../../../shared/services/user-service/user.service';
import { ActivatedRoute } from '@angular/router';
import { PrivateChatService } from '../../../shared/services/private-chat-service/private-chat.service';
import { ChannelService } from '../../../shared/services/channel-service/channel.service';
import { Channel } from '../../../shared/models/channel.model';
import { ThreadMessage } from '../../../shared/models/thread-message.model';
import { PickerComponent, PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { MatMenu, MatMenuModule } from '@angular/material/menu';


const channelMessageConverter: FirestoreDataConverter<ChannelMessage> = {
  toFirestore(message: ChannelMessage): DocumentData {
    return {
      content: message.content,
      messageId: message.messageId,
      reactions: message.reactions,
      time: message.time,
      userId: message.userId,
    };
  },
  fromFirestore(snapshot: DocumentSnapshot<DocumentData>): ChannelMessage {
    const data: any = snapshot.data() || {};
    return new ChannelMessage(
      data.content,
      data.messageId,
      data.userId,
    );
  }
};

@Component({
  selector: 'app-message-area-new-message',
  standalone: true,
  imports: [MatIconModule, MatMenu, MatMenuModule, FormsModule, PickerModule, PickerComponent],
  templateUrl: './message-area-new-message.component.html',
  styleUrls: ['./message-area-new-message.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MessageAreaNewMessageComponent implements OnInit {
  newMessageContent = '';
  channelId?: string;
  privateChatId?: string;
  userId?: string;
  userName?: string;
  photoURL?: string;
  channel: Channel | undefined;

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

  // Generiere eine Message-ID basierend auf dem Chat-Typ (private oder channel)
  const messageId = this.privateChatId
    ? MessageAreaNewMessageComponent.generatePrivateMessageId()
    : `msg_${Date.now()}`;

  // Erstelle ein neues ChannelMessage-Objekt
  const newMessage = new ChannelMessage(
    this.newMessageContent,
    this.userId || '', // Füge die User-ID hinzu (kann auch dynamisch bezogen werden)
    messageId
  );

  if (this.privateChatId) {
    // Wenn privateChatId vorhanden ist, sende die private Nachricht
    await this.sendPrivateChatMessage(newMessage);
  } else if (this.channelId) {
    // Andernfalls, wenn channelId vorhanden ist, sende die Channel-Nachricht
    this.channel?.addMessage(messageId, newMessage);
    await this.sendChannelMessage(newMessage);
  } else {
    console.error('Weder privateChatId noch channelId ist definiert.');
  }

  // Setze den Nachrichteninhalt zurück
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
  
  addEmoji(event: any) {
    console.log('Emoji selected:', event);
    const emoji = event.emoji.native || event.emoji;
    this.newMessageContent += emoji;
  }
  
}
