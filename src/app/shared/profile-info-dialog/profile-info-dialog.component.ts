import { Component, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-profile-info-dialog',
  standalone: true,
  imports: [MatIconModule, MatInputModule, MatCardModule],
  templateUrl: './profile-info-dialog.component.html',
  styleUrl: './profile-info-dialog.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ProfileInfoDialogComponent {}
