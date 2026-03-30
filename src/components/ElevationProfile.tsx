import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { BarChart2 } from 'lucide-react';
import { GPXTrack } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { getSlopeColor, processTrackPoints } from '../utils/slope';

interface ElevationProfileProps {
  track: GPXTrack | null;
  onHover: (point: { lat: number; lng: number } | null) => void;
  units: 'metric' | 'imperial';
  mode?: 'elevation' | 'slope';
  onToggleMode?: () => void;
}

export const ElevationProfile: React.FC<ElevationProfileProps> = React.memo(({ 
  track, 
  onHover, 
  units,
  mode = 'elevation',
  onToggleMode
}) => {
  const { t } = useTranslation();

  const data = useMemo(() => {
    if (!track || track.points.length === 0) return [];
    
    const processedPoints = processTrackPoints(track.points);
    
    // Moving average filter for elevation to reduce noise
    const windowSize = 10;
    const elevations = processedPoints.map(p => p.ele || 0);
    const smoothedElevations: number[] = [];
    
    for (let i = 0; i < elevations.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(elevations.length, i + Math.ceil(windowSize / 2));
      const window = elevations.slice(start, end);
      const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
      smoothedElevations.push(avg);
    }

    return processedPoints.map((p, index) => {
      const distanceVal = units === 'metric' 
        ? p.cumulativeDistance / 1000 
        : (p.cumulativeDistance / 1000) * 0.621371;
        
      const elevationVal = units === 'metric'
        ? smoothedElevations[index]
        : smoothedElevations[index] * 3.28084;

      return {
        distance: parseFloat(distanceVal.toFixed(2)),
        elevation: Math.round(elevationVal),
        slope: p.slope,
        lat: p.lat,
        lng: p.lng
      };
    });
  }, [track, units]);

  const totalDistance = data.length > 0 ? data[data.length - 1].distance : 0;

  const slopeGradient = useMemo(() => {
    if (mode !== 'slope' || data.length === 0) return null;
    
    // Increased density of stops for sharper color transitions
    const step = Math.max(1, Math.floor(data.length / 500)); 
    const stops = [];
    for (let i = 0; i < data.length; i += step) {
      const entry = data[i];
      const offset = totalDistance > 0 ? (entry.distance / totalDistance) * 100 : 0;
      stops.push(
        <stop key={i} offset={`${offset}%`} stopColor={getSlopeColor(entry.slope)} />
      );
    }
    // Ensure the last point is included
    if ((data.length - 1) % step !== 0) {
      const last = data[data.length - 1];
      stops.push(
        <stop key="last" offset="100%" stopColor={getSlopeColor(last.slope)} />
      );
    }
    return stops;
  }, [data, mode, totalDistance]);

  if (!track || data.length === 0) return null;

  const distanceLabel = units === 'metric' ? t('distance') + ' (km)' : t('distance') + ' (mi)';
  const elevationLabel = units === 'metric' ? t('elevation') + ' (m)' : t('elevation') + ' (ft)';

  return (
    <div className="h-full w-full bg-black flex overflow-hidden relative group">
      <div className="flex-1 p-2 sm:p-4">
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
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorEle" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="slopeLineGradient" x1="0" y1="0" x2="1" y2="0">
                {slopeGradient}
              </linearGradient>
              <linearGradient id="verticalFade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="white" stopOpacity={0.3}/>
                <stop offset="100%" stopColor="white" stopOpacity={0}/>
              </linearGradient>
              <mask id="slopeMask">
                <rect x="0" y="0" width="100%" height="100%" fill="url(#verticalFade)" />
              </mask>
            </defs>
            <XAxis 
              dataKey="distance" 
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
              interval="preserveStartEnd"
              unit={units === 'metric' ? ' km' : ' mi'}
              dy={10}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
              domain={['dataMin - 10', 'dataMax + 10']}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
              orientation="left"
              unit={units === 'metric' ? ' m' : ' ft'}
              width={60}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const p = payload[0].payload;
                  return (
                    <div className="bg-[#1a1a1a] p-2 border border-white/10 shadow-xl text-xs text-white rounded">
                      <p className="font-bold">{p.elevation} {units === 'metric' ? 'm' : 'ft'}</p>
                      <p className="text-white/50">{p.distance} {units === 'metric' ? 'km' : 'mi'}</p>
                      <p className="text-white/50">{t('slope')}: {p.slope}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            
            {/* Fill Area */}
            <Area 
              type="linear" 
              dataKey="elevation" 
              stroke="none"
              fill={mode === 'slope' ? "url(#slopeLineGradient)" : "url(#colorEle)"} 
              fillOpacity={mode === 'slope' ? 1 : 0.6}
              mask={mode === 'slope' ? "url(#slopeMask)" : undefined}
              isAnimationActive={false}
            />
            
            {/* Stroke Line */}
            <Area 
              type="linear" 
              dataKey="elevation" 
              fill="none"
              stroke={mode === 'slope' ? "url(#slopeLineGradient)" : "#3b82f6"} 
              strokeWidth={2}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {onToggleMode && (
        <button 
          onClick={onToggleMode}
          className="absolute right-4 bottom-10 p-1.5 bg-white/10 hover:bg-white/20 rounded border border-white/10 text-white/60 transition-colors z-10"
        >
          <BarChart2 size={16} />
        </button>
      )}
    </div>
  );
});
