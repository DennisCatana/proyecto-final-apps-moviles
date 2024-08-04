import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor(private firestore: AngularFirestore) { }

  getLocations(): Observable<any[]> {
    return this.firestore.collection('locations').valueChanges();
  }

  getMarkers(): Observable<any[]> {
    return this.firestore.collection('markers').valueChanges();
  }

  updateLocation(uid: string, lat: number, lng: number, name: string): Promise<void> {
    return this.firestore.collection('locations').doc(uid).set({ lat, lng, name, timestamp: new Date() }, { merge: true });
  }

  addMarker(uid: string, lat: number, lng: number, name: string): Promise<void> {
    return this.firestore.collection('markers').doc(uid).set({ lat, lng, name, timestamp: new Date() }, { merge: true });
  }
}
