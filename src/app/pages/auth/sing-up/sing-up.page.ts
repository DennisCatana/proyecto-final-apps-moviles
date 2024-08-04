// sing-up.page.ts
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-sing-up',
  templateUrl: './sing-up.page.html',
  styleUrls: ['./sing-up.page.scss'],
})
export class SingUpPage implements OnInit {

  form = new FormGroup({
    uid: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required, Validators.minLength(7)]),
    rol: new FormControl('', [Validators.required]),
  });

  firebaseSvc = inject(FirebaseService);
  utilSvc = inject(UtilsService);

  ngOnInit() { }

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilSvc.loading();
      await loading.present();

      try {
        // Solo crea la cuenta del usuario
        const res = await this.firebaseSvc.signUp(this.form.value as User);

        // Guarda los datos del usuario en la base de datos
        const uid = res.user.uid;
        this.form.controls.uid.setValue(uid);
        await this.setUserInfo(uid);

        // Navega a la página de usuarios
        this.utilSvc.routerLink('/main/usuarios');

      } catch (error) {
        console.log(error);
        this.utilSvc.presentToast({
          message: 'Error al registrar el usuario. Inténtalo de nuevo.',
          duration: 2500,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      } finally {
        loading.dismiss();
      }
    }
  }

  async setUserInfo(uid: string) {
    if (this.form.valid) {
      try {
        // Quita la contraseña de los datos a guardar
        const userData = { ...this.form.value };
        delete userData.password;

        // Guarda los datos del usuario en la base de datos
        await this.firebaseSvc.setDocument(`users/${uid}`, userData);

      } catch (error) {
        console.log(error);
        this.utilSvc.presentToast({
          message: 'Error al guardar la información del usuario.',
          duration: 2500,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      }
    }
  }
}
