import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TerrenosPageRoutingModule } from './terrenos-routing.module';

import { TerrenosPage } from './terrenos.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TerrenosPageRoutingModule,
    SharedModule
  ],
  declarations: [TerrenosPage]
})
export class TerrenosPageModule {}
