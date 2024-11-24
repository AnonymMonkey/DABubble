import { Component, EventEmitter, Output } from '@angular/core';
import { ChannelService } from '../../services/channel-service/channel.service';
import { UserService } from '../../services/user-service/user.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-mention-user',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './mention-user.component.html',
  styleUrl: './mention-user.component.scss',
})
export class MentionUserComponent {
  @Output() mentionUser = new EventEmitter<string>();

  currentUserId: string | undefined;
  mentionableUsers: any[] = [];

  constructor(
    public channelService: ChannelService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.userService.userId;
    this.loadMentionableUsers();
  }

  loadMentionableUsers(): void {
    this.channelService.currentChannel$.subscribe({
      next: (channel) => {
        if (channel && channel.members && this.currentUserId) {
          const membersExcludingCurrentUser = channel.members.filter(
            (userId) => userId !== this.currentUserId
          );

          this.mentionableUsers = []; // Liste zurücksetzen
          membersExcludingCurrentUser.forEach((userId) => {
            this.userService.getUserDataByUID(userId).subscribe({
              next: (userData) => {
                if (userData) {
                  // Prüfen, ob der Benutzer bereits existiert, bevor er hinzugefügt wird
                  const userExists = this.mentionableUsers.some(
                    (user) => user.userId === userId
                  );
                  if (!userExists) {
                    this.mentionableUsers.push({
                      userId,
                      userName: userData.displayName,
                      photoURL: userData.photoURL,
                    });
                  }
                }
              },
              error: (error) => {
                console.error('Fehler beim Abrufen der Benutzerdaten:', error);
              },
            });
          });
        }
      },
      error: (error) => {
        console.error('Fehler beim Abrufen des Kanals:', error);
      },
    });
  }

  selectUser(userName: string): void {
    // Erstelle den unsichtbaren Textmarker
    const mentionText: string =`<span class="mention">@${userName}</span>`;

    // Sende den Marker als Output an die übergeordnete Komponente
    this.mentionUser.emit(mentionText);
  }
}
