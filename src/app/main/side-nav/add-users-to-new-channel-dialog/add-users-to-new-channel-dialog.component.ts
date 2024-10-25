import { AsyncPipe, CommonModule } from '@angular/common';
import {
  Component,
  computed,
  Inject,
  inject,
  model,
  signal,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { Channel } from '../../../shared/models/channel.model';
import { UserService } from '../../../shared/services/user-service/user.service';
import { UserData } from '../../../shared/models/user.model';
import { ChannelService } from '../../../shared/services/channel-service/channel.service';

@Component({
  selector: 'app-add-users-to-new-channel-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatIconModule,
    MatRadioModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatChipsModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
  ],
  templateUrl: './add-users-to-new-channel-dialog.component.html',
  styleUrl: './add-users-to-new-channel-dialog.component.scss',
})
export class AddUsersToNewChannelDialogComponent {
  readonly dialogRef = inject(
    MatDialogRef<AddUsersToNewChannelDialogComponent>
  );
  radioValue: number = 0;
  invalid: boolean = true;
  channelName: string = '';
  description: string = '';
  newChannelData!: Channel;
  channelService = inject(ChannelService);
  userService = inject(UserService);
  userData!: UserData;
  allUserData!: UserData[];

  newAllUserData: { userId: string; userName: string; photoURL: string }[] = [];

  constructor() {}

  ngOnInit(): void {
    this.userService.userData$.subscribe((data) => {
      this.userData = data; // Empfange die Benutzerdaten
    });

    this.userService.allUserData$.subscribe((data) => {
      data.forEach((element) => {
        this.newAllUserData.push({
          userId: element.uid,
          userName: element.displayName,
          photoURL: element.photoURL,
        });
      });
    });
    this.newChannelData = new Channel();
  }

  checkChoice() {
    if (this.radioValue != 0) {
      this.invalid = false;
    } else {
      this.invalid = true;
    }
  }

  //NOTE - Hier werden die chips angezeigt

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly currentUser = model('');

  readonly users = signal<
    {
      userId: string;
      userName: string;
      photoURL: string;
    }[]
  >([]);
  readonly allUsers: string[] = [];

  readonly filteredUsers = computed(() => {
    const currentUser = this.currentUser().toLowerCase();

    return currentUser
      ? this.newAllUserData.filter(
          (user) =>
            user.userName.toLowerCase().includes(currentUser) &&
            !this.users().some((element) => element.userName === user.userName)
        )
      : this.newAllUserData.filter(
          (user) =>
            !this.users().some((element) => element.userName === user.userName)
        );
  });

  readonly announcer = inject(LiveAnnouncer);

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Finde den entsprechenden Benutzer basierend auf dem eingegebenen `userName`
    const selectedUser = this.newAllUserData.find(
      (user) => user.userName === value
    );

    // Benutzer hinzufügen, wenn er existiert und noch nicht in `users` enthalten ist
    if (
      selectedUser &&
      !this.users().some((user) => user.userName === selectedUser.userName)
    ) {
      this.users.update((users) => [...users, selectedUser]);
    }

    // Input zurücksetzen
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
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const selectedUser = this.newAllUserData.find(
      (user) => user.userName === event.option.viewValue
    );

    // Nur hinzufügen, wenn das Objekt existiert und noch nicht in der Liste enthalten ist
    if (
      selectedUser &&
      !this.users().some((user) => user.userId === selectedUser.userId)
    ) {
      this.users.update((users) => [...users, selectedUser]);
    }

    this.currentUser.set('');
    event.option.deselect();
  }

  test() {
    this.bindDialogDataToNewChannelData();
    this.channelService.createChannel(this.newChannelData).subscribe({
      next: (channelId) => {
        console.log('Neuer Channel erstellt mit ID:', channelId);
      },
      error: (error) => {
        console.error('Fehler beim Erstellen des Channels:', error);
      },
    });
  }

  bindDialogDataToNewChannelData() {
    this.newChannelData.channelName = this.channelName;
    this.newChannelData.description = this.description;
    this.newChannelData.admin.userId = this.userData.uid;
    this.newChannelData.admin.userName = this.userData.displayName;
    this.newChannelData.admin.photoURL = this.userData.photoURL;
    this.newChannelData.members = this.users();
  }
}
