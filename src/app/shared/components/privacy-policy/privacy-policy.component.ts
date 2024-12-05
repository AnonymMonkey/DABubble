import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RoutingService } from '../../services/routing-service/routing.service';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [MatCardModule, MatIconModule, CommonModule],
  templateUrl: './privacy-policy.component.html',
  styleUrls: [
    './privacy-policy.component.scss',
    './privacy-policy.component_media.scss',
  ],
})
export class PrivacyPolicyComponent {
  constructor(private routingService: RoutingService) {}

  navigateToLogin() {
    this.routingService.navigateToLogin();
  }
}
