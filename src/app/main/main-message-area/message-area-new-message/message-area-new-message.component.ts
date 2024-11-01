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

const channelMessageConverter: FirestoreDataConverter<ChannelMessage> = {
  toFirestore(message: ChannelMessage): DocumentData {
    return {
      content: message.content,  // Der Inhalt wird hier direkt gespeichert
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

  async sendMessage() {
    if (!this.newMessageContent) return;

    // Generiere die messageId außerhalb des ChannelMessage-Objekts
    const messageId = `msg_${Date.now()}`;

    // Erstelle das ChannelMessage-Objekt und setze die messageId
    const newMessage = new ChannelMessage(
      this.newMessageContent, // Speichere den Inhalt direkt
      this.userId || '',
      this.userName || '',
      this.photoURL || '',
      messageId // Die ID hier übergeben
    );

    if (this.privateChatId) {
      await this.sendPrivateChatMessage(newMessage);
    } else if (this.channelId) {
      this.channel?.addMessage(messageId, newMessage);
      await this.sendChannelMessage(newMessage);
    } else {
      console.error('Weder privateChatId noch channelId ist definiert.');
    }

    // Nachrichteneingabefeld zurücksetzen
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

  private async sendPrivateChatMessage(newMessage: ChannelMessage) {
    const userDocRef = doc(this.firestore, `users/${this.userId}`);
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
      console.error('Benutzerdokument existiert nicht.');
      return;
    }

    const userData = userSnapshot.data() as { privateChat?: Record<string, PrivateChat> };

    if (!userData.privateChat) {
      console.error('privateChat ist nicht definiert.');
      return;
    }

    const privateChatId = this.privateChatId;
    if (!privateChatId) {
      console.error('privateChatId ist nicht definiert.');
      return;
    }

    const privateChatExists = userData.privateChat[privateChatId];

    if (!privateChatExists) {
      await updateDoc(userDocRef, {
        [`privateChat.${privateChatId}`]: {
          messages: [],
          user: [{
            userId: this.userId || '',
            userName: this.userName || '',
            photoURL: this.photoURL || ''
          }]
        }
      });
    }

    await updateDoc(userDocRef, {
      [`privateChat.${privateChatId}.messages`]: arrayUnion({
        content: newMessage.content,
        messageId: newMessage.messageId,
        reactions: newMessage.reactions,
        time: newMessage.time,
        user: newMessage.user
      })
    });
  }
}
