import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toast: HTMLIonToastElement;

  constructor(private toastCtrl: ToastController) { }

  async show(message: string, buttonText: string = 'OK', durationInSeconds: number = 9) {
    const durationInMs = durationInSeconds * 1000;
    if (!this.toast) {
      this.toast = await this.toastCtrl.create({
        header: message,
        duration: durationInMs,
        buttons: [ buttonText ]
      });
      this.toast.onDidDismiss().then(() => this.toast = null);
      this.toast.present();
    }
  }

  hide() {
    this.toast.dismiss();
  }
}
