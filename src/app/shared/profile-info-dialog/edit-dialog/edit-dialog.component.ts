import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { AvatarDialogComponent } from '../avatar-dialog/avatar-dialog.component';

@Component({
  selector: 'app-edit-dialog',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTooltipModule,
  ],
  templateUrl: './edit-dialog.component.html',
  styleUrl: './edit-dialog.component.scss',
})
export class EditDialogComponent {
  @ViewChild('nameInput') inputElement!: ElementRef;
  editUserForm!: FormGroup;
  user: any;
  readonly dialogRef = inject(MatDialogRef<EditDialogComponent>);
  userService = inject(UserService);
  authService = inject(AuthService);
  formBuilder = inject(FormBuilder);
  errorMessage: string | null = '';
  // changeNameActivator: boolean = false;

  constructor(public dialog: MatDialog) {}

  ngOnInit() {
    this.editUserForm = this.formBuilder.group({
      name: [
        {
          value: '',
          disabled: true,
        },
        [this.fullNameValidator],
      ],
      email: [
        {
          value: '',
          disabled: true,
        },
        [Validators.email],
      ],
      password: [
        {
          value: '',
          disabled: true,
        },
      ],
    });
  }

  ngAfterViewChecked() {
    if (this.editUserForm.get('name')?.enabled) {
      this.inputElement.nativeElement.focus();
    }
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

  async applyChanges() {
    const newName = this.formatDisplayName(this.nameControl.value);
    const newEmail = this.emailControl.value;
    const password = this.passwordControl.value;
    if (newEmail !== this.user.email) {
      this.errorMessage = null;
      try {
        await this.authService.changeEmail(newEmail, password);
        this.userService.saveProfileChanges(this.user.uid, newName, newEmail);
        this.dialogRef.close();
      } catch (error) {
        this.errorMessage = 'Falsches Passwort.';
        throw error;
      }
    } else if (newEmail === '') {
      this.userService.saveProfileChanges(this.user.uid, newName, newEmail);
    }
  }

  saveNewName() {
    const newName = this.formatDisplayName(this.nameControl.value);
    if (newName) {
      this.userService.saveNewProfileName(this.user.uid, newName);
      this.user.displayName = newName;
      this.nameControl.setValue('');
      this.nameControl.disable();
    } else {
      this.nameControl.disable();
    }
  }

  openEditAvatar(): void {
    const dialogRef = this.dialog.open(AvatarDialogComponent);
    dialogRef.componentInstance.photoURL = this.user.photoURL;

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.userService.saveAvatar(this.user.uid, result);
        this.user.photoURL = result;
      }
    });
  }
}
