import { Injectable, inject, signal } from '@angular/core';
import {
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { FIREBASE_AUTH } from '../firebase/firebase.providers';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(FIREBASE_AUTH);
  private readonly googleProvider = new GoogleAuthProvider();

  private readonly currentUserSignal = signal<User | null>(this.auth.currentUser);
  readonly currentUser = this.currentUserSignal.asReadonly();

  private readonly authReady: Promise<User | null>;
  private authInitialized = false;

  constructor() {
    this.authReady = new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        this.currentUserSignal.set(user);
        this.authInitialized = true;
        resolve(user);
        unsubscribe();
      });
    });

    onAuthStateChanged(this.auth, (user) => this.currentUserSignal.set(user));
  }

  waitForAuthInit(): Promise<User | null> {
    if (this.authInitialized) {
      return Promise.resolve(this.currentUserSignal());
    }

    return this.authReady;
  }

  async loginWithGoogle(): Promise<User> {
    const credential = await signInWithPopup(this.auth, this.googleProvider);
    return credential.user;
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }
}
