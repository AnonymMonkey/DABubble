import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ChannelDescriptionComponent } from '../channel-description.component';

@Component({
  selector: 'app-channel-edit-name',
  standalone: true,
  imports: [MatIcon, ChannelDescriptionComponent],
  templateUrl: './channel-edit-name.component.html',
  styleUrl: './channel-edit-name.component.scss'
})
export class ChannelEditNameComponent {
  constructor(public description: ChannelDescriptionComponent) {}
}
