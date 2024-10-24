import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { MainMessageAreaComponent } from './main-message-area/main-message-area.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { SideNavComponent } from './side-nav/side-nav.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, RouterOutlet } from '@angular/router';
import { UserService } from '../shared/services/user-service/user.service';
import { UserData } from '../shared/models/user.model';
import { catchError, of, Subscription } from 'rxjs';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    HeaderComponent,
    MainMessageAreaComponent,
    MatIconModule,
    MatSidenavModule,
    MatButtonModule,
    SideNavComponent,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent {
  userId!: string;
  userData!: UserData;
  subscription!: Subscription;
  userService = inject(UserService);

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe((params) => {
      this.userId = params['uid'];
    });
  }

  ngOnInit() {
    this.userService.loadAllUserData();
    this.userService.loadUserDataByUID(this.userId);
    this.userService.userData$.subscribe((data) => {
      this.userData = data; // Empfange die Benutzerdaten
      console.log(this.userData);
    });
  }
}
