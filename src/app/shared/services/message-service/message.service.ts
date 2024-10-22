import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChannelMessage } from '../../models/channel-message.model'; // Importiere die Klasse

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private messages: ChannelMessage[] = [];
  private messagesSubject = new BehaviorSubject<ChannelMessage[]>(this.messages);

  messages$ = this.messagesSubject.asObservable();

  addMessage(content: string, messageId: string, userId: string, userName: string) {
    const newMessage = new ChannelMessage(content, messageId, userId, userName); // Instanz der Klasse erstellen
    this.messages.push(newMessage);
    this.messagesSubject.next(this.messages);
  }
}

