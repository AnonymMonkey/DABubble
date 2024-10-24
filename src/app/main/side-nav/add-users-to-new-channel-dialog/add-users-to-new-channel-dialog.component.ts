import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, computed, inject, model, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
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

  constructor() {}

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
  readonly allFruits: string[] = [
    'Apple',
    'Lemon',
    'Lime',
    'Orange',
    'Strawberry',
  ];
  readonly filteredFruits = computed(() => {
    const currentUser = this.currentUser().toLowerCase();
    return currentUser
      ? this.allFruits.filter(
          (fruit) =>
            fruit.toLowerCase().includes(currentUser) &&
            !this.fruits().includes(fruit)
        )
      : this.allFruits.filter((fruit) => !this.fruits().includes(fruit));
  });

  readonly announcer = inject(LiveAnnouncer);

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (
      value &&
      this.allFruits.includes(value) &&
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
  }
}
