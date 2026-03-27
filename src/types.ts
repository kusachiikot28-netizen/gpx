export interface GPXPoint {
  lat: number;
  lng: number;
  ele?: number;
  time?: Date;
}

export interface GPXTrack {
  id: string;
  name: string;
  points: GPXPoint[];
  distance: number; // in meters
  elevationGain: number; // in meters
  elevationLoss: number; // in meters
}
