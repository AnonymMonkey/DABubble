import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { RegisterComponent } from './landing-page/register/register.component';
import { ImprintComponent } from './shared/imprint/imprint.component';
import { PrivacyPolicyComponent } from './shared/privacy-policy/privacy-policy.component';
import { LoginComponent } from './landing-page/login/login.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
  // Hier wird die Login-Seite geladen, die Child-Routes wie Login und Register enthält

  { path: '', component: LoginComponent }, // Standardmäßig Login anzeigen
  { path: 'register', component: RegisterComponent }, // Route für Registrierung

  // Hauptkomponente nach Login (Main-Bereich der App)
  { path: 'main', component: MainComponent },

  // Impressum und Datenschutz als eigene Routen
  { path: 'impressum', component: ImprintComponent },
  { path: 'datenschutz', component: PrivacyPolicyComponent },
];
