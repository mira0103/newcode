import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CountdownComponent } from 'ngx-countdown';

import { TempStorageKey } from '../@shared/enums/temp-storage-key.enum';
import { AppAccountInfo } from '../@shared/models/app-account-info.model';
import { AuthService } from '../@shared/services/auth/auth.service';
import { TempStorageService } from '../@shared/services/temp-storage/temp-storage.service';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.page.html',
  styleUrls: ['./verification.page.scss'],
})
export class VerificationPage implements OnInit {
  data = { smsCode: '' };
  appInitialAccountInfo: AppAccountInfo;
  disableResend = true;

  @ViewChild('cd') public countdown: CountdownComponent;

  constructor(
    private route: Router,
    private tempStorageService: TempStorageService,
    private authService: AuthService,
  ) {
    this.appInitialAccountInfo = this.tempStorageService.get(TempStorageKey.AppInitialAccountInfo);
  }

  ngOnInit() {

  }

  isInvalid() {
    return this.data.smsCode === '' ||
      this.data.smsCode.length < 6;
  }

  async resend() {
    await this.authService.sendOtpWeb(this.appInitialAccountInfo.phoneNumber);
    this.countdown.restart();
    this.disableResend = true;
  }

  handleCountdownEvent(event) {
    if (event.action === 'done') {
      this.disableResend = false;
    }
  }

  async edit_profile() {
    // tslint:disable-next-line: max-line-length
    const firebaseUserCredential = await this.authService.signupWithPhoneNumberWeb(this.appInitialAccountInfo.email, this.appInitialAccountInfo.password, this.data.smsCode);

    const appInitialAccountInfo: AppAccountInfo = this.tempStorageService.get(TempStorageKey.AppInitialAccountInfo);
    appInitialAccountInfo.uid = firebaseUserCredential.user.uid;
    this.tempStorageService.set(TempStorageKey.AppInitialAccountInfo, appInitialAccountInfo);

    if (firebaseUserCredential) {
      await this.route.navigate(['./edit-profile']);
    }
  }
}
