import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChannelMessage } from '../../models/channel-message.model';
import { doc, updateDoc } from 'firebase/firestore';
import { enableIndexedDbPersistence, Firestore } from '@angular/fire/firestore';
import { ChannelService } from '../channel-service/channel.service';
import { docData } from 'rxfire/firestore';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private firestore = inject(Firestore);
  private channelService = inject(ChannelService);
  private messages: ChannelMessage[] = [];
  private messagesSubject = new BehaviorSubject<ChannelMessage[]>(this.messages);
  messages$ = this.messagesSubject.asObservable();
  public editMessageId: string | null = null;

  addMessage(content: string, messageId: string, userId: string, userName: string) {
    const newMessage = new ChannelMessage(content, messageId, userId, userName, '');
    this.messages.push(newMessage);
    this.messagesSubject.next(this.messages);
  }

  getMessageUpdates(messageId: string): Observable<any> {
    const messageDocRef = doc(this.firestore, `messages/${messageId}`);
    return docData(messageDocRef, { idField: 'messageId' });
  }

   async updateMessageContent(messageId: string, newContent: string): Promise<void> {
    const messageRef = doc(this.firestore, `channels/${this.channelService.channelId}/messages/${messageId}`);
    await updateDoc(messageRef, { content: newContent });
    console.log('Nachricht erfolgreich aktualisiert');
  }

  setEditMessageId(messageId: string | null) {
    this.editMessageId = messageId;
  }
}
