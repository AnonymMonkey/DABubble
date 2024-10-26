import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { MainComponent } from '../../main.component';

@Component({
  selector: 'app-private-chat-placeholder',
  standalone: true,
  imports: [NgIf],
  templateUrl: './private-chat-placeholder.component.html',
  styleUrl: './private-chat-placeholder.component.scss',
})
export class PrivateChatPlaceholderComponent {
  currentUserId: string = '';
  chatUserId: string = ''; // Setze dies auf die ID des Chat-Benutzers

  constructor(private main: MainComponent) {
    this.currentUserId = this.main.userId;
  }

  isChatWithSelf(): boolean {
    return this.currentUserId === this.chatUserId;
  }
}
