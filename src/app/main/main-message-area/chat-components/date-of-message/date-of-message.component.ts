import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-date-of-message',
  standalone: true,
  imports: [],
  templateUrl: './date-of-message.component.html',
  styleUrl: './date-of-message.component.scss'
})
export class DateOfMessageComponent {
  @Input() date: string = '';

  constructor() {}
}
