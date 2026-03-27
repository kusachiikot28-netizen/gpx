/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import GpxParser from 'gpxparser';
import { Upload } from 'lucide-react';
import { Map } from './components/Map';
import { ElevationProfile } from './components/ElevationProfile';
import { TopNav } from './components/TopNav';
import { LeftToolbar } from './components/LeftToolbar';
import { RightToolbar } from './components/RightToolbar';
import { StatsPanel } from './components/StatsPanel';
import { TrackTabs } from './components/TrackTabs';
import { GPXTrack, GPXPoint } from './types';

export default function App() {
  const [tracks, setTracks] = useState<GPXTrack[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [hoverPoint, setHoverPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [showElevation, setShowElevation] = useState(false);

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

  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');

  const handleDeleteAll = useCallback(() => {
    setTracks([]);
    setSelectedTrackId(null);
  }, []);

  const handleExportAll = useCallback(() => {
    if (tracks.length === 0) return;
    
    // Simple multi-track GPX generation
    const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="GPX Studio Clone" xmlns="http://www.topografix.com/GPX/1/1">
  ${tracks.map(track => `
  <trk>
    <name>${track.name}</name>
    <trkseg>
      ${track.points.map(p => `
      <trkpt lat="${p.lat}" lon="${p.lng}">
        ${p.ele ? `<ele>${p.ele}</ele>` : ''}
        ${p.time ? `<time>${p.time.toISOString()}</time>` : ''}
      </trkpt>`).join('')}
    </trkseg>
  </trk>`).join('')}
</gpx>`;

    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all_tracks.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [tracks]);

  // Hidden file input ref for TopNav "Open" action
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'o':
            e.preventDefault();
            fileInputRef.current?.click();
            break;
          case 'p':
            e.preventDefault();
            setShowElevation(prev => !prev);
            break;
          case 'l':
            e.preventDefault();
            // Track list is now always visible as tabs
            break;
          case 'backspace':
            e.preventDefault();
            if (e.shiftKey) {
              handleDeleteAll();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDeleteAll]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-100">
      <input 
        type="file" 
        accept=".gpx" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleUpload} 
      />
      <TopNav 
        onUpload={() => fileInputRef.current?.click()}
        onDeleteAll={handleDeleteAll}
        onExportAll={handleExportAll}
        onToggleElevation={() => setShowElevation(!showElevation)}
        showElevation={showElevation}
        units={units}
        onToggleUnits={() => setUnits(units === 'metric' ? 'imperial' : 'metric')}
      />
      <LeftToolbar 
        onUpload={handleUpload} 
      />
      <RightToolbar />
      
      <main className="absolute inset-0 flex flex-col">
        <div className="flex-1 relative">
          <TrackTabs 
            tracks={tracks}
            selectedTrackId={selectedTrackId}
            onSelect={setSelectedTrackId}
            onDelete={handleDelete}
          />
          {tracks.length === 0 && (
            <div className="absolute inset-0 z-[1001] flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
              <div className="max-w-md text-center p-8 bg-[#1a1a1a] text-white rounded-2xl shadow-2xl border border-white/10">
                <div className="w-16 h-16 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-4">GPX Studio</h2>
                <p className="text-slate-400 mb-8 leading-relaxed">
                  The online GPX file editor and viewer.
                </p>
                <label className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors font-medium">
                  <Upload size={18} />
                  <span>Open GPX</span>
                  <input type="file" accept=".gpx" className="hidden" onChange={handleUpload} />
                </label>
              </div>
            </div>
          )}
          
          <Map 
            tracks={tracks}
            selectedTrackId={selectedTrackId}
            hoverPoint={hoverPoint}
          />
        </div>
        
        {selectedTrack && (
          <div className="relative z-[1000]">
            <StatsPanel 
              track={selectedTrack} 
              onToggleElevation={() => setShowElevation(!showElevation)}
            />
            {showElevation && (
              <div className="absolute bottom-full left-0 right-0 bg-white shadow-2xl">
                <ElevationProfile 
                  track={selectedTrack}
                  onHover={setHoverPoint}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
