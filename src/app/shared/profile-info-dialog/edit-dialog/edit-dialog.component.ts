import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../services/user-service/user.service';
import { AuthService } from '../../services/auth-service/auth.service';

@Component({
  selector: 'app-edit-dialog',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-dialog.component.html',
  styleUrl: './edit-dialog.component.scss',
})
export class EditDialogComponent {
  editUserForm!: FormGroup;
  user: any;
  readonly dialogRef = inject(MatDialogRef<EditDialogComponent>);
  userService = inject(UserService);
  authService = inject(AuthService);
  formBuilder = inject(FormBuilder);

  ngOnInit() {
    this.editUserForm = this.formBuilder.group({
      name: ['', [this.fullNameValidator]],
      email: ['', [Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  fullNameValidator(control: any) {
    const value = control.value || '';
    if (value.trim() === '') {
      return null;
    }
    return value.trim().split(/\s+/).length >= 2 ? null : { fullName: true };
  }

  blockNumbers(event: KeyboardEvent) {
    const regex = /[0-9]/;

    if (regex.test(event.key)) {
      event.preventDefault(); // Zahleneingabe blockieren
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  get nameControl(): FormControl {
    return this.editUserForm.get('name') as FormControl;
  }

  get emailControl(): FormControl {
    return this.editUserForm.get('email') as FormControl;
  }

  get passwordControl(): FormControl {
    return this.editUserForm.get('password') as FormControl;
  }

  formatDisplayName(displayName: string): string {
    return displayName
      .trim() // Entfernt Leerzeichen am Anfang und Ende
      .replace(/\s+/g, ' ') // Ersetzt mehrere aufeinanderfolgende Leerzeichen durch ein einzelnes
      .split(' ') // Teilt den Namen in Wörter auf
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Erster Buchstabe groß, Rest klein
      .join(' '); // Fügt die Wörter wieder zusammen
  }

  applyChanges() {
    const newName = this.formatDisplayName(this.nameControl.value);
    const newEmail = this.emailControl.value;
    const password = this.passwordControl.value;
    this.userService.saveProfileChanges(this.user.uid, newName, newEmail);
    if (newEmail !== this.user.email) {
      this.authService.changeEmail(newEmail, password);
    }
    this.closeDialog();
  }
}
