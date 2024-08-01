import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Geolocation, PositionOptions } from '@capacitor/geolocation';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ubicacion',
  templateUrl: './ubicacion.page.html',
  styleUrls: ['./ubicacion.page.scss'],
})
export class UbicacionPage implements OnInit, AfterViewInit, OnDestroy {
  map: google.maps.Map;
  markers: google.maps.Marker[] = [];
  userMarker: google.maps.Marker | null = null;
  updateInterval: any;
  firstLoad = true;
  locationSubscription: Subscription;
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
      this.clearMarkers();
      locations.forEach(location => {
        const marker = new google.maps.Marker({
          position: new google.maps.LatLng(location.lat, location.lng),
          map: this.map,
          icon: {
            url: './assets/icon/usuario.png',
            scaledSize: new google.maps.Size(30, 30)
          }
        });

        const infowindow = new google.maps.InfoWindow({
          content: location.name
        });
        infowindow.open(this.map, marker);
        
        this.markers.push(marker);
      });

      if (this.firstLoad && this.markers.length) {
        const bounds = new google.maps.LatLngBounds();
        this.markers.forEach(marker => bounds.extend(marker.getPosition() as google.maps.LatLng));
        this.map.fitBounds(bounds);
        this.firstLoad = false;
      }
    });
  }

  trackMarkers() {
    this.geolocationService.getMarkers().subscribe(markers => {
      markers.forEach(markerData => {
        const marker = new google.maps.Marker({
          position: new google.maps.LatLng(markerData.lat, markerData.lng),
          map: this.map,
          icon: {
            url: './assets/icon/marcador.png',
            scaledSize: new google.maps.Size(30, 30)
          }
        });

        const infowindow = new google.maps.InfoWindow({
          content: markerData.name
        });
        infowindow.open(this.map, marker);
        
        this.markers.push(marker);
      });
    });
  }

  clearMarkers() {
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
  }

  startAutoUpdateLocation() {
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    Geolocation.watchPosition(options, (position, err) => {
      if (position) {
        this.updateLocation(position);
      } else {
        console.error('Error watching position', err);
      }
    }).then(watchId => {
      this.watchId = watchId;
    });
  }

  async updateLocation(position: GeolocationPosition) {
    const user = await this.auth.currentUser;
    if (user) {
      const { latitude, longitude, accuracy } = position.coords;
      if (accuracy < 50) { // Only update if accuracy is better than 50 meters
        this.geolocationService.updateLocation(user.uid, latitude, longitude, user.displayName);

        if (this.firstLoad) {
          this.map.setCenter(new google.maps.LatLng(latitude, longitude));
          this.map.setZoom(15);
          this.firstLoad = false;
        }
      }
    }
  }

  async addMarker() {
    const user = await this.auth.currentUser;
    if (user) {
      try {
        const position = await this.getCurrentPosition();

        if (this.userMarker) {
          this.userMarker.setMap(null);
        }

        this.userMarker = new google.maps.Marker({
          position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
          map: this.map,
          icon: {
            url: './assets/icon/marcador.png',
            scaledSize: new google.maps.Size(30, 30)
          }
        });

        const infowindow = new google.maps.InfoWindow({
          content: user.displayName
        });
        infowindow.open(this.map, this.userMarker);

        this.geolocationService.addMarker(user.uid, position.coords.latitude, position.coords.longitude, user.displayName);
      } catch (error) {
        console.error('Error adding marker', error);
      }
    }
  }

  async getCurrentPosition() {
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };
    return Geolocation.getCurrentPosition(options);
  }
}
