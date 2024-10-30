import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';

@Component({
  selector: 'app-new-message-header',
  standalone: true,
  imports: [MatToolbarModule, SearchBarComponent],
  templateUrl: './new-message-header.component.html',
  styleUrl: './new-message-header.component.scss'
})
export class NewMessageHeaderComponent {

}
