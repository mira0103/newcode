import { Injectable } from '@angular/core';
import { LoadingOptions } from '@ionic/core';
import { LoadingController } from '@ionic/angular';

@Injectable({providedIn: 'root'})
export class LoadingService {
  private loaderConfig: LoadingOptions = { spinner: 'lines', backdropDismiss: false };
  private loading: HTMLIonLoadingElement;

  constructor(public loadingController: LoadingController) {
  }

  // Show loading
  async show(message: string = null) {
    if (!this.loading) {
      this.loaderConfig.message = message;
      this.loading = await this.loadingController.create(this.loaderConfig);
      this.loading.onDidDismiss().then(() => this.loading = null);
      await this.loading.present();
    } else {
      this.loading.message = message;
    }
  }

  // Hide loading
  async hide() {
    if (this.loading) {
      await this.loading.dismiss();
    }
  }
}
