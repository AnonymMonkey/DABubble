import { Component } from '@angular/core';
import { MainMessageAreaComponent } from '../../main-message-area.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-other-message-template',
  standalone: true,
  imports: [NgClass],
  templateUrl: './other-message-template.component.html',
  styleUrl: './other-message-template.component.scss'
})
export class OtherMessageTemplateComponent {
  isEmojiContainerVisible: number = 0;

  constructor(public mainMessageArea: MainMessageAreaComponent) {}
  showEmojiContainer(id: number) {
    this.isEmojiContainerVisible = id;
  }

  hideEmojiContainer() {
    this.isEmojiContainerVisible = 0;
  }
}
