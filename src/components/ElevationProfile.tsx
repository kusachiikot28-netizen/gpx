import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GPXTrack } from '../types';

interface ElevationProfileProps {
  track: GPXTrack | null;
  onHover: (point: { lat: number; lng: number } | null) => void;
}

export const ElevationProfile: React.FC<ElevationProfileProps> = ({ track, onHover }) => {
  if (!track || track.points.length === 0) return null;

  const data = track.points.map((p, i) => {
    // Calculate cumulative distance
    let dist = 0;
    if (i > 0) {
      // This is a simplification, real distance should be calculated between all points
      // For the chart we just need a sequence
      dist = i * (track.distance / track.points.length);
    }
    return {
      distance: (dist / 1000).toFixed(2), // km
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
