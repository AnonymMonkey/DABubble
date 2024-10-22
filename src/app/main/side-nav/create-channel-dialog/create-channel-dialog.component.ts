import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-create-channel-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    MatIcon,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
  ],
  templateUrl: './create-channel-dialog.component.html',
  styleUrl: './create-channel-dialog.component.scss',
})
export class CreateChannelDialogComponent {
  channelName: string = '';
  description: string = '';
  invalid: boolean = true;

  readonly dialogRef = inject(MatDialogRef<CreateChannelDialogComponent>);

  constructor() {}

  checkInputEmpty() {
    if (this.channelName.length == 0) {
      this.invalid = true;
    } else {
      this.invalid = false;
    }
  }

  test() {
    console.log(this.channelName);
    console.log(this.description);
  }
}
