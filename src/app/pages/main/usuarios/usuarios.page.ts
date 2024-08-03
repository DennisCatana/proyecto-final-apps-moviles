import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
})
export class UsuariosPage implements OnInit {

  users$: Observable<any[]>;
  private firebaseService = inject(FirebaseService);

  ngOnInit() {
    this.users$ = this.firebaseService.getUsers();
  }

  deleteUser(uid: string) {
    this.firebaseService.deleteUser(uid).then(() => {
      console.log(`User ${uid} deleted.`);
    }).catch(err => {
      console.error('Error deleting user:', err);
    });
  }

  /*toggleUserActivation(uid: string, isActive: boolean) {
    const newActiveState = !isActive;
    this.firebaseService.toggleUserActivation(uid, newActiveState).then(() => {
      console.log(`User ${uid} activation toggled to ${newActiveState}.`);
    }).catch(err => {
      console.error('Error toggling user activation:', err);
    });
  }*/

}
