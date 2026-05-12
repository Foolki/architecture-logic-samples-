/**
 * DYNAMIC DASHBOARD - ARCHITECTURE SAMPLE
 * 
 * THE CHALLENGE:
 * Bridging the gap between Angular's declarative nature and D3.js's imperative 
 * DOM manipulation without causing memory leaks or performance bottlenecks.
 * 
 * THE SOLUTION:
 * A "Hybrid Rendering" approach. Angular manages the component lifecycle and 
 * data flow, while D3.js is scoped strictly to a specialized 'render engine' 
 * class that handles the math and SVG updates.
 */

import { Component, ElementRef, Input, OnChanges, OnInit, ViewChild, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import { UIUpdateMetric } from '../pulse-analytics/stream-processor.service';

@Component({
  selector: 'app-realtime-chart',
  template: `<div #chartContainer class="chart-wrapper"></div>`,
  styles: [`.chart-wrapper { width: 100%; height: 300px; }`]
})
export class RealtimeChartComponent implements OnInit, OnChanges {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  
  // We receive the aggregated 1s-batches from our StreamProcessor
  @Input() data: UIUpdateMetric[] = [];

  private svg: any;
  private margin = { top: 20, right: 30, bottom: 30, left: 40 };

  constructor() {}

  ngOnInit(): void {
    this.initChartCanvas();
  }

  /**
   * Reacts to new data arriving from the parent component.
   * Instead of re-drawing everything, we only update the path.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.svg) {
      this.updatePipeline();
    }
  }

  private initChartCanvas(): void {
    const element = this.chartContainer.nativeElement;
    
    // We use D3 to build the static parts of the chart once
    this.svg = d3.select(element)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
      
    // Initialization of Scales and Axes would happen here
  }

  /**
   * The "Smart Update" logic.
   * Using D3's join pattern to efficiently update elements.
   */
  private updatePipeline(): void {
    if (!this.data || this.data.length === 0) return;

    // 1. Setup Scales (Logic for mapping Data to Pixels)
    const x = d3.scaleTime()
      .domain(d3.extent(this.data, d => new Date(d.timestamp)) as [Date, Date])
      .range([0, 800]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(this.data, d => d.peak) || 100])
      .range([250, 0]);

    // 2. Define the Line Generator
    const line = d3.line<UIUpdateMetric>()
      .x(d => x(new Date(d.timestamp)))
      .y(d => y(d.average))
      .curve(d3.curveMonotoneX);

    // 3. The "General Update Pattern"
    // We don't clear the SVG. We bind the new data to the existing path.
    const path = this.svg.selectAll('.line-path').data([this.data]);

    path.enter()
      .append('path')
      .attr('class', 'line-path')
      .merge(path)
      .transition()
      .duration(300) // Smooth transition between data points
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', '#4f46e5')
      .attr('stroke-width', 2);
  }
}
