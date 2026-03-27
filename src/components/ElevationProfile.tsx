import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GPXTrack } from '../types';

interface ElevationProfileProps {
  track: GPXTrack | null;
  onHover: (point: { lat: number; lng: number } | null) => void;
}

// Haversine distance in meters
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

export const ElevationProfile: React.FC<ElevationProfileProps> = ({ track, onHover }) => {
  if (!track || track.points.length === 0) return null;

  let cumulativeDistance = 0;
  const data = track.points.map((p, i) => {
    if (i > 0) {
      cumulativeDistance += getDistance(
        track.points[i-1].lat, track.points[i-1].lng,
        p.lat, p.lng
      );
    }
    return {
      distance: (cumulativeDistance / 1000).toFixed(2), // km
      elevation: p.ele || 0,
      lat: p.lat,
      lng: p.lng
    };
  });

  return (
    <div className="h-48 w-full bg-white border-t border-slate-200 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          onMouseMove={(e: any) => {
            if (e && e.activePayload && e.activePayload.length > 0) {
              const { lat, lng } = e.activePayload[0].payload;
              onHover({ lat, lng });
            } else {
              onHover(null);
            }
          }}
          onMouseLeave={() => onHover(null)}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="distance" 
            label={{ value: 'Distance (km)', position: 'insideBottomRight', offset: -5 }} 
            tick={{ fontSize: 10 }}
          />
          <YAxis 
            label={{ value: 'Elevation (m)', angle: -90, position: 'insideLeft' }} 
            tick={{ fontSize: 10 }}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-2 border border-slate-200 shadow-sm text-xs">
                    <p className="font-bold">{payload[0].value} m</p>
                    <p className="text-slate-500">{payload[0].payload.distance} km</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area 
            type="monotone" 
            dataKey="elevation" 
            stroke="#2563eb" 
            fill="#dbeafe" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
