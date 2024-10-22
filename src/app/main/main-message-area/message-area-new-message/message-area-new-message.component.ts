import { Component, OnInit } from '@angular/core';
import { ChannelMessage } from '../../../shared/models/channel-message.model';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, DatePipe, NgFor } from '@angular/common';
import { Firestore } from '@angular/fire/firestore';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { ChannelService } from '../../../shared/services/channel-service/channel.service';
import { UserService } from '../../../shared/services/user-service/user.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-message-area-new-message',
  standalone: true,
  imports: [MatIconModule, FormsModule, DatePipe, NgFor, AsyncPipe],
  templateUrl: './message-area-new-message.component.html',
  styleUrls: ['./message-area-new-message.component.scss'],
})
export class MessageAreaNewMessageComponent implements OnInit {
  newMessageContent: string = '';
  channelId: string = 'aWD9P0ibWthJ7zAqdMYw';
  messages: ChannelMessage[] = []; // Nachrichten-Array
  userId: string | undefined;
  userName: string | undefined;
  photoURL: string | undefined;

  constructor(
    private firestore: Firestore,
    private channelService: ChannelService,
    private userService: UserService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.channelId = this.channelService.channelId || 'aWD9P0ibWthJ7zAqdMYw';
    this.getUserData();
  }

  async getUserData() {
    this.userId = this.route.snapshot.paramMap.get('uid') || '';
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
        this.photoURL || '',
      );

      const channelDocRef = doc(this.firestore, `channels/${this.channelId}`);

      try {
        await updateDoc(channelDocRef, {
          messages: arrayUnion({ ...newMessage }),
        });
      } catch (error) {
        console.error('Fehler beim Einfügen der Nachricht:', error);
      }

      this.newMessageContent = '';
    }
  }

  generateMessageId(): string {
    return Math.random().toString(36).substring(2);
  }
}
