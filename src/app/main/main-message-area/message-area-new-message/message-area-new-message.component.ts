import { Component, OnInit } from '@angular/core';
import { ChannelMessage } from '../../../shared/models/channel-message.model';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, DatePipe, NgFor } from '@angular/common';
import { Firestore, FirestoreDataConverter, DocumentData, DocumentSnapshot } from '@angular/fire/firestore';
import { arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ChannelService } from '../../../shared/services/channel-service/channel.service';
import { UserService } from '../../../shared/services/user-service/user.service';
import { ActivatedRoute } from '@angular/router';
import { PrivateChat } from '../../../shared/models/private-chat.model';
import { PrivateChatService } from '../../../shared/services/private-chat-service/private-chat.service';

// Converter für ChannelMessage
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

  constructor(
    private firestore: Firestore,
    private userService: UserService,
    private route: ActivatedRoute,
    private privateChatService: PrivateChatService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.userId = this.userService.userId;
      this.privateChatId = params.get('privateChatId') || undefined;
      this.channelId = params.get('channelId') || undefined;
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
    if (!this.newMessageContent.trim()) return;

    const newMessage = new ChannelMessage(
      this.newMessageContent,
      this.generateMessageId(),
      this.userId || '',
      this.userName || '',
      this.photoURL || ''
    );

    if (this.privateChatId) {
      await this.sendPrivateChatMessage(newMessage);
    } else if (this.channelId) {
      await this.sendChannelMessage(newMessage);
    } else {
      console.error('Weder privateChatId noch channelId ist definiert.');
    }

    this.newMessageContent = ''; // Nachrichteneingabefeld zurücksetzen
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
  
    // Nutze arrayUnion um die Nachricht hinzuzufügen
    await updateDoc(userDocRef, {
      [`privateChat.${privateChatId}.messages`]: arrayUnion({
        content: newMessage.content,
        messageId: newMessage.messageId,
        reactions: newMessage.reactions,
        time: newMessage.time,
        user: newMessage.user
      })
    });
  
    console.log('Nachricht im privaten Chat erfolgreich hinzugefügt.');
  }

  private async sendChannelMessage(newMessage: ChannelMessage) {
    const channelDocRef = doc(this.firestore, `channels/${this.channelId}`).withConverter(channelMessageConverter);
    await this.updateChannelMessages(channelDocRef, newMessage);
    console.log('Nachricht im Channel erfolgreich hinzugefügt.');
  }

  private async updateChannelMessages(channelDocRef: any, message: ChannelMessage) {
    try {
      await updateDoc(channelDocRef, {
        messages: arrayUnion({
          content: message.content,
          messageId: message.messageId,
          reactions: message.reactions,
          time: message.time,
          user: message.user
        })
      });
    } catch (error) {
      console.error('Fehler beim Einfügen der Nachricht:', error);
    }
  }

  private generateMessageId(): string {
    return Math.random().toString(36).substring(2); // Generiere eine einfache eindeutige ID
  }
}
