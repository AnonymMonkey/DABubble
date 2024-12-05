import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RoutingService } from '../../services/routing-service/routing.service';

@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [MatCardModule, MatIconModule, CommonModule],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss',
})
export class ImprintComponent {
  constructor(private routingService: RoutingService) {}

  /**
   * navigates to the login page
   */
  navigateToLogin() {
    this.routingService.navigateToLogin();
  }
}
