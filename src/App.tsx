/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import GpxParser from 'gpxparser';
import { Upload } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Map } from './components/Map';
import { ElevationProfile } from './components/ElevationProfile';
import { GPXTrack, GPXPoint } from './types';

export default function App() {
  const [tracks, setTracks] = useState<GPXTrack[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [hoverPoint, setHoverPoint] = useState<{ lat: number; lng: number } | null>(null);

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const gpxText = event.target?.result as string;
      const gpx = new GpxParser();
      gpx.parse(gpxText);

      const newTracks: GPXTrack[] = gpx.tracks.map((track, index) => {
        const points: GPXPoint[] = track.points.map(p => ({
          lat: p.lat,
          lng: p.lon,
          ele: p.ele,
          time: p.time
        }));

        return {
          id: `${Date.now()}-${index}`,
          name: track.name || file.name.replace('.gpx', ''),
          points,
          distance: track.distance.total,
          elevationGain: track.elevation.pos || 0,
          elevationLoss: track.elevation.neg || 0
        };
      });

      setTracks(prev => [...prev, ...newTracks]);
      if (newTracks.length > 0) {
        setSelectedTrackId(newTracks[0].id);
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setTracks(prev => prev.filter(t => t.id !== id));
    if (selectedTrackId === id) {
      setSelectedTrackId(null);
    }
  }, [selectedTrackId]);

  const handleDownload = useCallback((id: string) => {
    const track = tracks.find(t => t.id === id);
    if (!track) return;

    // Simple GPX generation
    const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="GPX Studio Clone" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>${track.name}</name>
    <trkseg>
      ${track.points.map(p => `
      <trkpt lat="${p.lat}" lon="${p.lng}">
        ${p.ele ? `<ele>${p.ele}</ele>` : ''}
        ${p.time ? `<time>${p.time.toISOString()}</time>` : ''}
      </trkpt>`).join('')}
    </trkseg>
  </trk>
</gpx>`;

    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${track.name}.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [tracks]);

  const selectedTrack = tracks.find(t => t.id === selectedTrackId) || null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100">
      <Sidebar 
        tracks={tracks}
        selectedTrackId={selectedTrackId}
        onSelectTrack={setSelectedTrackId}
        onUpload={handleUpload}
        onDelete={handleDelete}
        onDownload={handleDownload}
      />
      
      <main className="flex-1 flex flex-col relative">
        <div className="flex-1 relative">
          {tracks.length === 0 ? (
            <div className="absolute inset-0 z-[1001] flex items-center justify-center bg-white/80 backdrop-blur-sm">
              <div className="max-w-md text-center p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Welcome to GPX Studio</h2>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  Upload a GPX file to view your route, elevation profile, and track statistics. 
                  You can edit and export your tracks directly from here.
                </p>
                <label className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors font-medium">
                  <Upload size={18} />
                  <span>Get Started</span>
                  <input type="file" accept=".gpx" className="hidden" onChange={handleUpload} />
                </label>
              </div>
            </div>
          ) : null}
          <Map 
            tracks={tracks}
            selectedTrackId={selectedTrackId}
            hoverPoint={hoverPoint}
          />
          
          {/* Overlay info */}
          {selectedTrack && (
            <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-200 pointer-events-none">
              <h2 className="text-sm font-bold text-slate-800 mb-2">{selectedTrack.name}</h2>
              <div className="flex gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Distance</span>
                  <span className="text-lg font-mono text-blue-600">{(selectedTrack.distance / 1000).toFixed(2)} km</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Elevation Gain</span>
                  <span className="text-lg font-mono text-emerald-600">+{selectedTrack.elevationGain.toFixed(0)} m</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <ElevationProfile 
          track={selectedTrack}
          onHover={setHoverPoint}
        />
      </main>
    </div>
  );
}
