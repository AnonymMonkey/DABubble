import { Component } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [LoginComponent, RouterModule, RouterLink],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {}
