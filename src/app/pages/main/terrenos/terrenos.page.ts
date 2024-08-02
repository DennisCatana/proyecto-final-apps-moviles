import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-terrenos',
  templateUrl: './terrenos.page.html',
  styleUrls: ['./terrenos.page.scss'],
})
export class TerrenosPage implements OnInit {
  map!: google.maps.Map;
  polygon: google.maps.Polygon | null = null;
  polygonPaths: google.maps.LatLngLiteral[] = [];
  Varea: number | null = null; // Para almacenar el área
  Vperimetro: number | null = null; // Para almacenar el perímetro

  ngOnInit() {
    this.initMap();
  }

  initMap() {
    const mapOptions: google.maps.MapOptions = {
      center: { lat: -34.397, lng: 150.644 },
      zoom: 8,
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

}
