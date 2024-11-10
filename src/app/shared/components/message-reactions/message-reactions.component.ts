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
  imports: [MatMenuTrigger, EmojiComponent, MatMenuModule, NgFor],
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
    // Für jede Reaktion die Benutzer-Daten laden
    this.message.reactions.forEach((reaction: any)=> {
      reaction.users.forEach((user: any) => {
        this.userService.getUserDataByUID(user.id).subscribe(userData => {
          // displayName in der Reaktion speichern
          user.displayName = userData?.displayName;
        });
      });
    });
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
