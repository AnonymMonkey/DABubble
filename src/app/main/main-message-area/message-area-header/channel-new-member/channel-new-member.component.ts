import { Component, computed, inject, model, OnInit, signal } from '@angular/core';
import { MessageAreaHeaderComponent } from '../message-area-header.component';
import { MatIcon } from '@angular/material/icon';
import { Channel } from '../../../../shared/models/channel.model';
import { ChannelService } from '../../../../shared/services/channel-service/channel.service';
import { MatFormField } from '@angular/material/form-field';
import { MatChipGrid, MatChipInput, MatChipInputEvent, MatChipRow } from '@angular/material/chips';
import { MatAutocomplete, MatAutocompleteModule, MatAutocompleteSelectedEvent, MatOption } from '@angular/material/autocomplete';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../shared/services/user-service/user.service';
import { UserData } from '../../../../shared/models/user.model';
import { MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { NgIf } from '@angular/common';


@Component({
  selector: 'app-channel-new-member',
  standalone: true,
  imports: [MessageAreaHeaderComponent, MatDialogContent, MatDialogActions, NgIf, MatIcon, MatFormField, MatChipGrid, MatChipRow, MatChipInput, MatAutocomplete, MatAutocompleteModule, FormsModule, MatOption,  ],
  templateUrl: './channel-new-member.component.html',
  styleUrl: './channel-new-member.component.scss'
})
export class ChannelNewMemberComponent implements OnInit {
  currentChannel: Channel | undefined;
  // readonly dialogRef = inject(
  //   MatDialogRef<ChannelNewMemberComponent>
  // );
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

  constructor(public header: MessageAreaHeaderComponent) { }

  ngOnInit(): void {
    this.channelService.currentChannel$.subscribe((data) => {
      this.currentChannel = data;
    })
   
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
      next: (channelId) => {},
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
