import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Geolocation, GeolocationPosition } from '@capacitor/geolocation';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ubicacion',
  templateUrl: './ubicacion.page.html',
  styleUrls: ['./ubicacion.page.scss'],
})
export class UbicacionPage implements OnInit, AfterViewInit, OnDestroy {
  map: google.maps.Map;
  userMarker: google.maps.Marker | null = null;
  locationMarkers: { [key: string]: google.maps.Marker } = {};
  markerMarkers: { [key: string]: google.maps.Marker } = {};
  locationSubscription: Subscription;
  markerSubscription: Subscription;
  watchId: any;

  constructor(
    private geolocationService: GeolocationService,
    private auth: AngularFireAuth
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.loadMap();
    this.trackLocations();
    this.trackMarkers();
    this.startAutoUpdateLocation();
  }

  ngOnDestroy() {
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
    }
    if (this.markerSubscription) {
      this.markerSubscription.unsubscribe();
    }
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
    }
  }

  async loadMap() {
    const mapOptions: google.maps.MapOptions = {
      center: new google.maps.LatLng(0, 0),
      zoom: 8,
    };

    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, mapOptions);
  }

  trackLocations() {
    this.locationSubscription = this.geolocationService.getLocations().subscribe(async locations => {
      const currentUser = await this.auth.currentUser;
      const currentUserId = currentUser?.uid;

      locations.forEach(location => {
        const infoContent = `${location.name} (Ubicación en tiempo real)`;

        if (this.locationMarkers[location.uid]) {
          this.locationMarkers[location.uid].setPosition(new google.maps.LatLng(location.lat, location.lng));
        } else {
          const marker = new google.maps.Marker({
            position: new google.maps.LatLng(location.lat, location.lng),
            map: this.map,
            icon: {
              url: location.uid === currentUserId ? './assets/icon/mi.png' : './assets/icon/usuario.png',
              scaledSize: new google.maps.Size(30, 30)
            }
          });

          this.addInfoWindow(marker, infoContent);

          this.locationMarkers[location.uid] = marker;
        }
      });

      const bounds = new google.maps.LatLngBounds();
      Object.values(this.locationMarkers).forEach(marker => bounds.extend(marker.getPosition() as google.maps.LatLng));
      this.map.fitBounds(bounds);
    });
  }

  trackMarkers() {
    this.markerSubscription = this.geolocationService.getMarkers().subscribe(markers => {
      markers.forEach(markerData => {
        const infoContent = `${markerData.name} (Marcador)`;

        if (this.markerMarkers[markerData.uid]) {
          this.markerMarkers[markerData.uid].setPosition(new google.maps.LatLng(markerData.lat, markerData.lng));
        } else {
          const marker = new google.maps.Marker({
            position: new google.maps.LatLng(markerData.lat, markerData.lng),
            map: this.map,
            icon: {
              url: './assets/icon/marcador.png',
              scaledSize: new google.maps.Size(30, 30)
            }
          });

          this.addInfoWindow(marker, infoContent);

          this.markerMarkers[markerData.uid] = marker;
        }
      });
    });
  }

  startAutoUpdateLocation() {
    this.auth.currentUser.then(user => {
      if (user) {
        this.watchId = Geolocation.watchPosition({ enableHighAccuracy: true }, (position, err) => {
          if (err) {
            console.error('Error watching position', err);
            return;
          }
          this.updateLocation(position);
        });

        setInterval(() => {
          this.auth.currentUser.then(currentUser => {
            if (currentUser && this.userMarker) {
              this.geolocationService.updateLocation(currentUser.uid, this.userMarker.getPosition().lat(), this.userMarker.getPosition().lng(), currentUser.displayName);
            }
          });
        }, 10000); // Update every 10 seconds
      }
    });
  }

  async updateLocation(position: GeolocationPosition) {
    const user = await this.auth.currentUser;
    if (user) {
      const { latitude, longitude, accuracy } = position.coords;
      if (accuracy < 50) {
        this.geolocationService.updateLocation(user.uid, latitude, longitude, user.displayName);

        if (this.userMarker) {
          this.userMarker.setPosition(new google.maps.LatLng(latitude, longitude));
          this.userMarker.setVisible(true);
        } else {
          this.userMarker = new google.maps.Marker({
            position: new google.maps.LatLng(latitude, longitude),
            map: this.map,
            icon: {
              url: './assets/icon/mi.png',
              scaledSize: new google.maps.Size(30, 30)
            }
          });
        }
      }
    }
  }

  async addMarker() {
    const user = await this.auth.currentUser;
    if (user) {
      try {
        const position = await this.getCurrentPosition();

        const marker = new google.maps.Marker({
          position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
          map: this.map,
          icon: {
            url: './assets/icon/marcador.png',
            scaledSize: new google.maps.Size(30, 30)
          }
        });

        this.addInfoWindow(marker, `${user.displayName} (Marcador)`);

        // Guardar el marcador en la base de datos
        await this.geolocationService.addMarker(user.uid, position.coords.latitude, position.coords.longitude, user.displayName);

        // Actualizar el marcador en el mapa
        if (this.markerMarkers[user.uid]) {
          this.markerMarkers[user.uid].setPosition(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
        } else {
          this.markerMarkers[user.uid] = marker;
        }
      } catch (error) {
        console.error('Error getting location', error);
      }
    }
  }

  getCurrentPosition(): Promise<GeolocationPosition> {
    return Geolocation.getCurrentPosition({ 
      enableHighAccuracy: true,
      maximumAge: 3000, // 3 segundos de caché
      timeout: 5000 // 5 segundos de tiempo de espera
    });
  }

  async centerMapOnCurrentLocation() {
    try {
      const position = await this.getCurrentPosition();
      const latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      this.map.setCenter(latLng);
      this.map.setZoom(15);
    } catch (error) {
      console.error('Error centering map on current location', error);
    }
  }

  addInfoWindow(marker: google.maps.Marker, content: string) {
    const infoWindow = new google.maps.InfoWindow({
      content
    });

    marker.addListener('click', () => {
      infoWindow.open(this.map, marker);
    });
  }
}
