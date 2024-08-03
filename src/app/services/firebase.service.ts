import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { User } from '../models/user.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, setDoc, doc, getDoc, updateDoc, deleteDoc, collection } from 'firebase/firestore';
import { UtilsService } from './utils.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  utilsSvc = inject(UtilsService);

  //================================ Autenticación =======================================

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

  //==================== Gestión de Usuarios =============================

  //===== Obtener todos los usuarios =====
  getUsers(): Observable<any[]> {
    return this.firestore.collection('users').valueChanges().pipe(
      map(users => users.sort((a: any, b: any) => a.name.localeCompare(b.name)))
    );
  }

  deleteUser(uid: string): Promise<void> {
    return this.firestore.collection('users').doc(uid).delete();
  }

  /*toggleUserActivation(uid: string, isActive: boolean): Promise<void> {
    return this.firestore.collection('users').doc(uid).update({ active: isActive });
  }*/
}
