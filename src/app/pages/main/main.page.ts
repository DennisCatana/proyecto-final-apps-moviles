import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {

  pages = [
    {title: 'Ubicacion', url: '/main/ubicacion', icon: 'location-outline'},
    {title: 'Terrenos', url: '/main/terrenos', icon: 'globe-outline'},
    {title: 'Perfil', url: '/main/profile', icon: 'person-outline'},
    {title: 'Usuarios', url: '/main/usuarios', icon: 'people-outline'}
  ]

  router = inject(Router);
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  currentPath: string = '';

  ngOnInit() {
    this.router.events.subscribe((event: any) => {
      if (event?.url) this.currentPath = event.url;
    })
  }

  user(): User{
    return this.utilsSvc.getFromLocalStorage('user');
  }

  //===== Cerrar Sesión =====
  signOut() {
    this.firebaseSvc.signOut();

  }

}
