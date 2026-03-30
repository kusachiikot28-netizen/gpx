import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, useMap, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-polylinedecorator';
import { ExternalLink, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { GPXTrack } from '../types';
import { getSlopeColor, processTrackPoints } from '../utils/slope';
import { useTranslation } from '../contexts/LanguageContext';
import { useRouting } from '../contexts/RoutingContext';
import { getRoute } from '../services/routingService';

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
  selectedTrackIds: string[];
  onPointHover?: (point: { lat: number; lng: number } | null) => void;
  hoverPoint?: { lat: number; lng: number } | null;
  onMapReady?: (map: L.Map) => void;
  elevationMode?: 'elevation' | 'slope';
  bounds: L.LatLngBoundsExpression | null;
  showDirectionArrows?: boolean;
  showDistanceMarkers?: boolean;
  units?: 'metric' | 'imperial';
  onFileDrop?: (files: FileList) => void;
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

function MapClickHandler() {
  const { isEditMode, addWaypoint, onMapClick } = useRouting();
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      } else if (isEditMode) {
        addWaypoint({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          ele: 0,
          time: new Date()
        });
      }
    },
  });
  return null;
}

const RoutePreview: React.FC = () => {
  const { waypoints, trackPoints, isEditMode } = useRouting();

  if (!isEditMode) return null;

  const positions = trackPoints.map(p => [p.lat, p.lng]) as L.LatLngExpression[];

  return (
    <>
      {trackPoints.length > 1 && (
        <Polyline 
          positions={positions}
          color="#3b82f6" 
          weight={4}
          opacity={0.6}
          dashArray="5, 5"
          interactive={false}
        />
      )}
      {waypoints.map((wp, idx) => (
        <Marker key={idx} position={[wp.lat, wp.lng]} icon={L.divIcon({
          className: cn(
            'w-3 h-3 rounded-full border-2 border-white shadow-lg',
            idx === 0 ? 'bg-green-500' : idx === waypoints.length - 1 ? 'bg-red-500' : 'bg-blue-600'
          ),
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        })}>
          <Popup>Waypoint {idx + 1}</Popup>
        </Marker>
      ))}
    </>
  );
};

function ChangeView({ bounds }: { bounds: L.LatLngBoundsExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

const SlopeColoredTrack: React.FC<{ track: GPXTrack }> = React.memo(({ track }) => {
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
});

const DirectionArrows: React.FC<{ track: GPXTrack; color: string }> = React.memo(({ track, color }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!track.points || track.points.length < 2) return;
    
    const polyline = L.polyline(track.points.map(p => [p.lat, p.lng]));
    
    // Create a custom chevron icon
    const chevronIcon = L.divIcon({
      className: 'direction-chevron',
      html: `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 17L12 12L7 17" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M17 11L12 6L7 11" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    const decorator = (L as any).polylineDecorator(polyline, {
      patterns: [
        { 
          offset: '50px', 
          repeat: '100px', 
          symbol: (L as any).Symbol.marker({
            rotate: true,
            markerOptions: {
              icon: chevronIcon,
              interactive: false
            }
          }) 
        }
      ]
    }).addTo(map);
    
    return () => {
      map.removeLayer(decorator);
    };
  }, [map, track, color]);
  
  return null;
});

const DistanceMarkers: React.FC<{ track: GPXTrack; units: 'metric' | 'imperial' }> = React.memo(({ track, units }) => {
  const map = useMap();
  
  const markers = useMemo(() => {
    if (!track.points || track.points.length < 2) return [];
    
    const interval = units === 'metric' ? 5000 : 8046.72; // 5km or 5 miles (approx)
    // User specifically asked for 5km, so let's stick to 5km regardless of units for now, 
    // or maybe adjust if they use imperial. The prompt says "каждые 5 км".
    const targetInterval = 5000; 

    const result: { pos: [number, number]; label: string }[] = [];
    let accumulatedDistance = 0;
    let lastMarkerDistance = 0;

    for (let i = 1; i < track.points.length; i++) {
      const p1 = track.points[i - 1];
      const p2 = track.points[i];
      const d = L.latLng(p1.lat, p1.lng).distanceTo(L.latLng(p2.lat, p2.lng));
      accumulatedDistance += d;

      while (accumulatedDistance >= lastMarkerDistance + targetInterval) {
        lastMarkerDistance += targetInterval;
        const ratio = (lastMarkerDistance - (accumulatedDistance - d)) / d;
        const lat = p1.lat + (p2.lat - p1.lat) * ratio;
        const lng = p1.lng + (p2.lng - p1.lng) * ratio;
        
        const km = Math.round(lastMarkerDistance / 1000);
        result.push({ pos: [lat, lng], label: km.toString() });
      }
    }
    return result;
  }, [track, units]);

  return (
    <>
      {markers.map((m, idx) => (
        <Marker 
          key={idx} 
          position={m.pos} 
          icon={L.divIcon({
            className: 'distance-marker',
            html: `<div class="bg-white text-black border-2 border-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold shadow-md">${m.label}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })}
          interactive={false}
        />
      ))}
    </>
  );
});

const POILayer: React.FC = () => {
  const { pois, removePOI } = useRouting();

  return (
    <>
      {pois.map(poi => (
        <Marker 
          key={poi.id} 
          position={[poi.lat, poi.lng]}
          icon={L.divIcon({
            className: 'poi-marker',
            html: `
              <div class="bg-blue-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white hover:scale-110 transition-transform">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          })}
        >
          <Popup className="poi-popup">
            <div className="p-1">
              <h3 className="font-bold text-sm mb-1">{poi.name}</h3>
              {poi.description && <p className="text-xs text-gray-600 mb-2">{poi.description}</p>}
              {poi.link && (
                <a 
                  href={poi.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-blue-500 hover:underline flex items-center gap-1 mb-2"
                >
                  More info <ExternalLink size={10} />
                </a>
              )}
              <button 
                onClick={() => removePOI(poi.id)}
                className="text-[10px] text-red-500 hover:text-red-700 font-medium"
              >
                Remove POI
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export const Map: React.FC<MapProps> = React.memo(({ 
  tracks, 
  selectedTrackIds, 
  onPointHover, 
  hoverPoint, 
  onMapReady,
  elevationMode = 'elevation',
  bounds,
  showDirectionArrows = false,
  showDistanceMarkers = false,
  units = 'metric',
  onFileDrop
}) => {
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDraggingFile(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileDrop?.(e.dataTransfer.files);
    }
  };

  return (
    <div 
      className="relative w-full h-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <MapContainer
        center={[52.9651, 36.0785]} // Oryol, Russia
        zoom={12}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler />
        <RoutePreview />
        <POILayer />
        {tracks.map((track) => {
          if (track.hidden) return null;
          const isSelected = selectedTrackIds.includes(track.id);
          
          const positions = track.points.map(p => [p.lat, p.lng]) as L.LatLngExpression[];
          const trackColor = track.color || (isSelected ? "#ef4444" : "#94a3b8");

          if (isSelected && elevationMode === 'slope') {
            return (
              <React.Fragment key={track.id}>
                {/* Casing for slope mode */}
                <Polyline
                  positions={positions}
                  color="white"
                  weight={9}
                  opacity={0.8}
                />
                <SlopeColoredTrack track={track} />
                {showDirectionArrows && (
                  <DirectionArrows 
                    track={track} 
                    color={trackColor} 
                  />
                )}
                {showDistanceMarkers && (
                  <DistanceMarkers 
                    track={track} 
                    units={units}
                  />
                )}
              </React.Fragment>
            );
          }

          return (
            <React.Fragment key={track.id}>
              {/* Casing for better visibility */}
              <Polyline
                positions={positions}
                color="white"
                weight={isSelected ? 9 : 6}
                opacity={isSelected ? 0.8 : 0.4}
              />
              <Polyline
                positions={positions}
                color={trackColor}
                weight={isSelected ? 5 : 3}
                opacity={isSelected ? 1 : 0.6}
              />
              {showDirectionArrows && (
                <DirectionArrows 
                  track={track} 
                  color={trackColor} 
                />
              )}
              {showDistanceMarkers && (
                <DistanceMarkers 
                  track={track} 
                  units={units}
                />
              )}
            </React.Fragment>
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

      {isDraggingFile && (
        <div className="absolute inset-0 z-[2000] bg-blue-500/10 border-4 border-dashed border-blue-500/50 flex items-center justify-center backdrop-blur-[2px] pointer-events-none animate-in fade-in duration-200">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Plus size={32} className="text-blue-400" />
            </div>
            <div className="text-center">
              <h3 className="text-white font-bold text-lg">Drop GPX files here</h3>
              <p className="text-white/40 text-sm">Release to import your tracks</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
