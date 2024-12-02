import { Component, inject, Input } from '@angular/core';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { MessageService } from '../../services/message-service/message.service';
import { PrivateChatService } from '../../services/private-chat-service/private-chat.service';
import { ThreadService } from '../../services/thread-service/thread.service';
import { ChannelService } from '../../services/channel-service/channel.service';

@Component({
  selector: 'app-emoji-picker',
  standalone: true,
  imports: [PickerModule],
  templateUrl: './emoji-picker.component.html',
  styleUrl: './emoji-picker.component.scss',
})
export class EmojiPickerComponent {
  @Input() message!: any;
  @Input() component: string = '';
  private messageService = inject(MessageService);
  private privateChatService = inject(PrivateChatService);
  private channelService = inject(ChannelService);
  private threadService = inject(ThreadService);

  constructor() {}

  /**
   * Adds or updates a reaction to a message based on its type (channel, thread, or private chat).
   * @param messageId The ID of the message to react to.
   * @param emoji The emoji to be added or updated as a reaction.
   * @param component The type of component ('channel' or 'privateChat').
   */
  addReaction(
    messageId: string,
    emoji: { shortName: string; [key: string]: any },
    component: string
  ): void {
    if (component === 'channel') {
      this.handleChannelReaction(messageId, emoji);
    } else if (component === 'privateChat') {
      this.handlePrivateChatReaction(messageId, emoji);
    }
  }

  /**
   * Handles adding or updating a reaction for messages in a channel or thread.
   * @param messageId The ID of the message to react to.
   * @param emoji The emoji to be added or updated as a reaction.
   */
  private handleChannelReaction(
    messageId: string,
    emoji: { shortName: string; [key: string]: any }
  ): void {
    const channelPath = this.getChannelPath(messageId);
    const threadPath = this.getThreadPath(messageId);
    this.messageService.setActualMessage(this.message);
    if (messageId.startsWith('msg_')) {
      this.messageService.addOrChangeReactionChannelOrThread(
        emoji,
        channelPath
      );
    } else if (messageId.startsWith('thread_')) {
      this.messageService.addOrChangeReactionChannelOrThread(emoji, threadPath);
    }
  }

  /**
   * Handles adding or updating a reaction for messages in a private chat.
   * @param messageId The ID of the message to react to.
   * @param emoji The emoji to be added or updated as a reaction.
   */
  private handlePrivateChatReaction(
    messageId: string,
    emoji: { shortName: string; [key: string]: any }
  ): void {
    this.privateChatService
      .setActualMessage(messageId)
      .then(() => {
        this.privateChatService.addOrChangeReactionPrivateChat(
          messageId,
          emoji
        );
      })
      .catch((error) =>
        console.error('Fehler beim Setzen der Nachricht:', error)
      );
  }

  /**
   * Constructs the Firestore path for a channel message.
   * @param messageId The ID of the message.
   * @returns The Firestore path for the channel message.
   */
  private getChannelPath(messageId: string): string {
    return `channels/${this.channelService.channelId}/messages/${messageId}`;
  }

  /**
   * Constructs the Firestore path for a thread message.
   * @param messageId The ID of the thread message.
   * @returns The Firestore path for the thread message.
   */
  private getThreadPath(messageId: string): string {
    return `channels/${this.channelService.channelId}/messages/${this.threadService.actualMessageSubject.value?.messageId}/thread/${messageId}`;
  }
}
