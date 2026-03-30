import { GPXPoint } from '../types';
import { ActivityType } from '../contexts/RoutingContext';

const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1';

const routeCache = new Map<string, GPXPoint[]>();

export async function getRoute(points: GPXPoint[], activity: ActivityType = 'road_bike'): Promise<GPXPoint[]> {
  if (points.length < 2) return points;

  let osrmProfile = 'cycling';
  if (activity === 'run') osrmProfile = 'foot';
  else if (activity === 'motorcycle') osrmProfile = 'driving';
  else osrmProfile = 'cycling'; // Default for all bike types

  const coords = points.map(p => `${p.lng.toFixed(6)},${p.lat.toFixed(6)}`).join(';');
  const cacheKey = `${osrmProfile}:${coords}`;

  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey)!;
  }

  const url = `${OSRM_BASE_URL}/${osrmProfile}/${coords}?overview=full&geometries=geojson`;

  let success = false;
  let retries = 3;
  let backoff = 2000;

  while (!success && retries >= 0) {
    try {
      const response = await fetch(url);
      if (response.status === 429) {
        console.warn(`Routing rate limit hit. Waiting ${backoff}ms before retry...`);
        backoff = Math.max(backoff, 5000);
        throw new Error('Rate limit exceeded. Please wait a moment.');
      }
      if (!response.ok) {
        throw new Error('Routing request failed');
      }
      const data = await response.json();
      
      if (data.code !== 'Ok') {
        throw new Error(data.message || 'Routing error');
      }

      const route = data.routes[0];
      const coordinates = route.geometry.coordinates;
      
      const result = coordinates.map((coord: [number, number]) => ({
        lat: coord[1],
        lng: coord[0],
        ele: 0,
        time: new Date()
      }));

      routeCache.set(cacheKey, result);
      // Limit cache size
      if (routeCache.size > 100) {
        const firstKey = routeCache.keys().next().value;
        if (firstKey !== undefined) routeCache.delete(firstKey);
      }

      return result;
    } catch (error) {
      console.error(`Routing attempt failed (${retries} retries left):`, error);
      retries--;
      if (retries < 0) throw error;
      await new Promise(resolve => setTimeout(resolve, backoff));
      backoff *= 2;
    }
  }
  
  return points; // Fallback
}
