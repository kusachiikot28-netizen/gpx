import { GPXPoint } from '../types';

/**
 * Calculates distance between two points in meters using Haversine formula.
 */
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export interface ProcessedPoint extends GPXPoint {
  cumulativeDistance: number;
  slope: number;
  smoothedEle: number;
}

/**
 * Processes track points to calculate cumulative distance, smoothed elevation, and slope.
 * Uses a distance-based window for slope calculation to reduce GPS noise.
 */
export function processTrackPoints(points: GPXPoint[]): ProcessedPoint[] {
  if (points.length === 0) return [];

  const n = points.length;
  const result: ProcessedPoint[] = [];
  let cumulativeDistance = 0;

  // 1. First pass: Calculate cumulative distance and initial smoothed elevation
  // We use a very small window for elevation smoothing to keep the profile responsive to sharp changes
  const eleWindow = 1; // 3 points total
  const smoothedPoints = points.map((p, i) => {
    if (i > 0) {
      cumulativeDistance += getDistance(points[i - 1].lat, points[i - 1].lng, p.lat, p.lng);
    }

    let sumEle = 0;
    let count = 0;
    for (let j = i - eleWindow; j <= i + eleWindow; j++) {
      if (j >= 0 && j < n) {
        sumEle += points[j].ele || 0;
        count++;
      }
    }
    
    return {
      ...p,
      cumulativeDistance,
      smoothedEle: sumEle / count
    };
  });

  // 2. Second pass: Calculate slope using a distance-based window
  // A smaller distance window (6m) is more responsive to sharp, short hills
  const SLOPE_WINDOW_METERS = 6; 

  return smoothedPoints.map((p, i) => {
    let slope = 0;
    
    // Find points at roughly -SLOPE_WINDOW_METERS/2 and +SLOPE_WINDOW_METERS/2
    let startIdx = i;
    let endIdx = i;
    
    const targetDist = SLOPE_WINDOW_METERS / 2;
    
    // Look back
    for (let j = i - 1; j >= 0; j--) {
      startIdx = j;
      if (p.cumulativeDistance - smoothedPoints[j].cumulativeDistance >= targetDist) break;
    }
    
    // Look forward
    for (let j = i + 1; j < n; j++) {
      endIdx = j;
      if (smoothedPoints[j].cumulativeDistance - p.cumulativeDistance >= targetDist) break;
    }

    const startP = smoothedPoints[startIdx];
    const endP = smoothedPoints[endIdx];
    const dDist = endP.cumulativeDistance - startP.cumulativeDistance;
    const dEle = endP.smoothedEle - startP.smoothedEle;

    if (dDist > 1) { // Minimum distance to trust slope calculation
      slope = (dEle / dDist) * 100;
    }

    return {
      ...p,
      slope: parseFloat(slope.toFixed(1))
    };
  });
}

/**
 * Returns a color based on the slope percentage.
 * Follows the user's 7-tier color scheme.
 */
export function getSlopeColor(slope: number): string {
  if (slope < -10) return '#08306b';   // < -10: Dark Blue
  if (slope < -5) return '#2171b5';    // -10...-5: Blue
  if (slope < -2) return '#6baed6';    // -5...-2: Light Blue
  if (slope <= 2) return '#9ca3af';    // -2...+2: Gray (Flat)
  if (slope <= 5) return '#f97316';    // +2...+5: Orange
  if (slope <= 10) return '#dc2626';   // +5...+10: Red
  return '#7f1d1d';                    // > 10: Dark Red
}
