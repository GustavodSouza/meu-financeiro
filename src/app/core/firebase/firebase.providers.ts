import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getStorage } from 'firebase/storage';
import { environment } from '../../../environments/environment';

export const FIREBASE_APP = new InjectionToken<FirebaseApp>('FIREBASE_APP');
export const FIREBASE_AUTH = new InjectionToken<Auth>('FIREBASE_AUTH');
export const FIREBASE_FIRESTORE = new InjectionToken<Firestore>('FIREBASE_FIRESTORE');
export const FIREBASE_STORAGE = new InjectionToken<FirebaseStorage>('FIREBASE_STORAGE');

export function provideFirebase(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: FIREBASE_APP, useFactory: () => initializeApp(environment.firebaseConfig) },
    { provide: FIREBASE_AUTH, useFactory: (app: FirebaseApp) => getAuth(app), deps: [FIREBASE_APP] },
    { provide: FIREBASE_FIRESTORE, useFactory: (app: FirebaseApp) => getFirestore(app), deps: [FIREBASE_APP] },
    { provide: FIREBASE_STORAGE, useFactory: (app: FirebaseApp) => getStorage(app), deps: [FIREBASE_APP] },
  ]);
}
