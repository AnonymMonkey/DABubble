import { Component } from '@angular/core';
import { LoginDialogComponent } from './login-dialog/login-dialog.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LoginDialogComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {}
