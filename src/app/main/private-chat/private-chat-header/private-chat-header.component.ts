import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ProfileInfoDialogComponent } from '../../../shared/profile-info-dialog/profile-info-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../shared/services/user-service/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-private-chat-header',
  standalone: true,
  imports: [MatToolbarModule, MatMenuModule],
  templateUrl: './private-chat-header.component.html',
  styleUrls: ['./private-chat-header.component.scss'],
})
export class PrivateChatHeaderComponent implements OnInit {
  isMenuOpened: boolean = false;
  currentUserId: string = '';
  public chatUserId: string | undefined = '';
  chatUserName: string | undefined;
  chatUserPhotoURL: string | undefined;
  private routeSubscription: Subscription | undefined;
  private userDataSubscription: Subscription | undefined;
  private dialogSubscription: Subscription | undefined;

  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    public userService: UserService
  ) {}

  /**
   * Initialize the component and subscribe to route parameters oninit.
   */
  ngOnInit() {
    this.currentUserId = this.userService.userId;
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const privateChatId = params.get('privateChatId');
      if (privateChatId) {
        const userIds = privateChatId.split('_');
        const foundUserId = userIds.find((id) => id !== this.currentUserId);
        this.chatUserId = foundUserId ? foundUserId : this.currentUserId;
        if (this.chatUserId) this.loadChatUserData();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) this.routeSubscription.unsubscribe();
    if (this.userDataSubscription) this.userDataSubscription.unsubscribe();
    if (this.dialogSubscription) this.dialogSubscription.unsubscribe();
  }


  /**
   * Load the chat user data from the user service.
   */
  private loadChatUserData() {
    if (this.chatUserId) {
      this.userDataSubscription = this.userService.getUserDataByUID(this.chatUserId).subscribe({
        next: (userData) => {
          this.chatUserName = userData?.displayName;
          this.chatUserPhotoURL = userData?.photoURL;
        },
        error: (error) =>
          console.error('Fehler beim Abrufen der Benutzerdaten:', error),
      });
    }
  }

  /**
   * Open the profile info dialog.
   */
  openProfileInfo(): void {
    this.isMenuOpened = true;
    const dialogRef = this.dialog.open(ProfileInfoDialogComponent, {
      data: {
        userId: this.chatUserId,
        userName: this.chatUserName,
        userPhotoURL: this.chatUserPhotoURL,
      },
    });
    this.dialogSubscription = dialogRef.afterClosed().subscribe(() => {
      this.isMenuOpened = false;
    });
  }

  /**
   * Check if the chat is with the current user.
   * @returns True if the chat is with the current user, false otherwise.
   */
  isChatWithSelf(): boolean {
    return this.currentUserId === this.chatUserId;
  }
}
