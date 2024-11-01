import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../shared/services/user-service/user.service';
import { PrivateChatService } from '../../../shared/services/private-chat-service/private-chat.service';

@Component({
  selector: 'app-private-chat-placeholder',
  standalone: true,
  imports: [NgIf],
  templateUrl: './private-chat-placeholder.component.html',
  styleUrls: ['./private-chat-placeholder.component.scss'],
})
export class PrivateChatPlaceholderComponent implements OnInit {
  currentUserId: string = '';
  chatUserId: string | undefined = '';
  chatUserName: string | undefined;
  chatUserPhotoURL: string | undefined;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
  ) {
    
  }

  ngOnInit() {
    this.currentUserId = this.userService.userId;
    this.route.paramMap.subscribe(params => {
      const privateChatId = params.get('privateChatId');
      if (privateChatId) {
        const userIds = privateChatId.split('_');
        const foundUserId = userIds.find(id => id !== this.currentUserId);
        if (foundUserId === undefined) {
          this.chatUserId = this.currentUserId;
        } else if (foundUserId !== undefined) {
          this.chatUserId = foundUserId;
        }
        if (this.chatUserId) {
          this.loadChatUserData(); // Benutzerdaten laden
        }
      }
    });
  }

  private loadChatUserData() {
    if (this.chatUserId) {
      this.userService.getUserDataByUID(this.chatUserId).subscribe({
        next: userData => {
          this.chatUserName = userData?.displayName;
          this.chatUserPhotoURL = userData?.photoURL;
        },
        error: error => console.error('Fehler beim Abrufen der Benutzerdaten:', error)
      });
    }
  }

  isChatWithSelf(): boolean {
    return this.currentUserId === this.chatUserId;
  }
}
