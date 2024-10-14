import { Component } from '@angular/core';
import { ChannelDescriptionComponent } from '../channel-description.component';

@Component({
  selector: 'app-channel-display-description',
  standalone: true,
  imports: [ChannelDescriptionComponent],
  templateUrl: './channel-display-description.component.html',
  styleUrl: './channel-display-description.component.scss'
})
export class ChannelDisplayDescriptionComponent {

  constructor(public description: ChannelDescriptionComponent) {}
}
