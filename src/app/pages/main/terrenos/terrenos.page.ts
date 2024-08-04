import { Component, OnInit } from '@angular/core';

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
  Varea: number | null = null; // Para almacenar el área
  Vperimetro: number | null = null; // Para almacenar el perímetro

  ngOnInit() {
    this.initMap();
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

          // Añadir un marcador en la ubicación actual
          this.marker = new google.maps.Marker({
            position: userLatLng,
            map: this.map,
            title: 'Dónde estoy exactamente',
          });

          // Agregar un listener para el evento de clic en el mapa
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

    // Agregar un listener para el evento de clic en el mapa
    this.map.addListener('click', (event: google.maps.MapMouseEvent) => {
      this.addLatLng(event.latLng);
    });
  }

  addLatLng(latLng: google.maps.LatLng | null) {
    if (latLng) {
      this.polygonPaths.push(latLng.toJSON());

      // Redibujar el polígono
      this.drawPolygon();
    }
  }

  drawPolygon() {
    if (this.polygon) {
      this.polygon.setMap(null); // Eliminar el polígono anterior
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
      this.Varea = null; // Restablecer valores si no hay polígono
      this.Vperimetro = null;
    }
  }

  clearMap() {
    if (this.polygon) {
      this.polygon.setMap(null); // Eliminar el polígono del mapa
      this.polygon = null; // Restablecer la referencia al polígono
    }
    this.polygonPaths = []; // Limpiar los caminos del polígono
    this.Varea = null; // Restablecer el valor del área
    this.Vperimetro = null; // Restablecer el valor del perímetro
    console.log('Mapa limpiado.');
  }
}
