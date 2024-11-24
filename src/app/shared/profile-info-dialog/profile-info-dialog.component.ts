import { Component, Inject, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { UserData } from '../models/user.model';
import { Subscription } from 'rxjs';
import { UserService } from '../services/user-service/user.service';
import { PrivateChatService } from '../services/private-chat-service/private-chat.service';
import { ActiveChatButtonService } from '../services/profile-chat-button-service/active-chat-button.service';
import { Router } from '@angular/router';
import { EditDialogComponent } from './edit-dialog/edit-dialog.component';

@Component({
  selector: 'app-profile-info-dialog',
  standalone: true,
  imports: [MatIconModule, MatInputModule, MatCardModule, CommonModule],
  templateUrl: './profile-info-dialog.component.html',
  styleUrl: './profile-info-dialog.component.scss',
})
export class ProfileInfoDialogComponent {
  ownProfile: boolean = true;
  userData!: UserData;
  currentUserData!: UserData;
  subscription!: Subscription;
  userService = inject(UserService);
  privateChatService = inject(PrivateChatService);
  activeButtonService = inject(ActiveChatButtonService);
  router = inject(Router);

  readonly dialogRef = inject(MatDialogRef<ProfileInfoDialogComponent>);
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { userId: string; userName: string; userPhotoURL: string },
    public dialog: MatDialog
  ) {}

  //ANCHOR - Semir - Überprüfung, ob eigenes oder anderes Profil.
  ngOnInit() {
    this.loadCurrentUserData();
    if (this.data) {
      this.userData = {
        uid: this.data.userId,
        displayName: this.data.userName,
        photoURL: this.data.userPhotoURL,
        email: this.userService.getUserEmail(this.data.userId),
      } as UserData; // Verwende den Typ UserData
      if (this.data.userId === this.userService.userId) {
        this.ownProfile = true;
      } else {
        this.ownProfile = false;
      }
    } else {
      this.userService.userData$.subscribe((data) => {
        this.userData = data; // Empfange die Benutzerdaten
      });
    }
  }

  loadCurrentUserData() {
    this.userService.userData$.subscribe((data) => {
      this.currentUserData = data;
    });
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  openChatWithUser(targetUser: UserData, buttonID: string) {
    this.privateChatService
      .openOrCreatePrivateChat(this.currentUserData, targetUser)
      .subscribe((chatId) => {
        if (chatId) {
          this.activeButtonService.setActiveButton(buttonID);
          this.router.navigate([
            `/main/${this.currentUserData.uid}/privateChat`,
            chatId,
          ]);
          this.closeDialog();
        } else {
          console.error(
            'Fehler beim Öffnen oder Erstellen des privaten Chats.'
          );
        }
      });
  }

  openEditProfile(): void {
    const dialogRef = this.dialog.open(EditDialogComponent);
    dialogRef.componentInstance.user = this.userData;
  }
}
