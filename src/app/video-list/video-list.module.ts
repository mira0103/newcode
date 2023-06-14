import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { PipesModule } from '../@shared/modules/pipes/pipes.module';
import { VideoListPageRoutingModule } from './video-list-routing.module';
import { VideoListPage } from './video-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    VideoListPageRoutingModule,

    PipesModule,
  ],
  declarations: [VideoListPage]
})
export class VideoListPageModule {}
