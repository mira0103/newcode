import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { PipesModule } from '../@shared/modules/pipes/pipes.module';
import { FilterPageRoutingModule } from './filter-routing.module';
import { FilterPage } from './filter.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    FilterPageRoutingModule,

    PipesModule
  ],
  declarations: [FilterPage]
})
export class FilterPageModule {}
