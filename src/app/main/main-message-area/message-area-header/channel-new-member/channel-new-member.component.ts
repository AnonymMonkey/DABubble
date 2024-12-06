import {
  Component,
  EventEmitter,
  inject,
  Output,
  ViewChild,
} from '@angular/core';
import { MessageAreaHeaderComponent } from '../message-area-header.component';
import { MatIcon } from '@angular/material/icon';
import { Channel } from '../../../../shared/models/channel.model';
import { ChannelService } from '../../../../shared/services/channel-service/channel.service';
import { MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { AddUsersToChannelComponent } from '../../../../shared/components/add-users-to-channel/add-users-to-channel.component';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-channel-new-member',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatIcon,
    AddUsersToChannelComponent,
    CommonModule,
  ],
  templateUrl: './channel-new-member.component.html',
  styleUrl: './channel-new-member.component.scss',
})
export class ChannelNewMemberComponent {
  @ViewChild(AddUsersToChannelComponent)
  addUsersToChannel!: AddUsersToChannelComponent;
  currentChannel: Channel | undefined;
  channelId: string = '';
  invalid: boolean = true;
  channelService = inject(ChannelService);
  channelSubscription: Subscription | undefined;
  routeSubscription: Subscription | undefined;
  @Output() closeAutocompleteEmitter = new EventEmitter<void>();

  constructor(
    public header: MessageAreaHeaderComponent,
    private route: ActivatedRoute
  ) {}

  /**
   * Subscribe to the current channel and the route parameters to get the channel ID.
   */
  ngOnInit(): void {
    this.channelSubscription = this.channelService.currentChannel$.subscribe((data) => {
      if (data) this.currentChannel = data;
    });
    this.routeSubscription = this.route.params.subscribe((params) => {
      this.channelId = params['channelId'];
    });
  }

  /**
   * Unsubscribe from the channel subscription when the component is destroyed.
   */
  ngOnDestroy(): void {
    this.channelSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();
  }

  /**
   * Handles the event when the user list is empty.
   * @param isEmpty - True if the user list is empty, false otherwise.
   */
  handleUsersEmpty(isEmpty: boolean): void {
    this.invalid = isEmpty;
  }

  /**
   * Creates a new channel or updates an existing one.
   */
  create() {
    if (this.channelId === '') this.addUsersToChannel.createNewChannel();
    else this.addUsersToChannel.updateExistingChannel();
    this.closeAutocomplete();
    this.header.closeMenu('add-member');
  }

  /**
   * Emits an event to close the autocomplete.
   */
  closeAutocomplete(): void {
    this.closeAutocompleteEmitter.emit();
  }
}
