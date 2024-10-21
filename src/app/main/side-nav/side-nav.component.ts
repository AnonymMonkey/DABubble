import { Component, Input, signal, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { CreateChannelDialogComponent } from './create-channel-dialog/create-channel-dialog.component';
import { ClickStopPropagationDirective } from '../../shared/directives/click-stop-propagation.directive';
import { UserData } from '../../shared/models/user.model';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [
    MatIconModule,
    MatSidenavModule,
    MatButtonModule,
    MatToolbarModule,
    MatExpansionModule,
    CommonModule,
    ClickStopPropagationDirective,
  ],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SideNavComponent {
  readonly panelOpenState = signal(false);
  @Input() userData!: UserData;

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    console.log(this.userData);
  }

  openCreateChannelDialog(): void {
    this.dialog.open(CreateChannelDialogComponent, {
      panelClass: 'create-channel-dialog',
    });
  }
}
