import { Injectable } from '@angular/core';
import { Firestore, doc, docData, collection, collectionData } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, from, map } from 'rxjs';
import { Channel } from '../../models/channel.model';
import { getDoc, getDocs } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ChannelService  {
  private currentChannelSubject = new BehaviorSubject<Channel | null>(null); // BehaviorSubject
  public currentChannel$ = this.currentChannelSubject.asObservable(); // Observable für Komponenten
  public channelId: string | undefined;

  constructor(private firestore: Firestore) {}

  // Methode zum Laden eines Channels und Speichern im Subject
  setChannel(channelId: string): void {
    this.channelId = channelId;
    this.getChannelById(channelId).subscribe({
      next: (channel) => {
        this.currentChannelSubject.next(channel); // Setze den Channel im BehaviorSubject
      },
      error: (error) => {
        console.error('Fehler beim Laden des Channels:', error);
      }
    });
  }

  // Methode zur Abfrage eines Channels anhand der ID
  getChannelById(channelId: string): Observable<Channel> {
    const channelDoc = doc(this.firestore, `channels/${channelId}`);
    return from(getDoc(channelDoc)).pipe(
      map((docSnapshot) => {
        if (docSnapshot.exists()) {
          const channelData = docSnapshot.data() as Channel;
          return { ...channelData, channelId: docSnapshot.id };
        } else {
          throw new Error(`Channel with ID ${channelId} does not exist`);
        }
      })
    );
  }

  // Channels laden
  getChannels(): Observable<Channel[]> {
    const channelsCollection = collection(this.firestore, 'channels');
    return from(getDocs(channelsCollection)).pipe(
      map((channelSnapshot) =>
        channelSnapshot.docs.map(doc => {
          const channelData = doc.data() as Channel;
          return { ...channelData, channelId: doc.id };
        })
      )
    );
  }
}
