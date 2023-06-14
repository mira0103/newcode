import { Injectable } from '@angular/core';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import { FirebaseAuthentication } from '@ionic-native/firebase-authentication/ngx';
import { Platform } from '@ionic/angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import * as firebase from 'firebase/app';
import { first, map } from 'rxjs/operators';

import { AuthProviderType } from '../../enums/auth-provider-type.enum';
import { ToastService } from '../toast/toast.service';
import { AppAccountInfo } from '../../models/app-account-info.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  windowRef: any = window;

  constructor(
    private afAuth: AngularFireAuth,
    private afStore: AngularFirestore,
    private platform: Platform,
    private facebook: Facebook,
    private firebaseAuth: FirebaseAuthentication,

    private toastService: ToastService
  ) { }

  async isValidUsername(username: string): Promise<boolean> {
    try {
      const result = await this.afStore.collection('accounts', ref => ref.where('username', '==', username)).get().toPromise();
      if (result.docs[0].data()) {
        return false;
      }

      return true;
    } catch (error) {
      return true;
    }
  }

  async isValidEmail(email: string): Promise<boolean> {
    try {
      const result = await this.afStore.collection('accounts', ref => ref.where('email', '==', email)).get().toPromise();
      if (result.docs[0].data()) {
        return false;
      }

      return true;
    } catch (error) {
      return true;
    }
  }

  async isValidPhoneNumber(phoneNumber: string): Promise<boolean> {
    try {
      const result = await this.afStore.collection('accounts', ref => ref.where('phoneNumber', '==', phoneNumber)).get().toPromise();
      if (result.docs[0].data()) {
        return false;
      }

      return true;
    } catch (error) {
      return true;
    }
  }

  currentUserSync() {
    return this.afAuth.auth.currentUser;
  }

  async currentUser() {
    return this.afAuth.authState.pipe(first()).toPromise();
  }

  getProviderType(input: string): AuthProviderType {
    if (input.includes('@')) {
      return AuthProviderType.Email;
    } else if (input.includes('+')) {
      return AuthProviderType.PhoneNumber;
    }

    return AuthProviderType.Username;
  }

  async getCurrentAccountInfo(): Promise<AppAccountInfo> {
    try {
      const currentUser = await this.currentUser();
      const user = await this.afStore.doc(`accounts/${currentUser.uid}`).get().toPromise();
      return user.data() as AppAccountInfo;
    } catch (error) {
      throw new Error(error);
    }
  }

  getCurrentAccountInfoObservable(): Observable<AppAccountInfo> {
    try {
      const currentUser = this.currentUserSync();
      return this.afStore.doc(`accounts/${currentUser.uid}`).get().pipe(
        map(user => user.data())
      ) as Observable<AppAccountInfo>;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getUserEmail(input: string): Promise<string> {
    try {
      const authProviderType = this.getProviderType(input);
      const user = await this.afStore.collection('accounts', ref => ref.where(authProviderType, '==', input)).get().toPromise();
      return !!user ? user.docs[0].data().email : null;
    } catch (error) {
      throw new Error(error);
    }
  }

  initRecaptcha() {
    this.windowRef.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', { size: 'invisible' });
    this.windowRef.recaptchaVerifier.render();
  }

  async sendOtpCordova(phoneNumber: string) {
    try {
      return await this.firebaseAuth.verifyPhoneNumber(phoneNumber, 30000);
    } catch (error) {
      console.error('AuthService -> verifyPhoneNumber -> error', error);
    }
  }

  async sendOtpWeb(phoneNumber: string): Promise<firebase.auth.ConfirmationResult> {
    try {
      this.windowRef.confirmationResult = await firebase.auth().signInWithPhoneNumber(phoneNumber, this.windowRef.recaptchaVerifier);
      return this.windowRef.confirmationResult;
    } catch (error) {
      console.error('AuthService -> error', error);
      throw new Error(error);
    }
  }

  async signupWithPhoneNumbeCordova(verificationId: string, smsCode: string): Promise<firebase.auth.UserCredential> {
    try {
      return await this.firebaseAuth.signInWithVerificationId(verificationId, smsCode) as firebase.auth.UserCredential;
    } catch (error) {
      console.error('AuthService -> signupWithPhoneNumber -> error', error);
    }
  }

  // tslint:disable-next-line: max-line-length
  async signupWithPhoneNumberWeb(email: string, password: string, smsCode: string): Promise<firebase.auth.UserCredential> {
    try {
      // tslint:disable-next-line: max-line-length
      const firebaseUserCredential = await this.windowRef.confirmationResult.confirm(smsCode) as firebase.auth.UserCredential;
      await firebaseUserCredential.user.updateEmail(email);
      await firebaseUserCredential.user.updatePassword(password);
      return firebaseUserCredential;
    } catch (error) {
      console.error('AuthService -> signupWithPhoneNumberWeb -> error', error);

      if (error.code === 'auth/invalid-verification-code') {
        this.toastService.show('Invalid verification code. Please try again.');
      }
    }
  }

  async signInWithFacebook(): Promise<firebase.auth.UserCredential> {
    try {
      if (this.platform.is('cordova')) {
        const facebookLoginResponse: FacebookLoginResponse = await this.facebook.login([ 'public_profile', 'email' ]);
        await this.facebook.logEvent(this.facebook.EVENTS.EVENT_NAME_ADDED_TO_CART);
        const facebookCredential = firebase.auth.FacebookAuthProvider.credential(facebookLoginResponse.authResponse.accessToken);
        return await firebase.auth().signInWithCredential(facebookCredential);
      }

      return await this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());
    } catch (error) {
      console.error('AuthService -> signInWithFacebook -> error', error);
    }
  }

  async signInWithEmail(email: string, password: string): Promise<firebase.auth.UserCredential> {
    try {
      return await this.afAuth.auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      console.error('AuthService -> signInWithFacebook -> error', error);
    }
  }

  signOut() {
    this.afAuth.auth.signOut();
  }
}
