/**
 * PULSE DATA ANALYTICS - ARCHITECTURE SAMPLE
 * 
 * THE PROBLEM: 
 * Incoming IoT sensor data arrives every 50ms. Updating the UI (D3.js) at this 
 * frequency causes massive frame drops and a laggy user experience.
 * 
 * THE SOLUTION:
 * This service acts as a "buffer zone". It collects high-speed raw data and 
 * boils it down into meaningful 1-second chunks. This keeps the visualization 
 * smooth while still providing real-time updates.
 */

import { Injectable } from '@angular/core';
import { Subject, Observable, timer } from 'rxjs';
import { 
  filter, 
  map, 
  windowTime, 
  switchMap, 
  bufferTime, 
  catchError, 
  shareReplay 
} from 'rxjs/operators';

export interface SensorReading {
  sensorId: string;
  value: number;
  unit: string;
  timestamp: number;
}

export interface UIUpdateMetric {
  sensorId: string;
  average: number;
  peak: number;
  readingCount: number;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class StreamProcessorService {
  
  // Internal bus for incoming raw telemetry
  private rawIngestion$ = new Subject<SensorReading>();

  // Public stream for components to subscribe to
  public readonly processedMetrics$: Observable<UIUpdateMetric>;

  constructor() {
    this.processedMetrics$ = this.setupProcessingPipeline();
  }

  /**
   * Pushes new sensor data into the processing pipeline.
   * Usually called by a WebSocket or MQTT listener.
   */
  public broadcast(reading: SensorReading): void {
    this.rawIngestion$.next(reading);
  }

  private setupProcessingPipeline(): Observable<UIUpdateMetric> {
    const UPDATE_WINDOW_MS = 1000;

    return this.rawIngestion$.asObservable().pipe(
      // 1. Data Sanitization
      // We ignore broken readings or empty payloads immediately
      filter(reading => this.isValid(reading)),

      // 2. High-Frequency Downsampling
      // We group the noise into time-based windows
      windowTime(UPDATE_WINDOW_MS),
      switchMap(window$ => 
        window$.pipe(
          bufferTime(UPDATE_WINDOW_MS),
          map(batch => this.calculateBatchMetrics(batch))
        )
      ),

      // 3. Resilience
      // If something breaks, we don't want the whole dashboard to die.
      // We log the error and restart the stream after a short breather.
      catchError(err => {
        console.error('Stream Pipeline crashed:', err);
        return timer(2000).pipe(switchMap(() => this.setupProcessingPipeline()));
      }),
      
      // Share the same execution path among all UI components
      shareReplay(1)
    );
  }

  private isValid(reading: SensorReading): boolean {
    return !!reading && typeof reading.value === 'number' && !Number.isNaN(reading.value);
  }

  /**
   * Aggregates a batch of readings into a single UI-friendly metric.
   */
  private calculateBatchMetrics(batch: SensorReading[]): UIUpdateMetric {
    if (!batch.length) return null;

    const values = batch.map(r => r.value);
    const sum = values.reduce((acc, val) => acc + val, 0);

    return {
      sensorId: batch[0].sensorId,
      average: Number((sum / batch.length).toFixed(2)),
      peak: Math.max(...values),
      readingCount: batch.length,
      timestamp: Date.now()
    };
  }
}
