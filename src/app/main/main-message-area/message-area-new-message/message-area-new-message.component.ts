import { Component, OnInit } from '@angular/core';
import { ChannelMessage } from '../../../shared/models/channel-message.model';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, DatePipe, NgFor } from '@angular/common';
import { Firestore } from '@angular/fire/firestore';
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ChannelService } from '../../../shared/services/channel-service/channel.service';
import { UserService } from '../../../shared/services/user-service/user.service';
import { ActivatedRoute } from '@angular/router';
import { PrivateChat } from '../../../shared/models/private-chat.model';
import { PrivateChatService } from '../../../shared/services/private-chat-service/private-chat.service';

@Component({
  selector: 'app-message-area-new-message',
  standalone: true,
  imports: [MatIconModule, FormsModule, DatePipe, NgFor, AsyncPipe],
  templateUrl: './message-area-new-message.component.html',
  styleUrls: ['./message-area-new-message.component.scss'],
})
export class MessageAreaNewMessageComponent implements OnInit {
  newMessageContent: string = '';
  channelId: string | undefined;
  privateChatId: string | undefined;
  userId: string | undefined;
  userName: string | undefined;
  photoURL: string | undefined;

  constructor(
    private firestore: Firestore,
    private userService: UserService,
    private route: ActivatedRoute,
    private privateChatService: PrivateChatService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.userId = this.userService.userId; // Holen der userId
      this.privateChatId = params.get('privateChatId') || undefined; // Holen der privateChatId
      this.channelId = params.get('channelId') || undefined; // Holen der channelId
  
      console.log('UserId:', this.userId); // Debugging
      console.log('PrivateChatId:', this.privateChatId); // Debugging
  
      this.getUserData(); // Holen der Benutzerdaten
    });
  }

  async getUserData() {
    if (this.userId) {
      this.userService.getUserDataByUID(this.userId).subscribe({
        next: (userData: any) => {
          this.userName = userData?.displayName; // Sicherheitsüberprüfung
          this.photoURL = userData?.photoURL;
        },
        error: (error) => {
          console.error('Fehler beim Abrufen der Benutzerdaten:', error);
        }
      });
    }
  }
  async sendMessage() {
    if (this.newMessageContent.trim()) {
      const newMessage = new ChannelMessage(
        this.newMessageContent,
        this.generateMessageId(),
        this.userId || '',
        this.userName || '',
        this.photoURL || ''
      );
  
      if (this.privateChatId) {
        // Für private Chats
        const userDocRef = doc(this.firestore, `users/${this.userId}`);
        const userSnapshot = await getDoc(userDocRef);
  
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          let privateChat: PrivateChat;
  
          if (userData && userData['privateChat'] && userData['privateChat'][this.privateChatId]) {
            privateChat = userData['privateChat'][this.privateChatId];
          } else {
            privateChat = new PrivateChat(this.privateChatId);
            await updateDoc(userDocRef, {
              [`privateChat.${this.privateChatId}`]: { 
                messages: [], 
                user: [{ userId: this.userId || '', userName: this.userName || '', photoURL: this.photoURL || '' }] 
              }
            });
          }
  
          this.privateChatService.addMessageToPrivateChat(this.userId || '', this.privateChatId || '', newMessage);
          await updateDoc(userDocRef, {
            [`privateChat.${this.privateChatId}.messages`]: arrayUnion({ ...newMessage })
          });
  
          console.log('Nachricht im privaten Chat erfolgreich hinzugefügt.');
        } else {
          console.error('Benutzerdokument existiert nicht.');
        }
      } else if (this.channelId) {
        // Für Channel-Nachrichten
        const channelDocRef = doc(this.firestore, `channels/${this.channelId}`);
        await this.updateChannelMessages(channelDocRef, newMessage);
  
        console.log('Nachricht im Channel erfolgreich hinzugefügt.');
      } else {
        console.error('Weder privateChatId noch channelId ist definiert.');
      }
  
      this.newMessageContent = ''; // Nachrichteneingabefeld zurücksetzen
    }
  }
  
  
  private async updatePrivateChatMessages(privateChatDocRef: any, messageData: any) {
    try {
      await updateDoc(privateChatDocRef, {
        messages: arrayUnion(messageData),
      });
    } catch (error) {
      console.error('Fehler beim Einfügen der Nachricht in den privaten Chat:', error);
    }
  }
  


  generateMessageId(): string {
    return Math.random().toString(36).substring(2); // Generiere eine einfache eindeutige ID
  }

  private async updateChannelMessages(channelDocRef: any, message: ChannelMessage) {
    try {
      await updateDoc(channelDocRef, {
        messages: arrayUnion({ ...message }),
      });
    } catch (error) {
      console.error('Fehler beim Einfügen der Nachricht:', error);
    }
  }
}