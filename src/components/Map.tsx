import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { GPXTrack } from '../types';

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

export const Map: React.FC<MapProps> = ({ tracks, selectedTrackId, onPointHover, hoverPoint }) => {
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
        {tracks.map((track) => (
          <Polyline
            key={track.id}
            positions={track.points.map(p => [p.lat, p.lng])}
            color={track.id === selectedTrackId ? "#2563eb" : "#94a3b8"}
            weight={track.id === selectedTrackId ? 5 : 3}
            opacity={track.id === selectedTrackId ? 1 : 0.6}
            eventHandlers={{
              mouseover: () => {},
              mouseout: () => {}
            }}
          />
        ))}
        {hoverPoint && (
          <Marker position={[hoverPoint.lat, hoverPoint.lng]}>
            <Popup>
               Point Info
            </Popup>
          </Marker>
        )}
        <ChangeView bounds={bounds} />
      </MapContainer>
    </div>
  );
};
