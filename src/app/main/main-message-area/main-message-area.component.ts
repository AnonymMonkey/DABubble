import { Component } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import { MessageAreaHeaderComponent } from './message-area-header/message-area-header.component';

@Component({
  selector: 'app-main-message-area',
  standalone: true,
  imports: [MatCardModule, MessageAreaHeaderComponent],
  templateUrl: './main-message-area.component.html',
  styleUrl: './main-message-area.component.scss'
})
export class MainMessageAreaComponent {

}
