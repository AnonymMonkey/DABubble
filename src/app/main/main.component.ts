import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { MainMessageAreaComponent } from './main-message-area/main-message-area.component';
import { MatIconModule } from '@angular/material/icon';
// import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-main',
  standalone: true,
  imports: [HeaderComponent, MainMessageAreaComponent, MatIconModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {}
