import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { NewMessageHeaderComponent } from './new-message-header/new-message-header.component';
import { NewMessagePlaceholderNewMessageComponent } from './new-message-placeholder-new-message/new-message-placeholder-new-message.component';

@Component({
  selector: 'app-new-message-placeholder',
  standalone: true,
  imports: [MatCardModule, NewMessageHeaderComponent, NewMessagePlaceholderNewMessageComponent],
  templateUrl: './new-message-placeholder.component.html',
  styleUrl: './new-message-placeholder.component.scss'
})
export class NewMessagePlaceholderComponent {

}
