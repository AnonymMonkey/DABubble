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
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-profile-info-dialog',
  standalone: true,
  imports: [
    MatIconModule,
    MatInputModule,
    MatCardModule,
    CommonModule,
    MatTooltipModule,
  ],
  templateUrl: './profile-info-dialog.component.html',
  styleUrl: './profile-info-dialog.component.scss',
})
export class ProfileInfoDialogComponent {
  ownProfile: boolean = true;
  userData!: UserData;
  currentUserData!: UserData;
  subscription!: Subscription;
  userDataSubscription!: Subscription;
  privateChatSubscription!: Subscription;
  currentUserDataSubscription!: Subscription;
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

  /**
   * Initializes the component and loads the current user's data.
   */
  ngOnInit() {
    this.loadCurrentUserData();
    this.compareCurrentUserAndUserData();
  }

  /**
   * Compares the current user's data with the provided user data and sets the `ownProfile` flag accordingly.
   * If the provided user data is not available, it subscribes to the `userData$` observable to get the current user's data.
   */
  compareCurrentUserAndUserData() {
    if (this.data) {
      this.userData = {
        uid: this.data.userId,
        displayName: this.data.userName,
        photoURL: this.data.userPhotoURL,
        email: this.userService.getUserEmail(this.data.userId),
      } as UserData;
      if (this.data.userId === this.userService.userId) this.ownProfile = true;
      else this.ownProfile = false;
    } else
      this.userDataSubscription = this.userService.userData$.subscribe(
        (data) => {
          this.userData = data;
        }
      );
  }

  /**
   * Cleans up subscriptions on component destroy.
   */
  ngOnDestroy() {
    if (this.userDataSubscription) this.userDataSubscription.unsubscribe();
    if (this.currentUserDataSubscription)
      this.currentUserDataSubscription.unsubscribe();
    if (this.privateChatSubscription)
      this.privateChatSubscription.unsubscribe();
  }

  /**
   * Loads the current user's data.
   */
  loadCurrentUserData() {
    this.currentUserDataSubscription = this.userService.userData$.subscribe(
      (data) => {
        this.currentUserData = data;
      }
    );
  }

  /**
   * Closes the dialog.
   */
  closeDialog() {
    this.dialog.closeAll();
  }

  /**
   * Opens a private chat with the specified user.
   * @param targetUser - The user to open the private chat with.
   * @param buttonID - The ID of the button to set as active.
   */
  openChatWithUser(targetUser: UserData, buttonID: string) {
    this.privateChatSubscription = this.privateChatService
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

  /**
   * Opens the edit profile dialog.
   */
  openEditProfile(): void {
    const dialogRef = this.dialog.open(EditDialogComponent);
    dialogRef.componentInstance.user = this.userData;
  }
}
