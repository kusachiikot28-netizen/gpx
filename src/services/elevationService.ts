import { GPXPoint } from '../types';

const MAX_POINTS_PER_REQUEST = 250;
const MIN_DELAY_BETWEEN_BATCHES = 1200; // Increased slightly
const GLOBAL_COOLDOWN = 2500; // Increased slightly

let isRequesting = false;
let lastRequestTime = 0;
let rateLimitLockoutUntil = 0;

// Simple cache for elevation data to avoid redundant requests
const elevationCache = new Map<string, number>();

/**
 * Singleton-like wrapper to ensure serial execution with cooldowns
 */
async function withRateLimit<T>(fn: () => Promise<T>): Promise<T> {
  while (isRequesting || Date.now() < lastRequestTime + GLOBAL_COOLDOWN || Date.now() < rateLimitLockoutUntil) {
    const waitTime = Math.max(200, rateLimitLockoutUntil - Date.now(), (lastRequestTime + GLOBAL_COOLDOWN) - Date.now());
    await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 1000)));
  }

  isRequesting = true;
  try {
    const result = await fn();
    lastRequestTime = Date.now();
    return result;
  } finally {
    isRequesting = false;
  }
}

export async function getElevation(points: GPXPoint[]): Promise<number[]> {
  if (points.length === 0) return [];

  const results: number[] = new Array(points.length).fill(NaN);
  const pointsToFetch: { idx: number; lat: number; lng: number }[] = [];

  points.forEach((p, i) => {
    const lat = typeof p.lat === 'number' && !isNaN(p.lat) ? p.lat : 0;
    const lng = typeof p.lng === 'number' && !isNaN(p.lng) ? p.lng : 0;
    const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    
    if (elevationCache.has(key)) {
      results[i] = elevationCache.get(key)!;
    } else {
      pointsToFetch.push({ idx: i, lat, lng });
    }
  });

  if (pointsToFetch.length === 0) return results;

  return withRateLimit(async () => {
    // Re-check cache inside the lock in case another request filled it
    const stillToFetch: typeof pointsToFetch = [];
    pointsToFetch.forEach(p => {
      const key = `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`;
      if (elevationCache.has(key)) {
        results[p.idx] = elevationCache.get(key)!;
      } else {
        stillToFetch.push(p);
      }
    });

    if (stillToFetch.length === 0) return results;

    for (let i = 0; i < stillToFetch.length; i += MAX_POINTS_PER_REQUEST) {
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, MIN_DELAY_BETWEEN_BATCHES));
      }

      const batch = stillToFetch.slice(i, i + MAX_POINTS_PER_REQUEST);
      const lats = batch.map(p => p.lat.toFixed(5)).join(',');
      const lngs = batch.map(p => p.lng.toFixed(5)).join(',');
      const url = `https://api.open-meteo.com/v1/elevation?latitude=${lats}&longitude=${lngs}`;

      let success = false;
      let retries = 5;
      let backoff = 4000;

      while (!success && retries >= 0) {
        try {
          const response = await fetch(url);
          
          if (response.status === 429) {
            console.warn(`Rate limit hit. Locking out for 30s...`);
            rateLimitLockoutUntil = Date.now() + 30000; // 30s lockout
            throw new Error('Rate limit exceeded (429)');
          }
          
          if (!response.ok) {
            if (response.status === 400) {
              batch.forEach(p => { results[p.idx] = 0; });
              success = true;
              break;
            }
            throw new Error(`Elevation request failed with status ${response.status}`);
          }
          
          const data = await response.json();
          if (data.elevation) {
            data.elevation.forEach((ele: number, idx: number) => {
              const p = batch[idx];
              results[p.idx] = ele;
              elevationCache.set(`${p.lat.toFixed(5)},${p.lng.toFixed(5)}`, ele);
            });
            success = true;
          } else {
            throw new Error('No elevation data in response');
          }
        } catch (error) {
          console.error(`Elevation fetch attempt failed (${retries} retries left):`, error);
          retries--;
          if (retries < 0) {
            batch.forEach(p => { results[p.idx] = 0; });
          } else {
            // Jittered exponential backoff
            const jitter = Math.random() * 1000;
            await new Promise(resolve => setTimeout(resolve, backoff + jitter));
            backoff *= 2;
          }
        }
      }
    }
    return results;
  }).then(res => res.map(v => isNaN(v) ? 0 : v));
}
