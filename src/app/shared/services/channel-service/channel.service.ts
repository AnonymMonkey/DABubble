import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  docData,
  collection,
  collectionData,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable, from, map, switchMap } from 'rxjs';
import { Channel } from '../../models/channel.model';
import {
  addDoc,
  arrayUnion,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { MatDialog } from '@angular/material/dialog';
import { ProfileInfoDialogComponent } from '../../profile-info-dialog/profile-info-dialog.component';
import { UserData } from '../../models/user.model';
import { ChannelMessage } from '../../models/channel-message.model';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private currentChannelSubject = new BehaviorSubject<Channel | undefined>(
    undefined
  ); // BehaviorSubject
  public currentChannel$ = this.currentChannelSubject.asObservable(); // Observable für Komponenten
  public channelId: string = '';
  public actualThread: Array<string> = []; // Daten des aktuell ausgewählten Threads

  // Neues Observable für Channel-Daten
  public channelData$: Observable<Channel | undefined> = this.currentChannel$;

  constructor(private firestore: Firestore, public dialog: MatDialog) {}

  // Methode zum Laden eines Channels und Speichern im Subject
  setChannel(channelId: string): void {
    this.channelId = channelId;
    this.getChannelById(channelId).subscribe({
      next: (channel) => {
        this.currentChannelSubject.next(channel); // Setze den Channel im BehaviorSubject
      },
      error: (error) => {
        console.error('Fehler beim Laden des Channels:', error);
      },
    });
  }

  // Methode zur Abfrage eines Channels anhand der ID
  getChannelById(channelId: string): Observable<Channel | undefined> {
    const channelDoc = doc(this.firestore, `channels/${channelId}`);
    return from(getDoc(channelDoc)).pipe(
      map((docSnapshot) => {
        if (docSnapshot.exists()) {
          const channelData = docSnapshot.data() as {
            admin: { userId: string; userName: string; photoURL: string };
            channelName: string;
            description: string;
            members: { userId: string; userName: string; photoURL: string }[];
            messages: { [messageId: string]: any }; // Anpassung erforderlich, wenn du ChannelMessage verwendest
          };
  
          // Erstelle eine neue Instanz von Channel und gib sie zurück
          return new Channel(
            channelData.admin,
            channelId,
            channelData.channelName,
            channelData.description,
            channelData.members,
            channelData.messages // oder ein leeres Objekt, wenn messages nicht vorhanden sind
          );
        } else {
          return undefined; // Gebe undefined zurück, wenn der Channel nicht existiert
        }
      })
    );
  }

  getChannels(): Observable<Channel[]> {
    const channelsCollection = collection(this.firestore, 'channels');
    return from(getDocs(channelsCollection)).pipe(
      map((channelSnapshot) =>
        channelSnapshot.docs.map((doc) => {
          const channelData = doc.data() as {
            admin: { userId: string; userName: string; photoURL: string; };
            channelName: string;
            description: string;
            members: { userId: string; userName: string; photoURL: string; }[];
            messages: { [messageId: string]: ChannelMessage };
          };
  
          // Erstelle eine neue Instanz von Channel und gib sie zurück
          return new Channel(
            channelData.admin,
            doc.id, // Verwende die ID des Dokuments
            channelData.channelName,
            channelData.description,
            channelData.members,
            channelData.messages
          );
        })
      )
    );
  }
  

  //NOTE - Ich habe hier eine Funktion fürs erstellen eines neuen Channels erstellt

  createChannel(channelData: Partial<Channel>): Observable<string> {
    const channelCollection = collection(this.firestore, 'channels');
    const newChannelRef = doc(channelCollection);

    const channelObject = {
      ...JSON.parse(JSON.stringify(channelData)),
      channelId: newChannelRef.id,
    };

    return from(setDoc(newChannelRef, channelObject)).pipe(
      switchMap(() => {
        // Extrahiere die User-IDs aus channelData.members
        const userIds =
          channelData.members?.map((member) => member.userId) || [];

        // Weise die channelId allen Usern zu und füge sie dem channels-Array hinzu
        const updateUserObservables = userIds.map((userId) => {
          const userDocRef = doc(this.firestore, `users/${userId}`);
          return from(
            updateDoc(userDocRef, {
              channels: arrayUnion(newChannelRef.id),
            })
          );
        });

        // Warte, bis alle Updates abgeschlossen sind
        return from(Promise.all(updateUserObservables)).pipe(
          map(() => newChannelRef.id) // Gibt die ID des neu erstellten Channels zurück
        );
      })
    );
  }
  //NOTE - Ende

  setActualThread(threadData: Array<string>): void {
    this.actualThread = threadData;
  }

  openProfileInfo(user: any): void {
    const dialogRef = this.dialog.open(ProfileInfoDialogComponent);
  }
}
