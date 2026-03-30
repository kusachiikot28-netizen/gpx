export interface GPXPoint {
  lat: number;
  lng: number;
  ele?: number;
  time?: Date;
}

export interface POI {
  id: string;
  name: string;
  description?: string;
  lat: number;
  lng: number;
  icon?: string;
  link?: string;
}

export interface GPXTrack {
  id: string;
  name: string;
  points: GPXPoint[];
  waypoints?: GPXPoint[];
  distance: number; // in meters
  elevationGain: number; // in meters
  elevationLoss: number; // in meters
  hidden?: boolean;
  color?: string;
  opacity?: number;
  width?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  poi?: POI[];
}
