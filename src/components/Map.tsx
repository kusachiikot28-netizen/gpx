import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { GPXTrack } from '../types';
import { getSlopeColor, processTrackPoints } from '../utils/slope';
import { useTranslation } from '../contexts/LanguageContext';

// Fix for default marker icons in Leaflet
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  tracks: GPXTrack[];
  selectedTrackId: string | null;
  onPointHover?: (point: { lat: number; lng: number } | null) => void;
  hoverPoint?: { lat: number; lng: number } | null;
  onMapReady?: (map: L.Map) => void;
  elevationMode?: 'elevation' | 'slope';
}

function MapController({ onMapReady }: { onMapReady?: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);
  return null;
}

function ChangeView({ bounds }: { bounds: L.LatLngBoundsExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

const SlopeColoredTrack: React.FC<{ track: GPXTrack }> = ({ track }) => {
  const segments = useMemo(() => {
    if (track.points.length < 2) return [];
    
    const processed = processTrackPoints(track.points);
    const result = [];
    
    if (processed.length < 2) return [];

    let currentPositions: [number, number][] = [[processed[0].lat, processed[0].lng]];
    let currentColor = getSlopeColor(processed[0].slope);

    for (let i = 1; i < processed.length; i++) {
      const p = processed[i];
      const color = getSlopeColor(p.slope);
      
      if (color === currentColor) {
        currentPositions.push([p.lat, p.lng]);
      } else {
        // Close current segment
        currentPositions.push([p.lat, p.lng]);
        result.push({ positions: [...currentPositions], color: currentColor });
        
        // Start new segment
        currentPositions = [[p.lat, p.lng]];
        currentColor = color;
      }
    }
    
    if (currentPositions.length > 1) {
      result.push({ positions: currentPositions, color: currentColor });
    }
    
    return result;
  }, [track]);

  return (
    <>
      {segments.map((seg, idx) => (
        <Polyline
          key={idx}
          positions={seg.positions}
          color={seg.color}
          weight={5}
          opacity={1}
        />
      ))}
    </>
  );
};

const SlopeLegend: React.FC = () => {
  const { t } = useTranslation();
  const categories = [
    { label: '< -10%', color: '#1e3a8a', desc: t('steep_descent') || 'Steep Descent' },
    { label: '-10% … -5%', color: '#3b82f6', desc: t('descent') || 'Descent' },
    { label: '-5% … -2%', color: '#93c5fd', desc: t('light_descent') || 'Light Descent' },
    { label: '-2% … +2%', color: '#facc15', desc: t('flat') || 'Flat' },
    { label: '+2% … +5%', color: '#fb923c', desc: t('light_ascent') || 'Light Ascent' },
    { label: '+5% … +10%', color: '#ef4444', desc: t('ascent') || 'Ascent' },
    { label: '> +10%', color: '#7f1d1d', desc: t('steep_ascent') || 'Steep Ascent' },
  ];

  return (
    <div className="absolute bottom-6 left-6 z-[1000] bg-[#1a1a1a]/90 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-2xl pointer-events-none">
      <p className="text-[10px] uppercase tracking-wider text-white/50 mb-2 font-bold">{t('slope_legend') || 'Slope Legend'}</p>
      <div className="space-y-1.5">
        {categories.map((cat, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: cat.color }} />
            <span className="text-[10px] text-white/80 font-medium">{cat.label}</span>
            <span className="text-[9px] text-white/40 ml-auto">{cat.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Map: React.FC<MapProps> = ({ 
  tracks, 
  selectedTrackId, 
  onPointHover, 
  hoverPoint, 
  onMapReady,
  elevationMode = 'elevation'
}) => {
  const [bounds, setBounds] = useState<L.LatLngBoundsExpression | null>(null);

  useEffect(() => {
    if (tracks.length > 0) {
      const allPoints = tracks.flatMap(t => t.points);
      if (allPoints.length > 0) {
        const latLngs = allPoints.map(p => [p.lat, p.lng] as [number, number]);
        setBounds(L.latLngBounds(latLngs));
      }
    }
  }, [tracks]);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[46.8182, 8.2275]} // Switzerland center as default
        zoom={8}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {tracks.map((track) => {
          const isSelected = track.id === selectedTrackId;
          
          if (isSelected && elevationMode === 'slope') {
            return <SlopeColoredTrack key={track.id} track={track} />;
          }

          return (
            <Polyline
              key={track.id}
              positions={track.points.map(p => [p.lat, p.lng])}
              color={isSelected ? "#2563eb" : "#94a3b8"}
              weight={isSelected ? 5 : 3}
              opacity={isSelected ? 1 : 0.6}
              eventHandlers={{
                mouseover: () => {},
                mouseout: () => {}
              }}
            />
          );
        })}
        {hoverPoint && (
          <Marker position={[hoverPoint.lat, hoverPoint.lng]}>
            <Popup>
               Point Info
            </Popup>
          </Marker>
        )}
        <ChangeView bounds={bounds} />
        <MapController onMapReady={onMapReady} />
      </MapContainer>
      {elevationMode === 'slope' && selectedTrackId && <SlopeLegend />}
    </div>
  );
};
