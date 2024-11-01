import { NgIf } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ProfileInfoDialogComponent } from '../../../shared/profile-info-dialog/profile-info-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../shared/services/user-service/user.service';
import { PrivateChatService } from '../../../shared/services/private-chat-service/private-chat.service';

@Component({
  selector: 'app-private-chat-header',
  standalone: true,
  imports: [MatToolbarModule, MatMenuModule, ProfileInfoDialogComponent, NgIf],
  templateUrl: './private-chat-header.component.html',
  styleUrls: ['./private-chat-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PrivateChatHeaderComponent implements OnInit {
  isMenuOpened: boolean = false;
  currentUserId: string = '';
  chatUserId: string | undefined = '';
  chatUserName: string | undefined;
  chatUserPhotoURL: string | undefined;

  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private userService: UserService,
    private privateChatService: PrivateChatService
  ) {}

  ngOnInit() {
    this.currentUserId = this.userService.userId; // Aktueller Benutzer
    this.route.paramMap.subscribe(params => {
      const privateChatId = params.get('privateChatId');
      if (privateChatId) {
        const userIds = privateChatId.split('_');
        const foundUserId = userIds.find(id => id !== this.currentUserId);
        this.chatUserId = foundUserId ? foundUserId : this.currentUserId;

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

  openProfileInfo(): void {
    const dialogRef = this.dialog.open(ProfileInfoDialogComponent, {
      data: { userName: this.chatUserName, userPhotoURL: this.chatUserPhotoURL }
    });
  }

  isChatWithSelf(): boolean {
    return this.currentUserId === this.chatUserId;
  }
}
