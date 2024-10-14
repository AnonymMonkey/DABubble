import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MainMessageAreaComponent } from '../../main-message-area.component';

@Component({
  selector: 'app-thread-header',
  standalone: true,
  imports: [MatIcon, MainMessageAreaComponent],
  templateUrl: './thread-header.component.html',
  styleUrl: './thread-header.component.scss',
})
export class ThreadHeaderComponent {

  constructor(public mainMessageArea: MainMessageAreaComponent) {}
  
}
