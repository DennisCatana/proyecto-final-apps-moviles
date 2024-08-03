import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Geolocation, GeolocationPosition, PositionOptions } from '@capacitor/geolocation';
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
  updateInterval: any;
  firstLoad = true;
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
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
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
    this.locationSubscription = this.geolocationService.getLocations().subscribe(locations => {
      locations.forEach(location => {
        const infoContent = `${location.name} (Ubicación en tiempo real)`;

        if (this.locationMarkers[location.uid]) {
          this.locationMarkers[location.uid].setPosition(new google.maps.LatLng(location.lat, location.lng));
          this.addInfoWindow(this.locationMarkers[location.uid], infoContent);
        } else {
          const marker = new google.maps.Marker({
            position: new google.maps.LatLng(location.lat, location.lng),
            map: this.map,
            icon: {
              url: './assets/icon/usuario.png',
              scaledSize: new google.maps.Size(30, 30)
            }
          });

          this.addInfoWindow(marker, infoContent);

          this.locationMarkers[location.uid] = marker;
        }
      });

      if (this.firstLoad && Object.keys(this.locationMarkers).length) {
        const bounds = new google.maps.LatLngBounds();
        Object.values(this.locationMarkers).forEach(marker => bounds.extend(marker.getPosition() as google.maps.LatLng));
        this.map.fitBounds(bounds);
        this.firstLoad = false;
      }
    });
  }

  trackMarkers() {
    this.markerSubscription = this.geolocationService.getMarkers().subscribe(markers => {
      markers.forEach(markerData => {
        const infoContent = `${markerData.name} (Marcador)`;

        if (this.markerMarkers[markerData.uid]) {
          this.markerMarkers[markerData.uid].setPosition(new google.maps.LatLng(markerData.lat, markerData.lng));
          this.addInfoWindow(this.markerMarkers[markerData.uid], infoContent);
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
    this.updateInterval = setInterval(() => {
      this.auth.currentUser.then(user => {
        if (user) {
          Geolocation.getCurrentPosition({ enableHighAccuracy: true }).then(position => {
            const { latitude, longitude } = position.coords;
            this.geolocationService.updateLocation(user.uid, latitude, longitude, user.displayName);
          }).catch(error => {
            console.error('Error getting current position', error);
          });
        }
      });
    }, 10000); // Update every 10 seconds
  }

  async updateLocation(position: GeolocationPosition) {
    const user = await this.auth.currentUser;
    if (user) {
      const { latitude, longitude, accuracy } = position.coords;
      if (accuracy < 50) { // Only update if accuracy is less than 50 meters
        this.geolocationService.updateLocation(user.uid, latitude, longitude, user.displayName);

        if (this.firstLoad) {
          this.map.setCenter(new google.maps.LatLng(latitude, longitude));
          this.map.setZoom(15);
          this.firstLoad = false;
        }

        if (this.userMarker) {
          this.userMarker.setPosition(new google.maps.LatLng(latitude, longitude));
          this.userMarker.setVisible(true);
        } else {
          this.userMarker = new google.maps.Marker({
            position: new google.maps.LatLng(latitude, longitude),
            map: this.map,
            icon: {
              url: './assets/icon/usuario.png',
              scaledSize: new google.maps.Size(30, 30)
            }
          });

          this.addInfoWindow(this.userMarker, `${user.displayName} (Ubicación en tiempo real)`);
        }
      }
    }
  }

  async addMarker() {
    const user = await this.auth.currentUser;
    if (user) {
      try {
        const position = await this.getCurrentPosition();

        // Check if the user already has a marker
        if (this.markerMarkers[user.uid]) {
          // Update the existing marker position
          this.markerMarkers[user.uid].setPosition(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
          this.geolocationService.addMarker(user.uid, position.coords.latitude, position.coords.longitude, user.displayName); // Changed here
        } else {
          // Add a new marker
          const marker = new google.maps.Marker({
            position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
            map: this.map,
            icon: {
              url: './assets/icon/marcador.png',
              scaledSize: new google.maps.Size(30, 30)
            }
          });

          this.addInfoWindow(marker, `${user.displayName} (Marcador)`);

          this.markerMarkers[user.uid] = marker;

          this.geolocationService.addMarker(user.uid, position.coords.latitude, position.coords.longitude, user.displayName);
        }
      } catch (error) {
        console.error('Error adding marker', error);
        alert('Error adding marker: ' + error.message);
      }
    }
  }

  async getCurrentPosition(): Promise<GeolocationPosition> {
    try {
      return await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 5000 });
    } catch (error) {
      console.error('Error getting current position', error);
      throw error;
    }
  }

  async centerMapOnCurrentLocation() {
    try {
      const position = await this.getCurrentPosition();
      this.updateLocation(position);
      this.map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
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
