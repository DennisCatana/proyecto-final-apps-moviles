import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController, ToastOptions } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  loadingCtrl = inject(LoadingController);
  toastCtrl = inject(ToastController);
  router = inject(Router);

  //===== Barra de cargar =====
  loading() {
    return this.loadingCtrl.create({ spinner: 'crescent' })
  }

  //===== Toas (mostrar errorres) =====
  async presentToast(opts?: ToastOptions) {
    const toast = await this.toastCtrl.create(opts);
    toast.present();
  }

  //===== Enruta a cualquier pagina =====
  routerLink(url: string) {
    return this.router.navigateByUrl(url);
  }

  //===== Guardar en localstorage =====
  saveInLocalStorage(key: string, value: any) {
    return localStorage.setItem(key, JSON.stringify(value))
  }

  //===== obtener de  localstorage =====
  getFromLocalStorage(key: string) {
    return JSON.parse(localStorage.getItem(key))
  }
}

