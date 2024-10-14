import { Component } from '@angular/core';
import { ChannelDescriptionComponent } from '../channel-description.component';

@Component({
  selector: 'app-channel-edit-description',
  standalone: true,
  imports: [ChannelDescriptionComponent],
  templateUrl: './channel-edit-description.component.html',
  styleUrl: './channel-edit-description.component.scss'
})
export class ChannelEditDescriptionComponent {

  constructor(public description: ChannelDescriptionComponent) {}
}
