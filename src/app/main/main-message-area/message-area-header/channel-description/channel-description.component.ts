import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatFormField } from '@angular/material/form-field';
import { MatMenu } from '@angular/material/menu';
import { MessageAreaHeaderComponent } from '../message-area-header.component';


@Component({
  selector: 'app-channel-description',
  standalone: true,
  imports: [MatIcon, MatCard, MatExpansionModule, MatFormField, MatMenu, MessageAreaHeaderComponent],
  templateUrl: './channel-description.component.html',
  styleUrl: './channel-description.component.scss'
})
export class ChannelDescriptionComponent {
  constructor(public header: MessageAreaHeaderComponent) { }
}
