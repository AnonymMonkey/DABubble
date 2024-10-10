import { Component } from '@angular/core';
import { MainMessageAreaComponent } from './main-message-area/main-message-area.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [MainMessageAreaComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

}
