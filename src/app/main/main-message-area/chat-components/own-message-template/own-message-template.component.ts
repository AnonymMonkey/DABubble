import { Component } from '@angular/core';
import { MainMessageAreaComponent } from '../../main-message-area.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-own-message-template',
  standalone: true,
  imports: [NgClass],
  templateUrl: './own-message-template.component.html',
  styleUrl: './own-message-template.component.scss'
})
export class OwnMessageTemplateComponent {
  isEmojiContainerVisible: number = 0;

  constructor(public mainMessageArea: MainMessageAreaComponent) {}
  showEmojiContainer(id: number) {
    this.isEmojiContainerVisible = id;
  }

  hideEmojiContainer() {
    this.isEmojiContainerVisible = 0;
  }
}
