import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-terrenos',
  templateUrl: './terrenos.page.html',
  styleUrls: ['./terrenos.page.scss'],
})
export class TerrenosPage implements OnInit {
  map!: google.maps.Map;
  marker!: google.maps.Marker;
  polygon: google.maps.Polygon | null = null;
  polygonPaths: google.maps.LatLngLiteral[] = [];
  Varea: number | null = null;
  Vperimetro: number | null = null;
  users$: Observable<any[]>;
  selectedUsers: any[] = [];
  showUserList: boolean = false;

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit() {
    this.initMap();
    this.users$ = this.firebaseService.getUsers();
  }

  initMap() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLatLng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          const mapOptions: google.maps.MapOptions = {
            center: userLatLng,
            zoom: 20,
          };
          this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, mapOptions);

          this.marker = new google.maps.Marker({
            position: userLatLng,
            map: this.map,
            title: 'Dónde estoy exactamente',
          });

          this.map.addListener('click', (event: google.maps.MapMouseEvent) => {
            this.addLatLng(event.latLng);
          });
        },
        (error) => {
          console.error('Error obteniendo la ubicación', error);
          this.loadDefaultMap();
        }
      );
    } else {
      console.error('Geolocalización no soportada por el navegador');
      this.loadDefaultMap();
    }
  }

  loadDefaultMap() {
    const mapOptions: google.maps.MapOptions = {
      center: { lat: -0.187442, lng: -78.501878 },
      zoom: 20,
    };
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, mapOptions);

    this.map.addListener('click', (event: google.maps.MapMouseEvent) => {
      this.addLatLng(event.latLng);
    });
  }

  openUserSelection() {
    this.showUserList = !this.showUserList;
  }

  requestLocations() {
    this.polygonPaths = [];
    this.selectedUsers.forEach(user => {
      this.addLatLng(new google.maps.LatLng(user.location.lat, user.location.lng));
    });
  }

  addLatLng(latLng: google.maps.LatLng | null) {
    if (latLng) {
      this.polygonPaths.push(latLng.toJSON());
      this.drawPolygon();
    }
  }

  drawPolygon() {
    if (this.polygon) {
      this.polygon.setMap(null);
    }

    this.polygon = new google.maps.Polygon({
      paths: this.polygonPaths,
      strokeColor: 'blue',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: 'red',
      fillOpacity: 0.5,
    });
    this.polygon.setMap(this.map);
  }

  calculateAreaAndPerimeter() {
    if (this.polygon) {
      this.Varea = google.maps.geometry.spherical.computeArea(this.polygon.getPath());
      this.Vperimetro = google.maps.geometry.spherical.computeLength(this.polygon.getPath());

      console.log('Área: ', this.Varea);
      console.log('Perímetro: ', this.Vperimetro);
    } else {
      console.log('No hay polígono dibujado.');
      this.Varea = null;
      this.Vperimetro = null;
    }
  }

  clearMap() {
    if (this.polygon) {
      this.polygon.setMap(null);
      this.polygon = null;
    }
    this.polygonPaths = [];
    this.Varea = null;
    this.Vperimetro = null;
    console.log('Mapa limpiado.');
  }

  toggleUserSelection(user: any) {
    const index = this.selectedUsers.findIndex(u => u.id === user.id);
    if (index === -1) {
      this.selectedUsers.push(user);
    } else {
      this.selectedUsers.splice(index, 1);
    }
  }
}
