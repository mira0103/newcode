import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { VideoviewPageRoutingModule } from './videoview-routing.module';
import { VideoviewPage } from './videoview.page';
import { PipesModule } from '../@shared/modules/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    VideoviewPageRoutingModule,
    PipesModule,
  ],
  declarations: [VideoviewPage]
})
export class VideoviewPageModule {}
