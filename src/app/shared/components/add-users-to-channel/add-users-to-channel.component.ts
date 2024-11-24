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

  newAllUserData = signal<
    { userId: string; userName: string; photoURL: string }[]
  >([]);

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.newChannelData = new Channel();
    this.initializeUserData();
    this.initializeData();
    this.updateUsers();

    if (this.closeAutocompleteEmitter) {
      this.closeAutocompleteEmitter.subscribe(() => {
        this.closeAutocomplete();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['channelId']) {
      this.initializeData();
    }
  }

  initializeData() {
    this.initializeChannelData();
    this.initializeAllUserData();
  }

  initializeUserData(): void {
    this.userService.userData$.subscribe((data) => {
      this.userData = data; // Empfange die Benutzerdaten
    });
  }

  initializeChannelData(): void {
    if (this.channelId !== '') {
      this.channelService
        .getChannelById(this.channelId)
        .subscribe((channel) => {
          if (channel) {
            this.newChannelData = channel;
            this.filterAvailableUsers();
          }
        });
    }
  }

  initializeAllUserData(): void {
    if (!this.channelId) {
      this.userService.allUserData$.subscribe((data) => {
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

  filterAvailableUsers(): void {
    this.userService.allUserData$.subscribe((data) => {
      this.newAllUserData.set(
        data
          .filter(
            (element) => !this.newChannelData.members.includes(element.uid) // Filtern
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

  checkUsersArray(): void {
    const isEmpty = this.users().length === 0;
    this.usersEmpty.emit(isEmpty);
  }

  //NOTE - Hier werden die chips angezeigt

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

    // Finde den entsprechenden Benutzer basierend auf dem eingegebenen `userName`
    const selectedUser = this.newAllUserData().find(
      (user) => user.userName === value
    );

    // Benutzer hinzufügen, wenn er existiert und noch nicht in `users` enthalten ist
    if (
      selectedUser &&
      !this.users().some((user) => user.userId === selectedUser.userId) // Verhindern, dass der Benutzer doppelt hinzugefügt wird
    ) {
      this.users.update((users) => [
        ...users,
        {
          userId: selectedUser.userId,
          userName: selectedUser.userName,
          photoURL: selectedUser.photoURL,
        },
      ]); // Das komplette Benutzerobjekt hinzufügen
    }

    // Input zurücksetzen
    this.currentUser.set('');
    if (event.input) {
      event.input.value = '';
    }
  }

  remove(user: { userId: string; userName: string; photoURL: string }): void {
    this.users.update((users) => {
      const index = users.findIndex((f) => f.userId === user.userId); // Suchen nach der userId
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
    // Finde den Benutzer, der der Auswahl entspricht
    const selectedUser = this.newAllUserData().find(
      (user) => user.userId === event.option.value.userId
    );
    // Nur hinzufügen, wenn das Benutzerobjekt existiert und die userId noch nicht in der Liste ist
    if (
      selectedUser &&
      !this.users().some((user) => user.userId === selectedUser.userId) // Überprüfen, ob der Benutzer bereits existiert
    ) {
      // Benutzerobjekt hinzufügen, nicht nur die userId
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

    // Input zurücksetzen
    this.currentUser.set('');
    event.option.deselect();
  }

  createNewChannel() {
    this.bindDialogDataToNewChannelData();
    this.channelService.createChannel(this.newChannelData).subscribe({
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

  //ANCHOR - Semir - Es werden nur noch die IDS zusätzlich eingefügt.
  bindDialogDataToNewChannelData() {
    this.newChannelData.admin.userId = this.userData.uid;
    this.newChannelData.members = this.users().map((user) => user.userId); // Nur die userIds speichern
  }

  updateExistingChannel() {
    const newUsers = this.users().map((user) => user.userId);
    newUsers.forEach((userId) => {
      this.channelService.addUserToChannel(userId, this.channelId);
      this.userService.addNewChannelToUser(userId, this.channelId);
    });
  }

  closeAutocomplete(): void {
    this.autoTrigger.closePanel();
  }
}
