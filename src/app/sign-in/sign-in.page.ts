import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../@shared/services/auth/auth.service';
import { FirebaseInitialAccountInfo } from '../@shared/models/firebase-initial-account-info.model';
import { TempStorageService } from '../@shared/services/temp-storage/temp-storage.service';
import { TempStorageKey } from '../@shared/enums/temp-storage-key.enum';
import { AppAccountInfo } from '../@shared/models/app-account-info.model';
import { ToastService } from '../@shared/services/toast/toast.service';
import { LoadingService } from '../@shared/services/loading/loading';
import { ProfileSaveType } from '../@shared/enums/profile-save-type.enum';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})
export class SignInPage implements OnInit {
  data = {
    username: '',
    password: ''
  };

  constructor(
    private navCtrl: NavController,
    private route: Router,
    private authService: AuthService,
    private tempStorageService: TempStorageService,
    private toastService: ToastService,
    private loadingService: LoadingService,
  ) { }

  ngOnInit() {
  }

  async login() {
    await this.loadingService.show('Logging in...');
    try {
      const userEmail = await this.authService.getUserEmail(this.data.username);
      if (userEmail) {
        const email = await this.authService.signInWithEmail(userEmail, this.data.password);
        if (email) {
          this.navCtrl.navigateRoot(['./tabs']);
        }
      }
    } catch (error) {
      this.toastService.show('Invalid email or password. Please try again.');
    } finally {
      await this.loadingService.hide();
    }
  }

  async continue_with_facebook() {
    const firebaseUserCredential: firebase.auth.UserCredential = await this.authService.signInWithFacebook();
    console.log('SignInPage -> continue_with_facebook -> firebaseUserCredential', firebaseUserCredential);

    const appInitialAccountInfo: AppAccountInfo = {
      uid: firebaseUserCredential.user.uid,
      name: firebaseUserCredential.user.displayName,
      email: firebaseUserCredential.user.email,
      photo: firebaseUserCredential.additionalUserInfo.profile['picture'].data.url
    };
    this.tempStorageService.set(TempStorageKey.AppInitialAccountInfo, appInitialAccountInfo);
    this.tempStorageService.set(TempStorageKey.ProfileSaveType, ProfileSaveType.Save);

    if (firebaseUserCredential.additionalUserInfo.isNewUser) {
      this.route.navigate(['./edit-profile']);
    } else {
      this.navCtrl.navigateRoot(['./tabs']);
    }
  }

  sign_up() {
    this.tempStorageService.set(TempStorageKey.ProfileSaveType, ProfileSaveType.Save);
    this.route.navigate(['./sign-up']);
  }
}
