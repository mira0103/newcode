import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../@shared/modules/shared/shared.module';
import { VerificationPageRoutingModule } from './verification-routing.module';
import { VerificationPage } from './verification.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    VerificationPageRoutingModule,

    SharedModule,
  ],
  declarations: [VerificationPage]
})
export class VerificationPageModule {}
