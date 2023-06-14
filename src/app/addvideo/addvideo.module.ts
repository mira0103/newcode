import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { AddvideoPageRoutingModule } from './addvideo-routing.module';
import { AddvideoPage } from './addvideo.page';
import { PipesModule } from '../@shared/modules/pipes/pipes.module';
import { WebView } from '@ionic-native/ionic-webview/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    AddvideoPageRoutingModule,

    PipesModule
  ],
  declarations: [AddvideoPage],
  providers: [
    WebView
  ]
})
export class AddvideoPageModule {}
