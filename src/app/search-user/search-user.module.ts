import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { SearchUserPageRoutingModule } from './search-user-routing.module';
import { SearchUserPage } from './search-user.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,

    SearchUserPageRoutingModule
  ],
  declarations: [SearchUserPage]
})
export class SearchUserPageModule {}
