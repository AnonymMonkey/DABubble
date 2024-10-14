import { Component } from '@angular/core';
import { ChannelDescriptionComponent } from '../channel-description.component';

@Component({
  selector: 'app-channel-display-name',
  standalone: true,
  imports: [ChannelDescriptionComponent],
  templateUrl: './channel-display-name.component.html',
  styleUrl: './channel-display-name.component.scss'
})
export class ChannelDisplayNameComponent {

  constructor(public description: ChannelDescriptionComponent) {}

}
