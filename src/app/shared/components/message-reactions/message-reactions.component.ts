import { Component, Input, OnInit } from '@angular/core';

import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu'; // Um das mat-menu zu steuern
import { UserService } from '../../services/user-service/user.service';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-message-reactions',
  standalone: true,
  templateUrl: './message-reactions.component.html',
  styleUrls: ['./message-reactions.component.scss'],
  imports: [EmojiComponent, MatMenuModule, NgFor],
})
export class MessageReactionsComponent implements OnInit {
  @Input() message: any;
  reactionUsers: any[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    // Initialisieren der Reaktionen mit User-Daten
    this.loadReactionUsers();
  }

  loadReactionUsers(): void {
    // Prüfen, ob `message` und `reactions` definiert sind und `reactions` ein Array ist
    if (this.message && Array.isArray(this.message.reactions)) {
      this.message.reactions.forEach((reaction: any) => {
        if (reaction.users && Array.isArray(reaction.users)) {
          reaction.users.forEach((user: any) => {
            this.userService.getUserDataByUID(user.id).subscribe(userData => {
              // displayName in der Reaktion speichern
              user.displayName = userData?.displayName;
            });
          });
        }
      });
    } else {
      console.warn('Reactions or message object is not defined.');
    }
  }
  

  // Für das Hover-Event das Menu anzeigen
  onEmojiHover(reaction: any): void {
    // Benutzer-Daten für das Menu laden
    this.reactionUsers = reaction.users;
  }

  viewUserProfile(userId: string): void {
    // Hier kannst du eine Methode einfügen, um zum Profil des Benutzers zu navigieren oder die Profile anzuzeigen
    console.log(`Profil des Benutzers mit ID: ${userId}`);
  }
}
