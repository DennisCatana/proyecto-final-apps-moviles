import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { Subscription } from 'rxjs';

declare const google: any;

@Component({
  selector: 'app-terrenos',
  templateUrl: './terrenos.page.html',
  styleUrls: ['./terrenos.page.scss'],
})
export class TerrenosPage implements OnInit, AfterViewInit, OnDestroy {
  map: google.maps.Map;
  markers: google.maps.Marker[] = [];
  selectedMarkers: google.maps.Marker[] = [];
  markerSubscription: Subscription;
  polygon: google.maps.Polygon;
  area: number = 0;
  distances: number[] = [];

  constructor(private geolocationService: GeolocationService) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.loadMap();
    this.trackMarkers();
  }

  ngOnDestroy() {
    if (this.markerSubscription) {
      this.markerSubscription.unsubscribe();
    }
  }

  loadMap() {
    const mapOptions: google.maps.MapOptions = {
      center: new google.maps.LatLng(0, 0),
      zoom: 8,
    };

    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, mapOptions);
  }

  trackMarkers() {
    this.markerSubscription = this.geolocationService.getMarkers().subscribe(markers => {
      markers.forEach(markerData => {
        const marker = new google.maps.Marker({
          position: new google.maps.LatLng(markerData.lat, markerData.lng),
          map: this.map,
          icon: {
            url: './assets/icon/marcador.png',
            scaledSize: new google.maps.Size(30, 30)
          }
        });

        marker.addListener('click', () => this.selectMarker(marker));

        this.markers.push(marker);
      });

      const bounds = new google.maps.LatLngBounds();
      this.markers.forEach(marker => bounds.extend(marker.getPosition() as google.maps.LatLng));
      this.map.fitBounds(bounds);
    });
  }

  selectMarker(marker: google.maps.Marker) {
    if (this.selectedMarkers.includes(marker)) {
      this.selectedMarkers = this.selectedMarkers.filter(m => m !== marker);
      marker.setIcon({ url: './assets/icon/marcador.png', scaledSize: new google.maps.Size(30, 30) });
    } else {
      this.selectedMarkers.push(marker);
      marker.setIcon({ url: './assets/icon/marcador-seleccionado.png', scaledSize: new google.maps.Size(30, 30) });
    }

    if (this.selectedMarkers.length >= 3) {
      this.drawPolygon();
      this.calculateArea();
      this.calculateDistances();
    } else {
      if (this.polygon) {
        this.polygon.setMap(null);
      }
      this.area = 0;
      this.distances = [];
    }
  }

  drawPolygon() {
    if (this.polygon) {
      this.polygon.setMap(null);
    }

    const paths = this.selectedMarkers.map(marker => marker.getPosition() as google.maps.LatLng);

    this.polygon = new google.maps.Polygon({
      paths: paths,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
    });

    this.polygon.setMap(this.map);
  }

  calculateArea() {
    const paths = this.polygon.getPath().getArray();
    const area = google.maps.geometry.spherical.computeArea(paths);
    this.area = area / 1000000; // Convert to square kilometers
  }

  calculateDistances() {
    this.distances = [];
    const paths = this.polygon.getPath().getArray();
    for (let i = 0; i < paths.length; i++) {
      const nextIndex = (i + 1) % paths.length;
      const distance = google.maps.geometry.spherical.computeDistanceBetween(paths[i], paths[nextIndex]);
      this.distances.push(distance / 1000); // Convert to kilometers
    }
  }

  reloadPage() {
    location.reload();
  }
}
