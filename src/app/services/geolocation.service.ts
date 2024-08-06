import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  constructor(private firestore: AngularFirestore) {}

  getLocations(): Observable<any[]> {
    return this.firestore.collection('locations').valueChanges();
  }

  getMarkers(): Observable<any[]> {
    return this.firestore.collection('markers').valueChanges();
  }

  updateLocation(uid: string, lat: number, lng: number, name: string) {
    const timestamp = new Date().getTime();
    this.firestore.collection('locations').doc(uid).set({ uid, lat, lng, name, timestamp });
  }

  addMarker(uid: string, lat: number, lng: number, name: string) {
    const timestamp = new Date().getTime();
    this.firestore.collection('markers').doc(uid).set({ uid, lat, lng, name, timestamp });
  }

  updateMarker(uid: string, lat: number, lng: number, name: string) {
    const timestamp = new Date().getTime();
    return this.firestore.collection('markers').doc(uid).update({ lat, lng, name, timestamp });
  }

  deleteMarker(uid: string) {
    return this.firestore.collection('markers').doc(uid).delete();
  }
}
