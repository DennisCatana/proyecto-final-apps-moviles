import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainPage } from './main.page';

const routes: Routes = [
  {
    path: '',
    component: MainPage,
    children: [
      {
        path: 'usuarios',
        loadChildren: () => import('./usuarios/usuarios.module').then( m => m.UsuariosPageModule)
      },
      {
        path: 'ubicacion',
        loadChildren: () => import('./ubicacion/ubicacion.module').then( m => m.UbicacionPageModule)
      },
      {
        path: 'terrenos',
        loadChildren: () => import('./terrenos/terrenos.module').then( m => m.TerrenosPageModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.module').then(m => m.ProfilePageModule)
      }
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainPageRoutingModule { }
