import { Component, Input, OnInit } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { UserService } from '../../services/user-service/user.service';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-message-reactions',
  standalone: true,
  templateUrl: './message-reactions.component.html',
  styleUrls: ['./message-reactions.component.scss'],
  imports: [EmojiComponent, MatMenuModule, NgFor, MatTooltipModule, NgClass],
})
export class MessageReactionsComponent implements OnInit {
  @Input() message: any;
  reactionUsers: { id: string, displayName: string }[] = []; // Array von Benutzern mit ID und Name
  hoveredReaction: any = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    // Initialisieren der Reaktionen mit User-Daten
    this.loadReactionUsers();
  }

  loadReactionUsers(): void {
    if (this.message && Array.isArray(this.message.reactions)) {
      this.message.reactions.forEach((reaction: any) => {
        reaction.userIds.forEach((userId: string) => {
          // Überprüfen, ob der Benutzer bereits in reactionUsers ist
          if (!this.reactionUsers.some(user => user.id === userId)) {
            // Benutzer abfragen, falls noch nicht vorhanden
            this.userService.getUserDataByUID(userId).subscribe(userData => {
              if (userData) {
                this.reactionUsers.push({ id: userId, displayName: userData.displayName });
              }
            });
          }
        });
      });
    }
  }

  // Benutzernamen basierend auf userIds im Tooltip anzeigen
  getUserList(reaction: any): string[] {
    if (reaction && reaction.emoji && Array.isArray(reaction.userIds)) {
      const userNames = reaction.userIds.map((userId: string) => {
        // Überprüfen, ob der Benutzer der aktuelle Benutzer ist
        if (userId === this.userService.userId) {
          return 'Du';  // Wenn es der aktuelle Benutzer ist, gebe 'Du' zurück
        }
        
        const user = this.reactionUsers.find(user => user.id === userId);
        return user ? user.displayName : 'Unbekannt';
      });
  
      // "Du" ans Ende der Liste verschieben, falls es vorhanden ist
      const currentUserIndex = userNames.indexOf('Du');
      if (currentUserIndex > -1) {
        const du = userNames.splice(currentUserIndex, 1)[0];  // Entfernt 'Du' aus der Liste
        userNames.push(du);  // Fügt 'Du' ans Ende der Liste hinzu
      }
  
      // Formatieren der Benutzernamen, um 'und' zwischen den letzten beiden zu setzen
      if (userNames.length > 1) {
        const lastUser = userNames.pop();  // Entfernt den letzten Benutzer
        return [...userNames, `und ${lastUser}`];  // Fügt 'und' zwischen den letzten beiden Benutzern hinzu
      }
  
      return userNames;
    }
    return [];  // Wenn keine userIds vorhanden sind, leeres Array zurückgeben
  }
  
  
  
}
