import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TerrenosPage } from './terrenos.page';

const routes: Routes = [
  {
    path: '',
    component: TerrenosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TerrenosPageRoutingModule {}
