import { Component, ViewEncapsulation } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-private-chat-header',
  standalone: true,
  imports: [MatToolbarModule, MatMenuModule,],
  templateUrl: './private-chat-header.component.html',
  styleUrl: './private-chat-header.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class PrivateChatHeaderComponent {
  isMenuOpened: boolean = false;
}
