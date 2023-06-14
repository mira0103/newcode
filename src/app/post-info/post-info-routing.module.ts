import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PostInfoPage } from './post-info.page';

const routes: Routes = [
  {
    path: '',
    component: PostInfoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PostInfoPageRoutingModule {}
