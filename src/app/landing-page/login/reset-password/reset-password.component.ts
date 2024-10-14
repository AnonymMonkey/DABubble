import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [MatCardModule, MatIconModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {}
