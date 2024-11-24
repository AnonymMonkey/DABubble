import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { RegisterComponent } from './landing-page/register/register.component';
import { ImprintComponent } from './shared/components/imprint/imprint.component';
import { PrivacyPolicyComponent } from './shared/components/privacy-policy/privacy-policy.component';
import { LoginComponent } from './landing-page/login/login.component';
import { SelectAvatarComponent } from './landing-page/register/select-avatar/select-avatar.component';
import { ResetPasswordComponent } from './landing-page/login/reset-password/reset-password.component';
import { NewPasswordComponent } from './landing-page/login/reset-password/new-password/new-password.component';
import { MainMessageAreaComponent } from './main/main-message-area/main-message-area.component';
import { PrivateChatComponent } from './main/private-chat/private-chat.component';
import { NewMessagePlaceholderComponent } from './main/new-message-placeholder/new-message-placeholder.component';
import { ThreadComponent } from './main/main-message-area/thread/thread.component';

export const routes: Routes = [
  { path: '', component: LoginComponent }, // Standardmäßig Login anzeigen
  { path: 'reset-password', component: ResetPasswordComponent }, // Route für Passwort zurücksetzen
  { path: 'new-password', component: NewPasswordComponent }, // Route für neues Passwort
  { path: 'register', component: RegisterComponent }, // Route für Registrierung
  { path: 'select-avatar', component: SelectAvatarComponent }, // Route für Avatar-Auswahl

  // Hauptkomponente nach Login (Main-Bereich der App)
  {
    path: 'main/:uid',
    component: MainComponent,
    children: [
      { path: 'channel/:channelId', component: MainMessageAreaComponent, children: [
        // Hier wird der Thread als untergeordnete Route vom Channel behandelt
        {
          path: 'thread/:messageId',
          component: ThreadComponent,  // Die Komponente, die den Thread anzeigt
        },
      ]},
      { path: 'privateChat/:privateChatId', component: PrivateChatComponent },
      { path: '', component: NewMessagePlaceholderComponent },
    ],
  },
  

  // Impressum und Datenschutz als eigene Routen
  { path: 'imprint', component: ImprintComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
];
