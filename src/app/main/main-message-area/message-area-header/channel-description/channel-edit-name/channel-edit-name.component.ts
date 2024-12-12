import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ChannelDescriptionComponent } from '../channel-description.component';
import { Channel } from '../../../../../shared/models/channel.model';
import { ChannelService } from '../../../../../shared/services/channel-service/channel.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { UserService } from '../../../../../shared/services/user-service/user.service';
import { UserData } from '../../../../../shared/models/user.model';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-channel-edit-name',
  standalone: true,
  imports: [MatIcon, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './channel-edit-name.component.html',
  styleUrl: './channel-edit-name.component.scss',
})
export class ChannelEditNameComponent implements OnInit {
  userId!: string;
  @ViewChild('channelNameInput') channelNameInputElement!: ElementRef;
  userService = inject(UserService);
  channelService = inject(ChannelService);
  currentChannel: Channel | undefined;
  newChannelName: string = '';
  currentChannelSubscription: Subscription | undefined;
  private userDataSubscription: Subscription | undefined;
  private channelSubscription: Subscription | undefined;
  userData!: UserData;
  allChannelNames: string[] = [];
  editChannelNameForm!: FormGroup;
  formbuilder = inject(FormBuilder);

  constructor(public description: ChannelDescriptionComponent) {
    this.userId = this.userService.userId;
  }

  /**
   * Initializes the component by subscribing to the current channel.
   */
  ngOnInit(): void {
    this.subscribeCurrentChannel();
    this.loadUserData(this.userId);
    this.channelForm();
  }

  /**
   * Unsubscribes from the current channel subscription.
   */
  ngOnDestroy(): void {
    if (this.currentChannelSubscription)
      this.currentChannelSubscription?.unsubscribe();
  }

  /**
   * Subscribes to the current channel in the channel service.
   */
  subscribeCurrentChannel() {
    this.currentChannelSubscription =
      this.channelService.currentChannel$.subscribe({
        next: (channel) => {
          this.currentChannel = channel;
          this.newChannelName = channel?.channelName || '';
        },
      });
  }

  /**
   * Load user data for the given user ID.
   * @param {string} userId - The ID of the user.
   */
  loadUserData(userId: string): void {
    this.userDataSubscription = this.userService.userDataMap$.subscribe(
      (userDataMap) => {
        const userData = userDataMap.get(userId);
        if (userData) {
          this.userData = userData;
          this.loadAllChannelsData();
        }
      }
    );
  }

  /**
   * Load all channel data for the current user from the channel service.
   */
  loadAllChannelsData(): void {
    this.channelSubscription = this.channelService.channelDataMap$.subscribe(
      (channels) => {
        const userChannels = new Map<string, Channel>();
        this.userData.channels.forEach((channelId) => {
          const channel = channels.get(channelId);
          if (channel) {
            userChannels.set(channelId, channel);
          }
        });
        this.allChannelNames = Array.from(userChannels.values()).map(
          (channel) => channel.channelName
        );
      }
    );
  }

  /**
   * Creates the channel form.
   */
  channelForm() {
    this.editChannelNameForm = this.formbuilder.group({
      channelName: [
        this.currentChannel?.channelName || '',
        [
          Validators.required,
          Validators.maxLength(25),
          this.nameExistsValidator(this.allChannelNames),
        ],
        ,
      ],
    });
  }

  /**
   * Returns the channel name control.
   */
  get channelNameControl(): FormControl {
    return this.editChannelNameForm.get('channelName') as FormControl;
  }

  /**
   * Custom Validator: proofs if the name already exists
   */
  nameExistsValidator(existingNames: string[]) {
    return (control: FormControl) => {
      if (existingNames.includes(control.value?.trim())) {
        return { nameExists: true };
      }
      return null;
    };
  }

  saveChannelNameOnEnter() {
    if (this.channelNameControl.valid) {
      this.saveChannelName();
      this.description.toggleEditName();
    }
  }

  /**
   * Updates the channel name in Firestore if the new name is different from the current name.
   */
  saveChannelName(): void {
    if (
      this.currentChannel &&
      this.channelNameControl.value !== this.currentChannel.channelName
    ) {
      this.channelService
        .updateChannelName(
          this.currentChannel.channelId,
          this.channelNameControl.value
        )
        .catch((error) => {
          console.error('Fehler beim Aktualisieren des Channel-Namens:', error);
        });
    }
  }
}
