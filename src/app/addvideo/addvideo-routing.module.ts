import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddvideoPage } from './addvideo.page';

const routes: Routes = [
  {
    path: '',
    component: AddvideoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddvideoPageRoutingModule {}
