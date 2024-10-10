import { Component } from '@angular/core';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-main-message-area',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './main-message-area.component.html',
  styleUrl: './main-message-area.component.scss'
})
export class MainMessageAreaComponent {

}
