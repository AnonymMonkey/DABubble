import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import {
  MatAutocomplete,
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Channel } from '../../models/channel.model';
import { UserData } from '../../models/user.model';
import { UserService } from '../../services/user-service/user.service';
import { ChannelService } from '../../services/channel-service/channel.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-users-to-channel',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatChipsModule,
    MatInputModule,
    MatAutocompleteModule,
    CommonModule,
    MatIconModule,
    MatAutocompleteTrigger,
    MatAutocomplete,
  ],
  templateUrl: './add-users-to-channel.component.html',
  styleUrl: './add-users-to-channel.component.scss',
})
export class AddUsersToChannelComponent {
  channelService = inject(ChannelService);
  userService = inject(UserService);
  userData!: UserData;
  allUserData!: UserData[];
  newChannelData!: Channel;
  @Input() channelId: string = '';
  isLoading = true;
  @Output() usersEmpty = new EventEmitter<boolean>();
  @Input() closeAutocompleteEmitter!: EventEmitter<void>;
  @ViewChild(MatAutocompleteTrigger) autoTrigger!: MatAutocompleteTrigger;
  router = inject(Router);
  closeAutocompleteSubscription!: Subscription;
  channelSubscription!: Subscription;
  userSubscription!: Subscription;
  userDataSubscription!: Subscription;
  newChannelDataSubscription!: Subscription;
  newAllUserData = signal<
    { userId: string; userName: string; photoURL: string }[]
  >([]);
  allUserDataSubscription!: Subscription;


  constructor(private route: ActivatedRoute) {}

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
    this.newChannelData = new Channel();
    this.initializeUserData();
    this.initializeData();
    this.updateUsers();
    if (this.closeAutocompleteEmitter) {
      this.closeAutocompleteSubscription =
        this.closeAutocompleteEmitter.subscribe(() => {
          this.closeAutocomplete();
        });
    }
  }

  /**
   * Unsubscribes from the subscriptions when the component is destroyed.
   */
  ngOnDestroy(): void {
    if (this.closeAutocompleteSubscription)
      this.closeAutocompleteSubscription.unsubscribe();
    if (this.channelSubscription) this.channelSubscription.unsubscribe();
    if (this.userSubscription) this.userSubscription.unsubscribe();
    if (this.userDataSubscription) this.userDataSubscription.unsubscribe();
    if (this.allUserDataSubscription) this.allUserDataSubscription.unsubscribe();
    if (this.newChannelDataSubscription)
      this.newChannelDataSubscription.unsubscribe();
  }

  /**
   * Handles changes to the channelId input.
   * @param changes - The changes object.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['channelId']) {
      this.initializeData();
    }
  }

  /**
   * Initializes the data for the component.
   */
  initializeData() {
    this.initializeChannelData();
    this.initializeAllUserData();
  }

  /**
   * Initializes the user data for the component.
   */
  initializeUserData(): void {
    this.userDataSubscription = this.userService.userData$.subscribe((data) => {
      this.userData = data;
    });
  }

  /**
   * Initializes the channel data for the component.
   */
  initializeChannelData(): void {
    if (this.channelId !== '') {
      this.channelSubscription = this.channelService
        .getChannelById(this.channelId)
        .subscribe((channel) => {
          if (channel) {
            this.newChannelData = channel;
            this.filterAvailableUsers();
          }
        });
    }
  }

  /**
   * Initializes the all user data for the component.
   */
  initializeAllUserData(): void {
    if (!this.channelId) {
      this.userSubscription = this.userService.allUserData$.subscribe((data) => {
        this.newAllUserData.set(
          data.map((element) => ({
            userId: element.uid,
            userName: element.displayName,
            photoURL: element.photoURL,
          }))
        );
      });
      this.isLoading = false;
    }
  }

  /**
   * Filters the available users for the channel.
   */
  filterAvailableUsers(): void {
    this.allUserDataSubscription = this.userService.allUserData$.subscribe((data) => {
      this.newAllUserData.set(
        data
          .filter(
            (element) => !this.newChannelData.members.includes(element.uid)
          )
          .map((element) => ({
            userId: element.uid,
            userName: element.displayName,
            photoURL: element.photoURL,
          }))
      );
    });
    this.isLoading = false;
  }

  /**
   * Adds the current user to the channel.
   */
  updateUsers(): void {
    if (this.channelId) return;
    this.users.update((users) => [
      ...users,
      {
        userId: this.userData?.uid,
        userName: this.userData?.displayName,
        photoURL: this.userData?.photoURL,
      },
    ]);
  }

  /**
   * Checks if the users array is empty and emits an event if it is.
   */
  checkUsersArray(): void {
    const isEmpty = this.users().length === 0;
    this.usersEmpty.emit(isEmpty);
  }

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  currentUser = signal<string>('');

  readonly users = signal<
    { userId: string; userName: string; photoURL: string }[]
  >([]);

  readonly filteredUsers = computed(() => {
    if (this.isLoading) {
      return [];
    }

    const currentUser = this.currentUser().toLowerCase();

    return this.newAllUserData().filter((user) => {
      const isAlreadyInList = this.users().some(
        (userInList) => userInList.userId === user.userId
      );

      if (currentUser) {
        return (
          user.userName.toLowerCase().includes(currentUser) && !isAlreadyInList
        );
      } else {
        return !isAlreadyInList;
      }
    });
  });

  readonly announcer = inject(LiveAnnouncer);

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    const selectedUser = this.newAllUserData().find(
      (user) => user.userName === value
    );
    if (
      selectedUser &&
      !this.users().some((user) => user.userId === selectedUser.userId)
    ) {
      this.users.update((users) => [
        ...users,
        {
          userId: selectedUser.userId,
          userName: selectedUser.userName,
          photoURL: selectedUser.photoURL,
        },
      ]);
    }
    this.currentUser.set('');
    if (event.input) {
      event.input.value = '';
    }
  }

  remove(user: { userId: string; userName: string; photoURL: string }): void {
    this.users.update((users) => {
      const index = users.findIndex((f) => f.userId === user.userId);
      if (index < 0) {
        return users;
      }

      users.splice(index, 1);
      this.announcer.announce(`Removed ${user.userName}`);
      return [...users];
    });
    this.checkUsersArray();
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const selectedUser = this.newAllUserData().find(
      (user) => user.userId === event.option.value.userId
    );
    if (
      selectedUser &&
      !this.users().some((user) => user.userId === selectedUser.userId)
    ) {
      this.users.update((users) => [
        ...users,
        {
          userId: selectedUser.userId,
          userName: selectedUser.userName,
          photoURL: selectedUser.photoURL,
        },
      ]);
    }
    this.checkUsersArray();
    this.currentUser.set('');
    event.option.deselect();
  }

  createNewChannel() {
    this.bindDialogDataToNewChannelData();
    this.newChannelDataSubscription =  this.channelService.createChannel(this.newChannelData).subscribe({
      next: (channelId) => {
        this.router.navigate([
          `/main/${this.userData.uid}/channel/${channelId}`,
        ]);
      },
      error: (error) => {
        console.error('Fehler beim Erstellen des Channels:', error);
      },
    });
  }

  /**
   * Binds the dialog data to the new channel data.
   */
  bindDialogDataToNewChannelData() {
    this.newChannelData.admin.userId = this.userData.uid;
    this.newChannelData.members = this.users().map((user) => user.userId);
  }

  /**
   * Updates the existing channel with the new users.
   */
  updateExistingChannel() {
    const newUsers = this.users().map((user) => user.userId);
    newUsers.forEach((userId) => {
      this.channelService.addUserToChannel(userId, this.channelId);
      this.userService.addNewChannelToUser(userId, this.channelId);
    });
  }

  /**
   * Closes the autocomplete panel.
   */
  closeAutocomplete(): void {
    this.autoTrigger.closePanel();
  }
}
