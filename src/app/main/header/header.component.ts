import { Component, inject, Input, ViewEncapsulation } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { ProfileDialogComponent } from './profile-dialog/profile-dialog.component';
import { UserData } from '../../shared/models/user.model';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BehaviorService } from '../../shared/services/behavior-service/behavior.service';
import { Subscription } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import {
  MatBottomSheet,
  MatBottomSheetModule,
} from '@angular/material/bottom-sheet';
import { BottomSheetComponent } from './bottom-sheet/bottom-sheet/bottom-sheet.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    CommonModule,
    SearchBarComponent,
    MatTooltipModule,
    MatBottomSheetModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent {
  @Input() userData!: UserData;
  sideNavOpened = true;
  behaviorService = inject(BehaviorService);
  subscriptionSideNav!: Subscription;
  breakpointObserver = inject(BreakpointObserver);
  breakpointSubscription!: Subscription;
  mobileVersion: boolean = false;
  _bottomSheet = inject(MatBottomSheet);
  constructor(public dialog: MatDialog) {}

  /**
   * Initialize the component and subscribe to breakpoint changes.
   */
  ngOnInit(): void {
    this.breakpointSubscription = this.subscribeBreakpoint();
    this.subscriptionSideNav = this.subscribeSideNavBehavior();
  }

  /**
   *
   * @returns A subscription to the breakpoint changes.
   */
  subscribeBreakpoint(): Subscription {
    return this.breakpointObserver
      .observe(['(max-width: 600px)'])
      .subscribe((result) => {
        this.mobileVersion = result.matches ? true : false;
      });
  }

  /**
   *
   * @returns A subscription to the sideNavOpened$ observable.
   */
  subscribeSideNavBehavior(): Subscription {
    return this.behaviorService.sideNavOpened$.subscribe((value) => {
      this.sideNavOpened = value;
    });
  }

  /**
   * Clean up subscriptions on component destroy.
   */
  ngOnDestroy(): void {
    this.subscriptionSideNav.unsubscribe();
    this.breakpointSubscription.unsubscribe();
  }

  /**
   * Open the profile dialog or bottom sheet based on the screen size.
   */
  toggleDropdown(): void {
    if (this.mobileVersion) {
      this._bottomSheet.open(BottomSheetComponent);
    } else {
      this.dialog.open(ProfileDialogComponent);
    }
  }

  /**
   * Go back to the side navigation.
   */
  returnToSideNav(): void {
    this.behaviorService.setValue(true);
  }
}
