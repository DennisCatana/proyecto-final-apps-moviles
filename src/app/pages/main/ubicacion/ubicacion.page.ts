import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Geolocation, PositionOptions, GeolocationPosition } from '@capacitor/geolocation';
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
          const infowindow = new google.maps.InfoWindow({
            content: infoContent
          });
          infowindow.open(this.map, this.locationMarkers[location.uid]);
        } else {
          const marker = new google.maps.Marker({
            position: new google.maps.LatLng(location.lat, location.lng),
            map: this.map,
            icon: {
              url: './assets/icon/usuario.png',
              scaledSize: new google.maps.Size(30, 30)
            }
          });

          const infowindow = new google.maps.InfoWindow({
            content: infoContent
          });
          infowindow.open(this.map, marker);

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
          const infowindow = new google.maps.InfoWindow({
            content: infoContent
          });
          infowindow.open(this.map, this.markerMarkers[markerData.uid]);
        } else {
          const marker = new google.maps.Marker({
            position: new google.maps.LatLng(markerData.lat, markerData.lng),
            map: this.map,
            icon: {
              url: './assets/icon/marcador.png',
              scaledSize: new google.maps.Size(30, 30)
            }
          });

          const infowindow = new google.maps.InfoWindow({
            content: infoContent
          });
          infowindow.open(this.map, marker);

          this.markerMarkers[markerData.uid] = marker;
        }
      });
    });
  }

  startAutoUpdateLocation() {
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    this.watchId = Geolocation.watchPosition(options, (position, err) => {
      if (position) {
        this.updateLocation(position);
      } else {
        console.error('Error watching position', err);
      }
    });
  }

  async updateLocation(position: GeolocationPosition) {
    const user = await this.auth.currentUser;
    if (user) {
      const { latitude, longitude, accuracy } = position.coords;
      if (accuracy < 50) {
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

          const infowindow = new google.maps.InfoWindow({
            content: `${user.displayName} (Ubicación en tiempo real)`
          });
          infowindow.open(this.map, this.userMarker);
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

        const infowindow = new google.maps.InfoWindow({
          content: `${user.displayName} (Marcador)`
        });
        infowindow.open(this.map, marker);

        this.markerMarkers[user.uid] = marker;

        this.geolocationService.addMarker(user.uid, position.coords.latitude, position.coords.longitude, user.displayName);
      } catch (error) {
        console.error('Error adding marker', error);
        alert('Error adding marker: ' + error.message);

        // Use the last known position if available
        const lastPosition = await this.getLastKnownPosition();
        if (lastPosition) {
          const marker = new google.maps.Marker({
            position: new google.maps.LatLng(lastPosition.coords.latitude, lastPosition.coords.longitude),
            map: this.map,
            icon: {
              url: './assets/icon/marcador.png',
              scaledSize: new google.maps.Size(30, 30)
            }
          });

          const infowindow = new google.maps.InfoWindow({
            content: `${user.displayName} (Marcador)`
          });
          infowindow.open(this.map, marker);

          this.markerMarkers[user.uid] = marker;

          this.geolocationService.addMarker(user.uid, lastPosition.coords.latitude, lastPosition.coords.longitude, user.displayName);
        }
      }
    }
  }

  async getCurrentPosition(retries: number = 3): Promise<GeolocationPosition> {
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    for (let i = 0; i < retries; i++) {
      try {
        return await Geolocation.getCurrentPosition(options);
      } catch (error) {
        if (i === retries - 1) {
          console.error('Error getting current position', error);
          alert('Error getting current position: ' + error.message);
          throw error;
        }
      }
    }

    throw new Error('Failed to get current position after multiple attempts');
  }

  async getLastKnownPosition(): Promise<GeolocationPosition | null> {
    try {
      return await Geolocation.getCurrentPosition({ maximumAge: Infinity });
    } catch (error) {
      console.error('Error getting last known position', error);
      return null;
    }
  }
}
