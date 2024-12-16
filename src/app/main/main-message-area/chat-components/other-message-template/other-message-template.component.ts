import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MainMessageAreaComponent } from '../../main-message-area.component';
import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChannelService } from '../../../../shared/services/channel-service/channel.service';
import { ThreadService } from '../../../../shared/services/thread-service/thread.service';
import { MatIcon } from '@angular/material/icon';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { MessageService } from '../../../../shared/services/message-service/message.service';
import { MessageReactionsComponent } from '../../../../shared/components/message-reactions/message-reactions.component';
import { EmojiPickerComponent } from '../../../../shared/components/emoji-picker/emoji-picker.component';
import { AttachmentPreviewComponent } from '../../../../shared/components/attachment-preview/attachment-preview.component';
import { UserService } from '../../../../shared/services/user-service/user.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-other-message-template',
  standalone: true,
  imports: [
    NgClass,
    DatePipe,
    NgIf,
    MatIcon,
    PickerModule,
    EmojiComponent,
    MatMenuModule,
    MessageReactionsComponent,
    EmojiPickerComponent,
    AttachmentPreviewComponent,
    NgFor,
    AsyncPipe,
    NgClass,
  ],
  templateUrl: './other-message-template.component.html',
  styleUrl: './other-message-template.component.scss',
})
export class OtherMessageTemplateComponent implements OnInit, OnDestroy {
  isEmojiContainerVisible: number = 0;
  emojis: string = '';
  @Input() message: any = '';
  isMenuOpen: boolean = false;
  currentBorderRadius = '30px 30px 30px 30px';
  public threadMessages$: Observable<any[]> | undefined;
  public loading: boolean = false;
  photoURL: string = '';
  displayName: string = '';
  private userDataSubscription: Subscription | undefined;
  @ViewChild('emojiMenuTrigger') emojiMenuTrigger!: MatMenuTrigger;

  constructor(
    public mainMessageArea: MainMessageAreaComponent,
    public channelService: ChannelService,
    public threadService: ThreadService,
    private firestore: Firestore,
    private messageService: MessageService,
    public userService: UserService
  ) {}

  /**
   * Initializes the component by loading thread messages and user data.
   */
  ngOnInit(): void {
    if (this.channelService.channelId && this.message?.messageId)
      this.loadThreadMessages(
        this.channelService.channelId,
        this.message.messageId
      );
    if (this.message) this.loadUserData(this.message.userId);
  }

  /**
   * Loads user data for the given user ID.
   * @param userId - The ID of the user to load data for.
   */
  loadUserData(userId: string): void {
    this.userDataSubscription = this.userService.userDataMap$.subscribe(
      (userDataMap) => {
        const userData = userDataMap.get(userId);
        if (userData) {
          this.photoURL = userData.photoURL;
          this.displayName = userData.displayName;
        } else {
          this.photoURL = 'assets/img/profile/placeholder-img.webp';
          this.displayName = 'Gast';
        }
      }
    );
  }

  /**
   * Loads thread messages for the given channel ID and message ID.
   * @param channelId - The ID of the channel to load thread messages for.
   * @param messageId - The ID of the message to load thread messages for.
   */
  loadThreadMessages(channelId: string, messageId: string): void {
    const threadRef = collection(
      this.firestore,
      `channels/${channelId}/messages/${messageId}/thread`
    );
    this.threadMessages$ = collectionData(threadRef, { idField: 'id' });
  }

  /**
   * Shows the emoji container for the given message ID.
   * @param id - The ID of the message to show the emoji container for.
   */
  showEmojiContainer(id: number): void {
    this.isEmojiContainerVisible = id;
  }

  /**
   * Hides the emoji container.
   */
  hideEmojiContainer(): void {
    if (!this.isMenuOpen) {
      this.isEmojiContainerVisible = 0;
    }
  }

  /**
   * Opens the menu.
   */
  menuOpened(): void {
    this.isMenuOpen = true;
  }

  /**
   * Closes the menu.
   */
  menuClosed(): void {
    this.isMenuOpen = false;
    this.isEmojiContainerVisible = 0;
  }

  /**
   * Returns the last reply time for the given thread object.
   * @param thread - The thread object to get the last reply time from.
   * @returns The last reply time as a string.
   */
  getLastReplyTime(thread: { [key: string]: any }): string {
    const messages = Object.values(thread);
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.time) {
      const date = new Date(lastMessage.time);
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      };
      return date.toLocaleTimeString([], options) + ' Uhr';
    }
    return 'Keine Antworten';
  }

  /**
   * Adds a reaction to a message.
   * @param messageId - The ID of the message to add a reaction to.
   * @param emoji - The emoji to add as a reaction.
   */
  addReaction(messageId: string, emoji: any): void {
    let path =
      'channels/' + this.channelService.channelId + '/messages/' + messageId;
    this.messageService.setActualMessage(this.message);
    this.messageService.addOrChangeReactionChannelOrThread(emoji, path);
  }

  /**
   * Toggles the border radius based on the menu type.
   * @param menuType - The type of the menu to toggle the border radius for.
   */
  toggleBorder(menuType: string) {
    switch (menuType) {
      case 'emoji':
        this.currentBorderRadius = '30px 30px 30px 30px';
        break;
      default:
        this.currentBorderRadius = '0px 30px 30px 30px';
    }
    document.documentElement.style.setProperty(
      '--border-radius',
      this.currentBorderRadius
    );
  }

  /**
   * Unsubscribes from the user data subscription.
   */
  ngOnDestroy(): void {
    if (this.userDataSubscription) this.userDataSubscription.unsubscribe();
  }

  /**
   * Handles the reaction of a message in a channel.
   * @param isReaction - A boolean value indicating whether the message is a reaction or not.
   */
  handleChannelReaction(isReaction: boolean): void {
    if (isReaction) this.emojiMenuTrigger.closeMenu();
  }
}
