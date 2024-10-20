import { Component, Input, ViewEncapsulation } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { ProfileDialogComponent } from './profile-dialog/profile-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { UserData } from '../../shared/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent {
  userId!: string;
  @Input() userData!: UserData;

  constructor(public dialog: MatDialog, private route: ActivatedRoute) {
    this.route.params.subscribe((params) => {
      this.userId = params['uid'];
      // console.log(this.userId);
    });
  }
  toggleDropdown(): void {
    const dialogRef = this.dialog.open(ProfileDialogComponent);
  }
}
