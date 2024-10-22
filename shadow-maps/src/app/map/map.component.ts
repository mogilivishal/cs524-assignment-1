import { environment } from '../../environments/environment.prod';
import { Component, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { Map, View } from 'ol';
import { Image as ImageLayer, Tile as TileLayer } from 'ol/layer';
import { transform, toLonLat } from 'ol/proj';
import RasterSource from 'ol/source/Raster';
import { createXYZ } from 'ol/tilegrid';
import OSM, { ATTRIBUTION } from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import { ChartComponent } from '../chart/chart.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit {
  public mousePosition: any;
  public values: Array<Object>;
  public chartObject: ChartComponent;
  public point1: boolean;
  public point2: boolean;
  public point3: boolean;
  constructor() {
    this.values = [
      { Season: 'Winter', Shadow: '0' },
      { Season: 'Spring/Fall', Shadow: '0' },
      { Season: 'Summer', Shadow: '0' },
    ];
    this.chartObject = new ChartComponent();
    this.point1 = false;
    this.point2 = false;
    this.point3 = false;
  }
  ngAfterViewInit(): void {
    //assigning the data/shadow maps 
    const Data = new XYZ({
      url: environment.filesurl + '/chi-dec-21/{z}/{x}/{y}.png',
      tileGrid: createXYZ({ tileSize: 256, minZoom: 15, maxZoom: 15 }),
    });
    const Data1 = new XYZ({
      url: environment.filesurl + '/chi-jun-21/{z}/{x}/{y}.png',
      tileGrid: createXYZ({ tileSize: 256, minZoom: 15, maxZoom: 15 }),
    });
    const Data2 = new XYZ({
      url: environment.filesurl + '/chi-sep-22/{z}/{x}/{y}.png',
      tileGrid: createXYZ({ tileSize: 256, minZoom: 15, maxZoom: 15 }),
    });
    const raster1 = new RasterSource({
      sources: [Data],
      operation: function (pixels: any, data: any): any {
        let pixel = [0, 0, 0, 0];
        let val = pixels[0][3] / 255.0;
        pixel[0] = 66 * val;
        pixel[1] = 113 * val;
        pixel[2] = 143 * val;
        pixel[3] = 255 * val;
        return pixel;
      },
    });
    const raster2 = new RasterSource({
      sources: [Data1],
      operation: function (pixels: any, data: any): any {
        let pixel = [0, 0, 0, 0];
        let val = pixels[0][3] / 255.0;
        pixel[0] = 66 * val;
        pixel[1] = 113 * val;
        pixel[2] = 143 * val;
        pixel[3] = 255 * val;
        return pixel;
      },
    });
    const raster3 = new RasterSource({
      sources: [Data2],
      operation: function (pixels: any, data: any): any {
        let pixel = [0, 0, 0, 0];
        let val = pixels[0][3] / 255.0;
        pixel[0] = 66 * val;
        pixel[1] = 113 * val;
        pixel[2] = 143 * val;
        pixel[3] = 255 * val;
        return pixel;
      },
    });
    const tileLayer = new TileLayer({
      source: new OSM({
        url: 'https://s.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png',
      }),
    });
    // image layers creation and mapping with raster
    const imageLayer1 = new ImageLayer({
      source: raster1,
      zIndex: 1,
    });
    const imageLayer2 = new ImageLayer({
      source: raster2,
      zIndex: 1,
    });
    const imageLayer3 = new ImageLayer({
      source: raster3,
      zIndex: 1,
    });
    imageLayer1.on('postrender', (event: any) => {
      var ctx = event.context;
      var pixelRatio = event.frameState.pixelRatio;
      if (this.mousePosition) {
        var x = this.mousePosition[0] * pixelRatio;
        var y = this.mousePosition[1] * pixelRatio;
        var data = ctx.getImageData(x, y, 1, 1).data;
        var value = (data[3] / 255) * 360;
        this.values[0] = { season: 'Winter', Shadow: value.toString() };
        this.updateValues();
        this.point1 = true;
      }
    });
    imageLayer2.on('postrender', (event: any) => {
      var ctx = event.context;
      var pixelRatio = event.frameState.pixelRatio;
      if (this.mousePosition) {
        var x = this.mousePosition[0] * pixelRatio;
        var y = this.mousePosition[1] * pixelRatio;
        var data = ctx.getImageData(x, y, 1, 1).data;
        var value = (data[3] / 255) * 540;
        this.values[1] = { season: 'Spring/Fall', Shadow: value.toString() };
        this.updateValues();
        this.point2 = true;
      }
    });
    imageLayer3.on('postrender', (event: any) => {
      var ctx = event.context;
      var pixelRatio = event.frameState.pixelRatio;
      if (this.mousePosition) {
        var x = this.mousePosition[0] * pixelRatio;
        var y = this.mousePosition[1] * pixelRatio;
        var data = ctx.getImageData(x, y, 1, 1).data;
        var value = (data[3] / 255) * 720;
        this.values[2] = { season: 'Summer', Shadow: value.toString() };
        this.updateValues();
        this.point3 = true;
      }
    });
    const map = new Map({
      layers: [tileLayer, imageLayer1, imageLayer2, imageLayer3],
      target: 'map',
      view: new View({
        maxZoom: 15,
        center: transform([-87.6298, 41.8781], 'EPSG:4326', 'EPSG:3857'),
        zoom: 15,
      }),
    });
    map.on('pointermove', (evt: any) => {
      if (evt.pixel != this.mousePosition) {
        this.mousePosition = evt.pixel;

        map.render();
      }
    });
    if (document.getElementById('#map')) {
      document.getElementById('#map')!.innerHTML = map.toString();
      this.chartObject.ngAfterViewInit();
    }
  }
//updating the values and sending them to next point
  updateValues() {
    if (this.point1 && this.point2 && this.point3) {
      this.chartObject.updateValues(this.values); 
    }
  }
}
