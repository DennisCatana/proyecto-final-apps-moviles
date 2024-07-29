import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { User } from '../models/user.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, setDoc, doc, getDoc } from '@angular/fire/firestore';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  utilsSvc = inject(UtilsService);

  //================================ Autenticación =====

  //===== Acceder =====

  signIn(user: User) {
    return signInWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  //===== Crear Usuario =====

  signUp(user: User) {
    return createUserWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  //===== Actualizar usuario ===== 
  updateUser(displayName: string) {
    return updateProfile(getAuth().currentUser, { displayName });
  }

  //===== Recuperar password =====
  sendRecoveryEmail(email: string) {
    return sendPasswordResetEmail(getAuth(), email);
  }

  //===== Cerrar sesion =====
  signOut() {
    getAuth().signOut();
    localStorage.removeItem('user');
    this.utilsSvc.routerLink('/auth');
  }

  //==================== Base de datos =============================

  //===== setear un documento===== 
  setDocument(path: string, data: any) {
    return setDoc(doc(getFirestore(), path), data);
  }

  //===== obtener un documento ===== 
  async getDocument(path: string) {
    return (await getDoc(doc(getFirestore(), path))).data();
  }
}
