import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VideoviewPage } from './videoview.page';

const routes: Routes = [
  {
    path: '',
    component: VideoviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VideoviewPageRoutingModule {}
