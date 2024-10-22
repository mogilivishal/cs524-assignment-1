import { Component, AfterViewInit, Input } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
})
export class ChartComponent implements AfterViewInit {
  private svg: any;
  private margin = 50;
  private width = 400 - this.margin * 2;
  private height = 280 - this.margin * 2;
  //Assigning the shadow values
  private data = [
    { Season: 'Winter', Shadow: '100' },
    { Season: 'Spring/Fall', Shadow: '100' },
    { Season: 'Summer', Shadow: '100' },
  ];
  constructor() {}
  //Creating the map and visualising the shadow data
  private createSvg(): void {
    this.svg = d3
      .select('figure#bar')
      .append('svg')
      .attr('width', this.width + this.margin * 2)
      .attr('height', this.height + this.margin * 2)
      .append('g')
      .attr('transform', 'translate(' + this.margin + ',' + this.margin + ')');
  }
  private drawBars(data: any[]): void {
    const a = d3
      .scaleBand()
      .range([0, this.width])
      .domain(data.map((d) => d.Season))
      .padding(0.4);
    this.svg
      .append('g')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3.axisBottom(a))
      .selectAll('text')
      .attr('transform', 'translate(13,0)')
      .style('text-anchor', 'end');
    const b = d3.scaleLinear().domain([0, 720]).range([this.height, 0]);
    this.svg.append('g').call(d3.axisLeft(b)).append('text');
    this.svg
      .selectAll('bars')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d: any) => a(d.Season))
      .attr('y', (d: any) => b(d.Shadow))
      .attr('width', a.bandwidth())
      .attr('height', (d: any) => this.height - b(d.Shadow))
      .attr('fill', function (d: any) {
        //Assigning colors for the bar graph with respective seasons
        let color;
        if (d.Season == 'Summer') {
          color = '#D48A02';
        } else if (d.Season == 'Winter') {
          color = '#013838';
        } else {
          color = '#66E3A5'; 
        }
        return color;
      });
    this.svg
      .selectAll('text.bar')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'bar')
      .attr('text-anchor', 'right')
      .attr('x', (d: any) => a(d.Season))
      .attr('y', (d: any) => b(d.Shadow))
      .text(function (d: any) {
        //applting percentage calculations to represent on charts
        let percent;
        if (d.Season == 'Summer') {
          percent = ((parseFloat(d.Shadow) / 720) * 100).toFixed(2);
        } else if (d.Season == 'Winter') {
          percent = ((parseFloat(d.Shadow) / 360) * 100).toFixed(2);
        } else {
          percent = ((parseFloat(d.Shadow) / 540) * 100).toFixed(2);
        }
        return (
          parseFloat(d.Shadow).toFixed(2) + 'min(' + percent.toString() + '%)'
        );
      });
    d3.selectAll('text').style('font-size', '12px');
  }
  ngAfterViewInit(): void {
    this.createSvg();
    this.drawBars(this.data);
  }
  //updating the chart values on the map
  updateValues(values: any) {
    this.data[0].Shadow = values[0].Shadow;
    this.data[1].Shadow = values[1].Shadow;
    this.data[2].Shadow = values[2].Shadow;
    var node = document.getElementsByTagName('figure')[0]; 
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
    this.createSvg();
    //calling drawbars to present the chart on the map
    this.drawBars(this.data);
  }
}
