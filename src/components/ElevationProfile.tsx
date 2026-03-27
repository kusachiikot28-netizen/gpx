import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GPXTrack } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface ElevationProfileProps {
  track: GPXTrack | null;
  onHover: (point: { lat: number; lng: number } | null) => void;
  units: 'metric' | 'imperial';
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

export const ElevationProfile: React.FC<ElevationProfileProps> = ({ track, onHover, units }) => {
  const { t } = useTranslation();
  if (!track || track.points.length === 0) return null;

  let cumulativeDistance = 0;
  const data = track.points.map((p, i) => {
    if (i > 0) {
      cumulativeDistance += getDistance(
        track.points[i-1].lat, track.points[i-1].lng,
        p.lat, p.lng
      );
    }
    
    const distanceVal = units === 'metric' 
      ? cumulativeDistance / 1000 
      : (cumulativeDistance / 1000) * 0.621371;
      
    const elevationVal = units === 'metric'
      ? p.ele || 0
      : (p.ele || 0) * 3.28084;

    return {
      distance: distanceVal.toFixed(2),
      elevation: Math.round(elevationVal),
      lat: p.lat,
      lng: p.lng
    };
  });

  const distanceLabel = units === 'metric' ? t('distance') + ' (km)' : t('distance') + ' (mi)';
  const elevationLabel = units === 'metric' ? t('elevation') + ' (m)' : t('elevation') + ' (ft)';

  return (
    <div className="h-48 w-full bg-[#1a1a1a] border-t border-white/10 p-4">
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
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="distance" 
            label={{ value: distanceLabel, position: 'insideBottomRight', offset: -5, fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} 
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
          />
          <YAxis 
            label={{ value: elevationLabel, angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} 
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-[#1a1a1a] p-2 border border-white/10 shadow-xl text-xs text-white">
                    <p className="font-bold">{payload[0].value} {units === 'metric' ? 'm' : 'ft'}</p>
                    <p className="text-white/50">{payload[0].payload.distance} {units === 'metric' ? 'km' : 'mi'}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area 
            type="monotone" 
            dataKey="elevation" 
            stroke="#ef4444" 
            fill="rgba(239, 68, 68, 0.2)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
