import { Component, OnInit } from '@angular/core';
import { Camera } from '@ionic-native/camera/ngx';
import { AlertController, NavController } from '@ionic/angular';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import * as firebase from 'firebase/app';
import * as moment from 'moment';

import { TempStorageKey } from '../@shared/enums/temp-storage-key.enum';
import { AppAccountInfo } from '../@shared/models/app-account-info.model';
import { AuthService } from '../@shared/services/auth/auth.service';
import { TempStorageService } from '../@shared/services/temp-storage/temp-storage.service';
import { UploadService } from '../@shared/services/upload/upload.service';
import { LoadingService } from './../@shared/services/loading/loading';
import { ProfileSaveType } from '../@shared/enums/profile-save-type.enum';
import { ToastService } from '../@shared/services/toast/toast.service';
import { LocalStorageService } from '../@shared/services/local-storage/local-storage.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {
  data: AppAccountInfo = new AppAccountInfo();

  accountInfoDocument: AngularFirestoreDocument<AppAccountInfo>;
  accountInfoSnapshot: firebase.firestore.DocumentSnapshot;
  firebaseUserInfo: firebase.User;

  profileSaveType: ProfileSaveType;
  isLoading = true;

  maxDate = moment().subtract(10, 'year').format('YYYY-MM-DD');

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private afStore: AngularFirestore,
    private authService: AuthService,
    private camera: Camera,
    private tempStorageService: TempStorageService,
    private uploadService: UploadService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private localStorageService: LocalStorageService,
  ) {
    this.profileSaveType = this.tempStorageService.get(TempStorageKey.ProfileSaveType);

    if (this.profileSaveType === ProfileSaveType.Save) {
      this.initializeData();
    }
  }

  ngOnInit() {
    (async () => {
      const appInitialAccountInfo: AppAccountInfo = this.localStorageService.get(TempStorageKey.AppInitialAccountInfo);

      if (appInitialAccountInfo) {
        this.initializeData();
        this.profileSaveType = ProfileSaveType.Save;
      }

      this.firebaseUserInfo = await this.authService.currentUser();

      this.accountInfoDocument = this.afStore.collection('accounts').doc(this.firebaseUserInfo.uid);
      this.accountInfoSnapshot = await this.accountInfoDocument.get().toPromise();

      if (this.accountInfoSnapshot.exists) {
        this.data = this.accountInfoSnapshot.data() as AppAccountInfo;
      } else {
        this.data = { ...this.data, ...appInitialAccountInfo };
      }

      this.isLoading = false;
    })();
  }

  initializeData() {
    this.data = {
      name: '',
      username: '',
      bio: '',
      email: '',
      phoneNumber: '',
      birthDate: '',
      gender: 'male',
      instagramId: '',
      twitterId: '',
      facebookId: '',
      photo: null,
      followers: {},
    };
  }

  isInvalid() {
    if (!this.data) {
      return true;
    }

    return !this.data.name ||
      !this.data.username ||
      (this.data.username && this.data.username.length <= 5) ||
      !this.data.email ||
      (!this.data.phoneNumber || !this.data.phoneNumber.startsWith('+')) ||
      !this.data.birthDate ||
      !this.data.gender;
  }

  async choosePhoto() {
    // Ask if the user wants to take a photo or choose from photo gallery.
    const alert = await this.alertCtrl.create({
      cssClass: 'full-width-buttons',
      header: 'Set Profile Photo',
      message: 'Do you want to take a photo or choose from your photo gallery?',
      buttons: [
        {
          text: 'Choose from Gallery',
          handler: () => {

            this.camera.getPicture({
              quality: 50,
              targetWidth: 384,
              targetHeight: 384,
              destinationType: this.camera.DestinationType.DATA_URL,
              encodingType: this.camera.EncodingType.JPEG,
              correctOrientation: true,
              sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
            }).then((imageData) => {
              this.data.photo = 'data:image/jpeg;base64,' + imageData;
            });
          }
        },
        {
          text: 'Take Photo',
          handler: () => {
            this.camera.getPicture({
              quality: 50,
              targetWidth: 384,
              targetHeight: 384,
              destinationType: this.camera.DestinationType.DATA_URL,
              encodingType: this.camera.EncodingType.JPEG,
              correctOrientation: true,
              sourceType: this.camera.PictureSourceType.CAMERA
            }).then((imageData) => {
              this.data.photo = 'data:image/jpeg;base64,' + imageData;
            });
          }
        },
        {
          text: 'Cancel',
          handler: data => { },
          cssClass: 'alert-button--cancel'
        },
      ]
    });
    alert.present();
  }

  // private async saveToFirebase() {
  //   if (this.data.password) {
  //     delete this.data.password;
  //   }

  //   const currentUserInfo = await this.authService.currentUser();
  //   this.data.uid = this.firebaseUserInfo.uid;

  //   if (this.data.photo && !this.data.photo.includes('http')) {
  //     const base64Photo = this.data.photo.replace(/^(data\:image\/jpeg\;base64\,)/gi, '');
  //     this.data.photo = await this.uploadService.uploadImage(currentUserInfo.uid, base64Photo);
  //   }

  //   if (!this.accountInfoSnapshot.exists) {
  //     this.data.following = {};
  //     this.data.followers = {};
  //     await this.accountInfoDocument.set(this.data);
  //   } else {
  //     await this.accountInfoDocument.update(this.data);
  //   }

  //   this.tempStorageService.remove(TempStorageKey.AppInitialAccountInfo);
  //   this.localStorageService.remove(TempStorageKey.AppInitialAccountInfo);

  //   this.loadingService.hide();

  //   if (this.profileSaveType === ProfileSaveType.Save) {
  //     this.navCtrl.navigateRoot('/tabs');
  //   }
  // }

  private async saveToFirebase() {
    if (this.data.password) {
      delete this.data.password;
    }
  
    const currentUserInfo = await this.authService.currentUser();
    this.data.uid = this.firebaseUserInfo.uid;
  
    if (this.data.photo && !this.data.photo.includes('http')) {
      const base64Photo = this.data.photo.replace(/^(data\:image\/jpeg\;base64\,)/gi, '');
      this.data.photo = await this.uploadService.uploadImage(currentUserInfo.uid, base64Photo);
    }
  
    if (this.accountInfoSnapshot && this.accountInfoSnapshot.exists) {
      await this.accountInfoDocument.update(this.data);
    } else {
      this.data.following = {};
      this.data.followers = {};
      await this.accountInfoDocument.set(this.data);
    }
  
    this.tempStorageService.remove(TempStorageKey.AppInitialAccountInfo);
    this.localStorageService.remove(TempStorageKey.AppInitialAccountInfo);
  
    this.loadingService.hide();
  
    if (this.profileSaveType === ProfileSaveType.Save) {
      this.navCtrl.navigateRoot('/tabs');
    }
  }

  async save() {
    try {
      await this.loadingService.show('Saving profile...');

      if (this.profileSaveType === ProfileSaveType.Save) {
        const isValidEmail: boolean = await this.authService.isValidEmail(this.data.email);
        const isValidPhoneNumber: boolean = await this.authService.isValidPhoneNumber(this.data.phoneNumber);
        const isValidUsername: boolean = await this.authService.isValidUsername(this.data.username);
        let errorMessage = '';

        if (!isValidEmail && !isValidPhoneNumber && !isValidUsername) {
          errorMessage = 'Email, phone number & username already exists. Please try again.';
        } else if (!isValidEmail) {
          errorMessage = 'Email already exists. Please try again.';
        } else if (!isValidPhoneNumber) {
          errorMessage = 'Phone number already exists. Please try again.';
        } else if (!isValidUsername) {
          errorMessage = 'Username already exists. Please try again.';
        } else if (isValidEmail && isValidPhoneNumber && isValidUsername) {
          this.saveToFirebase();
        }

        if (errorMessage.length > 0) {
          this.loadingService.hide();
          this.toastService.show(errorMessage);
        }
      } else if (this.profileSaveType === ProfileSaveType.Update) {
        await this.saveToFirebase();
        this.toastService.show('Profile updated successfully.');
      }
    } catch (error) {
      console.error('EditProfilePage -> save -> error', error);
    }
  }
}
