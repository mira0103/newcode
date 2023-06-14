import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { MomentModule } from 'ngx-moment';

import { CommentPageRoutingModule } from './comment-routing.module';
import { CommentPage } from './comment.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    CommentPageRoutingModule,

    MomentModule,
  ],
  declarations: [CommentPage]
})
export class CommentPageModule {}
