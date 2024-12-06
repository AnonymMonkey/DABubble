import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideStorage, getStorage } from '@angular/fire/storage';

const firebaseConfig = {
  appId: '1:3477337492:web:124ba0fba4eefab531cb81',
  apiKey: 'AIzaSyAmkmxi3an8ufJ8XGqoYShp_UwXxApIwEg',
  projectId: 'dabubble-7fcb8',
  authDomain: 'dabubble-7fcb8.firebaseapp.com',
  databaseURL:
    'https://dabubble-7fcb8-default-rtdb.europe-west1.firebasedatabase.app',
  storageBucket: 'dabubble-7fcb8.appspot.com',
  messagingSenderId: '3477337492',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)), 
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase()),
    provideStorage(() => getStorage()), 
  ],
};
