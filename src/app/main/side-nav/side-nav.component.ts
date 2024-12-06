import {
  Component,
  inject,
  Input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { CreateChannelDialogComponent } from './create-channel-dialog/create-channel-dialog.component';
import { ClickStopPropagationDirective } from '../../shared/directives/click-stop-propagation.directive';
import { UserData } from '../../shared/models/user.model';
import { ChannelService } from '../../shared/services/channel-service/channel.service';
import { Channel } from '../../shared/models/channel.model';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../shared/services/user-service/user.service';
import { PrivateChatService } from '../../shared/services/private-chat-service/private-chat.service';
import { MatBadgeModule } from '@angular/material/badge';
import { ActiveChatButtonService } from '../../shared/services/profile-chat-button-service/active-chat-button.service';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { BehaviorService } from '../../shared/services/behavior-service/behavior.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [
    MatIconModule,
    MatSidenavModule,
    MatButtonModule,
    MatToolbarModule,
    MatExpansionModule,
    CommonModule,
    ClickStopPropagationDirective,
    RouterModule,
    MatBadgeModule,
    SearchBarComponent,
  ],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SideNavComponent {
  readonly panelOpenState = signal(false);
  public channelService = inject(ChannelService);
  @Input() userData!: UserData;
  @Input() allChannelsData!: Map<string, Channel>;
  @Input() drawerMode!: string;
  userService = inject(UserService);
  privateChatService = inject(PrivateChatService);
  allUserData: UserData[] = [];
  router: Router = inject(Router);
  activeButtonService = inject(ActiveChatButtonService);
  behaviorService = inject(BehaviorService);
  private userDataSubscription: Subscription | undefined;
  private privateChatSubscription: Subscription | undefined;

  constructor(public dialog: MatDialog) {}

  /**
   * Initializes the component and loads all user data.
   */
  ngOnInit(): void {
    this.userService.allUserData$.subscribe((data) => {
      this.allUserData = data;
    });
    this.loadOnlineStatus();
  }

  /**
   * Unsubscribes from the user data subscription when the component is destroyed.
   */
  ngOnDestroy(): void {
    if (this.userDataSubscription) this.userDataSubscription.unsubscribe();
    if (this.privateChatSubscription) this.privateChatSubscription.unsubscribe();
  }

  /**
   * Opens the create channel dialog.
   */
  openCreateChannelDialog(): void {
    this.dialog.open(CreateChannelDialogComponent, {
      panelClass: 'create-channel-dialog',
    });
  }

  /**
   * Loads the online status of all users.
   */
  loadOnlineStatus() {
    this.userDataSubscription = this.userService
      .getAllUsersOnlineStatus()
      .subscribe(
        (statusArray) => {
          this.userService.allUsersOnlineStatus$ = statusArray;
        },
        (error) => {
          console.error(error);
        }
      );
  }

  /**
   * Opens a private chat with the specified user.
   * @param targetUser - The user to open the private chat with.
   * @param buttonID - The ID of the button to set as active.
   */
  openChatWithUser(targetUser: UserData, buttonID: string) {
    this.closeNavOnClick();
    this.privateChatSubscription = this.privateChatService
      .openOrCreatePrivateChat(this.userData, targetUser)
      .subscribe((chatId) => {
        if (chatId) {
          this.activeButtonService.setActiveButton(buttonID);
          this.router.navigate([
            `/main/${this.userData.uid}/privateChat`,
            chatId,
          ]);
        } else
          console.error(
            'Fehler beim Öffnen oder Erstellen des privaten Chats.'
          );
      });
  }

  /**
   * Checks if the specified button ID is the active button.
   * @param buttonId - The ID of the button to check.
   * @returns True if the button is active, false otherwise.
   */
  isActiveButton(buttonId: string): boolean {
    return this.activeButtonService.activeButtonId === buttonId;
  }

  /**
   * Closes the navigation drawer if it's in 'over' mode.
   */
  closeNavOnClick(): void {
    if (this.drawerMode === 'over') {
      this.behaviorService.setValue(false);
    }
  }
}
