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
  userService = inject(UserService);
  userData!: UserData;
  allUserData!: UserData[];

  newAllUserData: { userId: string; userName: string; photoUrl: string }[] = [];

  constructor() {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.userService.userData$.subscribe((data) => {
      this.userData = data; // Empfange die Benutzerdaten
    });

    this.userService.allUserData$.subscribe((data) => {
      // console.log(data[0].displayName);
      data.forEach((element) => {
        // console.log(element.displayName);

        this.newAllUserData.push({
          userId: element.uid,
          userName: element.displayName,
          photoUrl: element.photoURL,
        });
      });
      console.log(this.newAllUserData);

      // this.allUserData = data;
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
  readonly fruits = signal<string[]>([]);
  readonly allUsers: string[] = [
    'Apple',
    'Lemon',
    'Lime',
    'Orange',
    'Strawberry',
  ];
  // readonly filteredUsers = computed(() => {
  //   const currentUser = this.currentUser().toLowerCase();
  //   return currentUser
  //     ? this.allUsers.filter(
  //         (fruit) =>
  //           fruit.toLowerCase().includes(currentUser) &&
  //           !this.fruits().includes(fruit)
  //       )
  //     : this.allUsers.filter((fruit) => !this.fruits().includes(fruit));
  // });

  readonly filteredUsersTest = computed(() => {
    const currentUser = this.currentUser().toLowerCase();
    return currentUser
      ? this.newAllUserData.filter(
          (user) =>
            user.userName.toLowerCase().includes(currentUser) &&
            !this.fruits().includes(user.userName)
        )
      : this.newAllUserData.filter(
          (user) => !this.fruits().includes(user.userName)
        );
  });

  readonly announcer = inject(LiveAnnouncer);

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (
      value &&
      this.allUsers.includes(value) &&
      !this.fruits().includes(value)
    ) {
      this.fruits.update((fruits) => [...fruits, value]);
    }

    // Clear the input value
    this.currentUser.set('');
    if (event.input) {
      event.input.value = '';
    }
  }

  remove(fruit: string): void {
    this.fruits.update((fruits) => {
      const index = fruits.indexOf(fruit);
      if (index < 0) {
        return fruits;
      }

      fruits.splice(index, 1);
      this.announcer.announce(`Removed ${fruit}`);
      return [...fruits];
    });
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;

    // Nur hinzufügen, wenn das Element noch nicht in der Liste enthalten ist
    if (!this.fruits().includes(value)) {
      this.fruits.update((fruits) => [...fruits, value]);
    }

    this.currentUser.set('');
    event.option.deselect();
  }

  test() {
    console.log(this.fruits());
    this.newChannelData.channelName = this.channelName;
    this.newChannelData.description = this.description;
    this.newChannelData.admin.userId = this.userData.uid;
    this.newChannelData.admin.userName = this.userData.displayName;
    this.newChannelData.admin.photoURL = this.userData.photoURL;
    console.log(this.fruits());

    // console.log(this.newChannelData);
    // console.log(this.allUserData);
  }
}
