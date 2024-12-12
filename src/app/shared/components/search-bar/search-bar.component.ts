import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UserService } from '../../services/user-service/user.service';
import { ChannelService } from '../../services/channel-service/channel.service';
import { Channel } from '../../models/channel.model';
import { UserData } from '../../models/user.model';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ActiveChatButtonService } from '../../services/profile-chat-button-service/active-chat-button.service';
import { PrivateChatService } from '../../services/private-chat-service/private-chat.service';
import { BehaviorService } from '../../services/behavior-service/behavior.service';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatFormFieldModule,
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent {
  @Input() placeholder: string = 'Devspace durchsuchen';
  @Input() searchIconExists: boolean = true;
  @Input() inputFont: boolean = false;
  userService = inject(UserService);
  channelService = inject(ChannelService);
  activeButtonService = inject(ActiveChatButtonService);
  privateChatService = inject(PrivateChatService);
  userData!: UserData;
  allUserData: UserData[] = [];
  allChannelsData: Channel[] = [];
  inputControl = new FormControl('');
  filteredOptions!: Observable<(Channel | UserData)[]>;
  router = inject(Router);
  subscriptions: Subscription[] = [];
  behaviorService = inject(BehaviorService);
  breakpointObserver = inject(BreakpointObserver);
  breakpointSubscription!: Subscription;
  mobileVersion: boolean = false;

  private allUserDataSubscription: Subscription | undefined;
  private userDataSubscription: Subscription | undefined;
  private privateChatSubscription: Subscription | undefined;

  /**
   * Initializes the component and loads user data and channel data.
   */
  ngOnInit(): void {
    this.breakpointSubscription = this.breakpointObserver
      .observe(['(max-width: 992px)'])
      .subscribe((result) => {
        this.mobileVersion = result.matches ? true : false;
      });
    this.loadAllUserData();
    this.loadCurrentUserData();
  }

  /**
   * Clean up subscriptions on component destroy.
   */
  ngOnDestroy(): void {
    this.allUserDataSubscription?.unsubscribe();
    this.userDataSubscription?.unsubscribe();
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
    this.privateChatSubscription?.unsubscribe();
    this.breakpointSubscription.unsubscribe();
  }

  /**
   * Loads all user data from the user service.
   */
  loadAllUserData(): void {
    this.allUserDataSubscription = this.userService.allUserData$.subscribe(
      (data) => {
        this.allUserData = data;
      }
    );
  }

  /**
   * Loads the current user data from the user service.
   */
  loadCurrentUserData(): void {
    this.userDataSubscription = this.userService.userData$.subscribe((data) => {
      this.userData = data;
      if (this.userData) {
        this.loadAllChannelsData();
        this.filteredOptions = this.inputControl.valueChanges.pipe(
          startWith(''),
          map((value) => this.filterOptions(value || ''))
        );
      }
    });
  }

  /**
   * Loads all channel data for the current user from the channel service.
   */
  loadAllChannelsData(): void {
    this.allChannelsData = [];
    this.userData.channels.forEach((channelId) => {
      const subscription = this.channelService
        .getChannelById(channelId)
        .subscribe((channelData) => {
          if (!channelData) return;
          const existingIndex = this.allChannelsData.findIndex(
            (c) => c.channelId === channelData.channelId
          );
          if (existingIndex > -1) {
            this.allChannelsData[existingIndex] = channelData;
          } else {
            this.allChannelsData.push(channelData);
          }
        });
      this.subscriptions.push(subscription);
    });
  }

  /**
   * Filters the options based on the input value.
   * @param input - The input value.
   * @returns An array of filtered options.
   */
  private filterOptions(input: string): (Channel | UserData)[] {
    if (input.startsWith('#')) {
      return this.filterChannels(input);
    } else if (input.startsWith('@')) {
      return this.filterUsers(input);
    } else {
      const combinedOptions = [...this.allChannelsData, ...this.allUserData];
      return this.filterCombinedOptions(combinedOptions, input);
    }
  }

  /**
   * Filters channels based on the input value.
   * @param input - The input value.
   * @returns An array of filtered channels.
   */
  filterChannels(input: string): Channel[] {
    return this.allChannelsData.filter((channel) =>
      channel.channelName
        .toLowerCase()
        .includes(input.substring(1).toLowerCase())
    );
  }

  /**
   * Filters users based on the input value.
   * @param input - The input value.
   * @returns An array of filtered users.
   */
  filterUsers(input: string): UserData[] {
    return this.allUserData.filter((user) =>
      user.displayName.toLowerCase().includes(input.substring(1).toLowerCase())
    );
  }

  /**
   * Filters combined options based on the input value.
   * @param combinedOptions - The combined options to filter.
   * @param input - The input value.
   * @returns An array of filtered combined options.
   */
  filterCombinedOptions(
    combinedOptions: (Channel | UserData)[],
    input: string
  ): (Channel | UserData)[] {
    return combinedOptions.filter((option) => {
      if ('channelName' in option) {
        return option.channelName.toLowerCase().includes(input.toLowerCase());
      } else if ('displayName' in option || 'email' in option) {
        return (
          option.displayName.toLowerCase().includes(input.toLowerCase()) ||
          option.email.toLowerCase().includes(input.toLowerCase())
        );
      }
      return false;
    });
  }

  /**
   * Returns the name of the option.
   * @param option - The option to get the name for.
   * @returns The name of the option.
   */
  getOptionName(option: Channel | UserData): string {
    if ('channelName' in option) {
      return `#${option.channelName}`;
    } else {
      return `@${option.displayName}`;
    }
  }

  /**
   * Returns the ID of the option.
   * @param option - The option to get the ID for.
   * @returns The ID of the option.
   */
  getOptionId(option: Channel | UserData): string {
    if ('channelName' in option) {
      return `${option.channelId}`;
    } else {
      return `${option.uid}`;
    }
  }

  /**
   * Handles the selection of an option.
   * @param option - The selected option.
   */
  onOptionSelected(option: any): void {
    this.closeSideNavOnMobile();
    if (option && typeof option === 'object') {
      if (option.value.startsWith('#')) {
        this.navigateToChannel(option);
      } else if (option.value.startsWith('@')) {
        this.navigateToPrivateChat(option);
      }
    } else {
      console.error('Ungültige Option:', option);
    }
  }

  /**
   * Navigates to the specified channel.
   * @param option - The selected option.
   */
  navigateToChannel(option: any) {
    this.router
      .navigate([`/main/${this.userData.uid}/channel/${option.id}`])
      .then(() => {
        this.inputControl.setValue('');
        this.activeButtonService.setActiveButton('');
      });
  }

  /**
   * Navigates to a private chat with the specified user.
   * @param option - The selected option.
   */
  navigateToPrivateChat(option: any) {
    let targetUser: UserData | undefined = this.allUserData.find(
      (user) => user.uid === option.id
    );
    this.openChatWithUser(targetUser!, `${this.userData.uid}_${option.id}`);
    this.inputControl.setValue('');
  }

  /**
   * Closes the side navigation on mobile devices by setting the behavior service value to false.
   * This method is triggered only if the application is in mobile version.
   */
  closeSideNavOnMobile() {
    if (this.mobileVersion) {
      this.behaviorService.setValue(false);
    }
  }

  /**
   * Opens a private chat with the specified user.
   * @param targetUser - The user to open the chat with.
   * @param buttonID - The ID of the button to set as active.
   */
  openChatWithUser(targetUser: UserData, buttonID: string) {
    this.privateChatSubscription = this.privateChatService
      .openOrCreatePrivateChat(this.userData, targetUser)
      .subscribe((chatId) => {
        if (chatId) {
          this.activeButtonService.setActiveButton(buttonID);
          this.router.navigate([
            `/main/${this.userData.uid}/privateChat`,
            chatId,
          ]);
        } else {
          console.error(
            'Fehler beim Öffnen oder Erstellen des privaten Chats.'
          );
        }
      });
  }
}
