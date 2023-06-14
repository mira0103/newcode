import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';

import { TempStorageKey } from '../@shared/enums/temp-storage-key.enum';
import { AuthService } from '../@shared/services/auth/auth.service';
import { TempStorageService } from '../@shared/services/temp-storage/temp-storage.service';
import { ToastService } from '../@shared/services/toast/toast.service';
import { LoadingService } from '../@shared/services/loading/loading';
import { LocalStorageService } from '../@shared/services/local-storage/local-storage.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {
  data = {
    email: '',
    phoneNumber: '',
    password: '',
    birthDate: '',
    gender: 'male'
  };
  maxDate = moment().subtract(10, 'year').format('YYYY-MM-DD');

  constructor(
    private route: Router,
    private authService: AuthService,
    private toastService: ToastService,
    private tempStorageService: TempStorageService,
    private localStorageService: LocalStorageService,
  ) { }

  ngOnInit() {
    this.authService.initRecaptcha();
  }

  isInvalid() {
    return this.data.email === '' ||
      (this.data.phoneNumber === '' || !this.data.phoneNumber.startsWith('+')) ||
      (this.data.password === '' || this.data.password.length <= 6);
  }

  async verification() {
    const isValidEmail: boolean = await this.authService.isValidEmail(this.data.email);
    const isValidPhoneNumber: boolean = await this.authService.isValidPhoneNumber(this.data.phoneNumber);
    let errorMessage = '';

    if (isValidEmail && isValidPhoneNumber) {
      const result = await this.authService.sendOtpWeb(this.data.phoneNumber);

      this.tempStorageService.set(TempStorageKey.AppInitialAccountInfo, this.data);
      this.localStorageService.set(TempStorageKey.AppInitialAccountInfo, this.data);

      if (result) {
        this.route.navigate(['./verification']);
      }
    } else if (!isValidEmail && !isValidPhoneNumber) {
      errorMessage = 'Email & phone number already exists. Please try again.';
    } else if (!isValidEmail) {
      errorMessage = 'Email already exists. Please try again.';
    } else if (!isValidPhoneNumber) {
      errorMessage = 'Phone number already exists. Please try again.';
    }

    if (errorMessage.length > 0) {
      this.toastService.show(errorMessage);
    }
  }
}
