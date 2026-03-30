/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import GpxParser from 'gpxparser';
import { Map } from './components/Map';
import { ElevationProfile } from './components/ElevationProfile';
import { TopNav } from './components/TopNav';
import { LeftToolbar } from './components/LeftToolbar';
import { RightToolbar } from './components/RightToolbar';
import { StatsPanel } from './components/StatsPanel';
import { TrackTabs } from './components/TrackTabs';
import { FileTreePanel } from './components/FileTreePanel';
import { LanguageProvider, useTranslation } from './contexts/LanguageContext';
import { RoutingProvider, useRouting } from './contexts/RoutingContext';
import { GPXTrack, GPXPoint } from './types';
import L from 'leaflet';
import { calculateTrackStats } from './utils/slope';
import JSZip from 'jszip';
import { toast, Toaster } from 'sonner';
import { TRACK_COLORS } from './constants';
import { AnimatePresence, motion } from 'motion/react';
import { Link, X, Download } from 'lucide-react';

import { useHistory } from './hooks/useHistory';

const EMPTY_WAYPOINTS: GPXPoint[] = [];

export default function App() {
  return (
    <LanguageProvider>
      <RoutingProvider>
        <AppContent />
        <Toaster position="top-center" theme="dark" />
      </RoutingProvider>
    </LanguageProvider>
  );
}

function AppContent() {
  const { 
    state: tracks, 
    set: setTracks, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useHistory<GPXTrack[]>([]);
  
  const { 
    trackPoints, waypoints, pois, 
    clearWaypoints, clearPOIs, loadSession, 
    setHasSelection, isEditMode, setIsEditMode, setActivePanel
  } = useRouting();
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [hoverPoint, setHoverPoint] = useState<{ lat: number; lng: number } | null>(null);
  
  const throttledSetHoverPoint = useMemo(() => {
    let lastCall = 0;
    return (point: { lat: number; lng: number } | null) => {
      const now = Date.now();
      if (!point || now - lastCall > 32) { // ~30fps for hover updates
        setHoverPoint(point);
        lastCall = now;
      }
    };
  }, []);

  const [showElevation, setShowElevation] = useState(true);
  const [showFileTree, setShowFileTree] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [showDirectionArrows, setShowDirectionArrows] = useState(false);
  const [showDistanceMarkers, setShowDistanceMarkers] = useState(false);
  const [elevationMode, setElevationMode] = useState<'elevation' | 'slope'>('elevation');
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [mapBounds, setMapBounds] = useState<L.LatLngBoundsExpression | null>(null);

  const lastSyncRef = useRef<{ points: GPXPoint[], waypoints: GPXPoint[], pois: any[] } | null>(null);
  const isSyncingFromHistoryRef = useRef(false);

  // Sync hasSelection
  useEffect(() => {
    setHasSelection(selectedTrackIds.length > 0);
  }, [selectedTrackIds.length, setHasSelection]);

  const { t } = useTranslation();

  // Counter for new tracks to ensure color cycling continues across re-renders
  const [newTracksAdded, setNewTracksAdded] = useState(0);

  // Initialize color counter based on existing tracks when component mounts
  useEffect(() => {
    if (tracks.length > 0 && newTracksAdded === 0) {
      setNewTracksAdded(tracks.length);
    }
  }, [tracks.length, newTracksAdded]);

  const handleSaveRoute = useCallback(() => {
    if (trackPoints.length === 0 && waypoints.length === 0) {
      toast.error(t('noRouteToSave'));
      return;
    }

    const newId = `new-${Date.now()}`;
    setTracks(prev => {
      const newTrack: GPXTrack = {
        id: newId,
        name: `New file ${prev.length + 1}`,
        points: [...trackPoints],
        waypoints: [...waypoints],
        poi: [...pois],
        distance: 0,
        elevationGain: 0,
        elevationLoss: 0,
        hidden: false,
        color: TRACK_COLORS[(newTracksAdded) % TRACK_COLORS.length],
        ...calculateTrackStats(trackPoints)
      };
      return [...prev, newTrack];
    });
    setSelectedTrackIds([newId]);
    setNewTracksAdded(prev => prev + 1);
    lastSyncRef.current = { points: trackPoints, waypoints: waypoints, pois: pois };
    isSyncingFromHistoryRef.current = false;
    setShowElevation(true);
    toast.success(t('newTrackCreated'));
  }, [setTracks, trackPoints, waypoints, pois, t, newTracksAdded]);

  const handleNewTrack = useCallback(() => {
    setIsEditMode(false);
    
    const emptyPoints: GPXPoint[] = [];
    const emptyWaypoints: GPXPoint[] = [];
    const emptyPois: any[] = [];
    
    // Atomically load empty session to clear routing context
    loadSession(emptyWaypoints, emptyPoints, emptyPois);
    
    // Set expected sync state to empty immediately with the same references
    lastSyncRef.current = { points: emptyPoints, waypoints: emptyWaypoints, pois: emptyPois };
    isSyncingFromHistoryRef.current = false;
    
    setHoverPoint(null);
    setShowElevation(true);

    const newId = `new-${Date.now()}`;
    setTracks(prev => {
      const newTrack: GPXTrack = {
        id: newId,
        name: `New file ${prev.length + 1}`,
        points: emptyPoints,
        waypoints: emptyWaypoints,
        poi: emptyPois,
        distance: 0,
        elevationGain: 0,
        elevationLoss: 0,
        hidden: false,
        color: TRACK_COLORS[(newTracksAdded) % TRACK_COLORS.length],
      };
      return [...prev, newTrack];
    });
    setSelectedTrackIds([newId]);
    setNewTracksAdded(prev => prev + 1);

    // Small delay to ensure state has cleared before re-enabling edit mode
    setTimeout(() => {
      setIsEditMode(true);
      toast.success(t('newTrackStarted'));
    }, 50);
  }, [loadSession, setIsEditMode, t, setTracks, newTracksAdded]);

  // Auto-create track if points are added without selection in edit mode
  useEffect(() => {
    if (selectedTrackIds.length === 0 && (trackPoints.length > 0 || waypoints.length > 0) && isEditMode) {
      handleSaveRoute();
    }
  }, [selectedTrackIds.length, trackPoints.length, waypoints.length, isEditMode, handleSaveRoute]);

  // Sync RoutingContext with selected track (e.g. on selection change or undo/redo)
  useEffect(() => {
    if (selectedTrackIds.length === 1) {
      const track = tracks.find(t => t.id === selectedTrackIds[0]);
      if (track) {
        const trackWps = track.waypoints || EMPTY_WAYPOINTS;
        const trackPois = track.poi || [];
        // If the track in 'tracks' state is different from what we last synced
        if (track.points !== lastSyncRef.current?.points || trackWps !== lastSyncRef.current?.waypoints || trackPois !== lastSyncRef.current?.pois) {
          isSyncingFromHistoryRef.current = true;
          loadSession(trackWps, track.points, trackPois);
          lastSyncRef.current = { points: track.points, waypoints: trackWps, pois: trackPois };
        }
      }
    } else if (selectedTrackIds.length === 0) {
      // If no track is selected, we should clear the routing context
      // unless we are in the middle of creating a new track from routing
      if (trackPoints.length > 0 || waypoints.length > 0 || pois.length > 0) {
        // Only clear if we are NOT in edit mode OR if the current points match the last synced track
        // (which means they were part of a track that is no longer selected)
        const isStale = lastSyncRef.current !== null;
        if (!isEditMode || isStale) {
          clearWaypoints();
          clearPOIs();
          lastSyncRef.current = null;
        }
      }
    }
  }, [selectedTrackIds, tracks, loadSession, clearWaypoints, clearPOIs, trackPoints.length, waypoints.length, pois.length, isEditMode]);

  // Sync RoutingContext back to tracks state (e.g. when user adds waypoints or POIs)
  useEffect(() => {
    if (selectedTrackIds.length === 1 && isEditMode) {
      const trackId = selectedTrackIds[0];
      
      // If the RoutingContext state is different from what we last synced
      if (trackPoints !== lastSyncRef.current?.points || waypoints !== lastSyncRef.current?.waypoints || pois !== lastSyncRef.current?.pois) {
        
        // If this change was triggered by history navigation or loadSession, skip syncing back
        // We clear the flag if the state matches what we last synced from history
        if (isSyncingFromHistoryRef.current) {
          const isFullySynced = 
            trackPoints === lastSyncRef.current?.points && 
            waypoints === lastSyncRef.current?.waypoints && 
            pois === lastSyncRef.current?.pois;
          
          if (isFullySynced) {
            isSyncingFromHistoryRef.current = false;
          } else {
            // If not fully synced yet, we wait for the next render
            // But we add a safety timeout to prevent getting stuck
            const timeout = setTimeout(() => {
              isSyncingFromHistoryRef.current = false;
            }, 100);
            return () => clearTimeout(timeout);
          }
          return;
        }

        setTracks(prev => {
          const currentTrack = prev.find(t => t.id === trackId);
          if (!currentTrack) return prev;
          
          const stats = calculateTrackStats(trackPoints);
          return prev.map(t => {
            if (t.id === trackId) {
              return {
                ...t,
                points: trackPoints,
                waypoints: waypoints,
                poi: pois,
                ...stats
              };
            }
            return t;
          });
        });
        lastSyncRef.current = { points: trackPoints, waypoints: waypoints, pois: pois };
      }
    }
  }, [trackPoints, waypoints, pois, selectedTrackIds, setTracks, isEditMode]);

  const allTracks = tracks;

  const processGPXContent = useCallback((content: string, fileName: string) => {
    try {
      const parser = new GpxParser();
      parser.parse(content);
      
      if (!parser.tracks || parser.tracks.length === 0) {
        toast.error(t('invalidFormat'));
        return null;
      }
      
      let colorIdx = newTracksAdded;
      const parsedTracks: GPXTrack[] = parser.tracks.map(t => {
        const trackColor = TRACK_COLORS[colorIdx % TRACK_COLORS.length];
        colorIdx++;
        return {
          id: `upload-${Date.now()}-${Math.random()}`,
          name: t.name || fileName,
          points: t.points.map(p => ({
            lat: p.lat,
            lng: p.lon,
            ele: p.ele || 0,
            time: p.time ? new Date(p.time) : new Date()
          })),
          waypoints: t.points.length > 0 ? [
            { ...t.points[0], lat: t.points[0].lat, lng: t.points[0].lon },
            { ...t.points[t.points.length - 1], lat: t.points[t.points.length - 1].lat, lng: t.points[t.points.length - 1].lon }
          ] : [],
          poi: parser.waypoints.map(w => ({
            id: Math.random().toString(36).substr(2, 9),
            name: w.name || 'POI',
            description: w.desc || '',
            lat: w.lat,
            lng: w.lon,
            icon: 'MapPin',
            link: ''
          })),
          distance: t.distance.total,
          elevationGain: t.elevation.pos || 0,
          elevationLoss: t.elevation.neg || 0,
          hidden: false,
          color: trackColor
        };
      });

      if (parsedTracks.length > 0) {
        setTracks(prev => [...prev, ...parsedTracks]);
        setSelectedTrackIds([parsedTracks[0].id]);
        setNewTracksAdded(colorIdx);
        setShowElevation(true);
        return parsedTracks;
      }
      return null;
    } catch (err) {
      console.error('GPX parse error:', err);
      toast.error(t('invalidFormat'));
      return null;
    }
  }, [setTracks, newTracksAdded, t]);

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = processGPXContent(content, file.name);
      if (result) {
        toast.success(t('importSuccess'));
      }
      e.target.value = '';
    };
    reader.onerror = () => toast.error(t('importError'));
    reader.readAsText(file);
  }, [processGPXContent, t]);

  const handleUrlImport = useCallback(async () => {
    if (!importUrl) return;
    setIsImporting(true);
    try {
      const response = await fetch(importUrl);
      if (!response.ok) throw new Error('Fetch failed');
      const content = await response.text();
      const fileName = importUrl.split('/').pop() || 'imported.gpx';
      const result = processGPXContent(content, fileName);
      if (result) {
        toast.success(t('importSuccess'));
        setShowUrlModal(false);
        setImportUrl('');
      }
    } catch (err) {
      console.error('URL import error:', err);
      toast.error(t('fetchError'));
    } finally {
      setIsImporting(false);
    }
  }, [importUrl, processGPXContent, t]);

  const handleFileDrop = useCallback((files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.name.toLowerCase().endsWith('.gpx')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const result = processGPXContent(content, file.name);
          if (result) {
            toast.success(t('importSuccess'));
          }
        };
        reader.onerror = () => toast.error(t('importError'));
        reader.readAsText(file);
      } else {
        toast.error(`${file.name}: ${t('invalidFormat')}`);
      }
    });
  }, [processGPXContent, t]);

  const handleDelete = useCallback((id: string) => {
    const isSelected = selectedTrackIds.includes(id);
    const isLastSelected = isSelected && selectedTrackIds.length === 1;

    setTracks(prev => prev.filter(t => t.id !== id));
    setSelectedTrackIds(prev => prev.filter(tid => tid !== id));

    if (isLastSelected) {
      clearWaypoints();
      clearPOIs();
      lastSyncRef.current = null;
    }
  }, [setTracks, selectedTrackIds, clearWaypoints, clearPOIs]);

  const handleDeleteSelected = useCallback(() => {
    const idsToDelete = new Set(selectedTrackIds);
    setTracks(prev => prev.filter(t => !idsToDelete.has(t.id)));
    setSelectedTrackIds([]);
    clearWaypoints();
    clearPOIs();
    lastSyncRef.current = null;
  }, [selectedTrackIds, setTracks, clearWaypoints, clearPOIs]);

  const generateGPX = (track: GPXTrack) => {
    const waypointsXML = (track.poi || []).map(p => `
  <wpt lat="${p.lat}" lon="${p.lng}">
    <name>${p.name}</name>
    ${p.description ? `<desc>${p.description}</desc>` : ''}
    ${p.link ? `<link href="${p.link}" />` : ''}
  </wpt>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="GPX Studio Clone" xmlns="http://www.topografix.com/GPX/1/1">
  ${waypointsXML}
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
  };

  const handleDownload = useCallback((id: string) => {
    const track = tracks.find(t => t.id === id);
    if (!track) return;

    const gpxContent = generateGPX(track);
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

  const handleExportSelected = useCallback(() => {
    if (selectedTrackIds.length === 1) {
      handleDownload(selectedTrackIds[0]);
    } else if (selectedTrackIds.length > 1) {
      // Export multiple as ZIP
      const zip = new JSZip();
      selectedTrackIds.forEach(id => {
        const track = tracks.find(t => t.id === id);
        if (track) {
          zip.file(`${track.name}.gpx`, generateGPX(track));
        }
      });
      zip.generateAsync({ type: "blob" }).then(content => {
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = "selected_tracks.zip";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }
  }, [selectedTrackIds, tracks, handleDownload]);

  const handleExportAll = useCallback(() => {
    const zip = new JSZip();
    allTracks.forEach(track => {
      zip.file(`${track.name}.gpx`, generateGPX(track));
    });
    zip.generateAsync({ type: "blob" }).then(content => {
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = "all_tracks.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }, [allTracks]);

  const handleHideSelected = useCallback(() => {
    setTracks(prev => prev.map(t => selectedTrackIds.includes(t.id) ? { ...t, hidden: true } : t));
  }, [selectedTrackIds, setTracks]);

  const handleUnhideSelected = useCallback(() => {
    setTracks(prev => prev.map(t => selectedTrackIds.includes(t.id) ? { ...t, hidden: false } : t));
  }, [selectedTrackIds, setTracks]);

  const handleSelectAll = useCallback(() => {
    setSelectedTrackIds(allTracks.map(t => t.id));
  }, [allTracks]);

  const handleCenter = useCallback(() => {
    const visibleTracks = allTracks.filter(t => !t.hidden);
    if (visibleTracks.length > 0) {
      const allPoints = visibleTracks.flatMap(t => t.points);
      if (allPoints.length > 0) {
        const latLngs = allPoints.map(p => [p.lat, p.lng] as [number, number]);
        setMapBounds(L.latLngBounds(latLngs));
      }
    }
  }, [allTracks]);

  const selectedTrack = useMemo(() => {
    if (selectedTrackIds.length === 0) return null;
    const lastId = selectedTrackIds[selectedTrackIds.length - 1];
    return tracks.find(t => t.id === lastId) || null;
  }, [selectedTrackIds, tracks]);

  const isSelectedHidden = useMemo(() => {
    if (selectedTrackIds.length === 0) return false;
    return selectedTrackIds.every(id => {
      const t = allTracks.find(track => track.id === id);
      return t?.hidden;
    });
  }, [selectedTrackIds, allTracks]);

  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDuplicate = useCallback(() => {
    if (selectedTrackIds.length === 0) return;
    
    const newTracks: GPXTrack[] = [];
    let colorIdx = newTracksAdded;
    selectedTrackIds.forEach(id => {
      const track = allTracks.find(t => t.id === id);
      if (track) {
        newTracks.push({
          ...track,
          id: `copy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: `${track.name} (Copy)`,
          color: TRACK_COLORS[colorIdx % TRACK_COLORS.length]
        });
        colorIdx++;
      }
    });

    if (newTracks.length > 0) {
      setTracks(prev => [...prev, ...newTracks]);
      setSelectedTrackIds(newTracks.map(t => t.id));
      setNewTracksAdded(colorIdx);
      setShowElevation(true);
      toast.success(t('duplicateSuccess') || 'Tracks duplicated');
    }
  }, [selectedTrackIds, allTracks, setTracks, t, newTracksAdded]);

  const handleDeleteAll = useCallback(() => {
    setTracks([]);
    setSelectedTrackIds([]);
    clearWaypoints();
    clearPOIs();
    lastSyncRef.current = null;
  }, [setTracks, clearWaypoints, clearPOIs]);

  const handleZoomIn = useCallback(() => {
    if (mapInstance) mapInstance.zoomIn();
  }, [mapInstance]);

  const handleZoomOut = useCallback(() => {
    if (mapInstance) mapInstance.zoomOut();
  }, [mapInstance]);

  // Invalidate map size when sidebar toggles
  useEffect(() => {
    if (mapInstance) {
      setTimeout(() => {
        mapInstance.invalidateSize();
      }, 200); // Wait for transition
    }
  }, [mapInstance, showFileTree, showElevation]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
          case '+':
          case '=':
            e.preventDefault();
            handleNewTrack();
            break;
          case 'o':
            e.preventDefault();
            fileInputRef.current?.click();
            break;
          case 's':
            e.preventDefault();
            handleExportSelected();
            break;
          case 'd':
            e.preventDefault();
            handleDuplicate();
            break;
          case 'backspace':
            e.preventDefault();
            if (e.shiftKey) {
              handleDeleteAll();
            } else {
              handleDeleteSelected();
            }
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 'a':
            e.preventDefault();
            handleSelectAll();
            break;
          case 'enter':
            e.preventDefault();
            handleCenter();
            break;
          case 'h':
            e.preventDefault();
            if (isSelectedHidden) handleUnhideSelected();
            else handleHideSelected();
            break;
          case 't':
            e.preventDefault();
            setShowFileTree(prev => !prev);
            break;
        }
      } else {
        // Non-Ctrl shortcuts
        switch (e.key) {
          case 'F3':
            e.preventDefault();
            setShowDistanceMarkers(prev => !prev);
            break;
          case 'F4':
            e.preventDefault();
            setShowDirectionArrows(prev => !prev);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDeleteAll, handleDeleteSelected, handleExportSelected, handleSelectAll, handleCenter, handleHideSelected, handleUnhideSelected, isSelectedHidden, undo, redo]);

  const handleAddTrack = useCallback((track: GPXTrack) => {
    setTracks(prev => [...prev, track]);
    setSelectedTrackIds([track.id]);
  }, [setTracks]);

  const handleSelect = useCallback((id: string) => {
    setSelectedTrackIds([id]);
  }, []);

  const handleToggleVisibility = useCallback((id: string) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, hidden: !t.hidden } : t));
  }, [setTracks]);

  const handleUpdateTrack = useCallback((id: string, updates: Partial<GPXTrack>) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, [setTracks]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100">
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleUpload}
        accept=".gpx"
        className="hidden"
      />
      <div className="flex-1 relative flex flex-col min-w-0">
        <TopNav 
          onNew={handleNewTrack}
          onUpload={() => fileInputRef.current?.click()}
          onUrlImport={() => setShowUrlModal(true)}
          onDuplicate={handleDuplicate}
          onDeleteAll={handleDeleteAll}
          onExportAll={handleExportAll}
          onToggleElevation={() => setShowElevation(!showElevation)}
          showElevation={showElevation}
          onToggleFileTree={() => setShowFileTree(!showFileTree)}
          showFileTree={showFileTree}
          onToggleDirectionArrows={() => setShowDirectionArrows(!showDirectionArrows)}
          showDirectionArrows={showDirectionArrows}
          onToggleDistanceMarkers={() => setShowDistanceMarkers(!showDistanceMarkers)}
          showDistanceMarkers={showDistanceMarkers}
          elevationMode={elevationMode}
          onSetElevationMode={setElevationMode}
          units={units}
          onToggleUnits={() => setUnits(units === 'metric' ? 'imperial' : 'metric')}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          onDeleteSelected={handleDeleteSelected}
          onExportSelected={handleExportSelected}
          onHideSelected={handleHideSelected}
          onUnhideSelected={handleUnhideSelected}
          onSelectAll={handleSelectAll}
          onCenter={handleCenter}
          isSelectedHidden={isSelectedHidden}
          hasSelection={selectedTrackIds.length > 0}
        />
        <LeftToolbar 
          onUpload={() => fileInputRef.current?.click()} 
          onAddTrack={handleAddTrack}
          onNew={handleNewTrack}
          onSaveRoute={handleSaveRoute}
          selectedTrack={selectedTrack}
          onUpdateTrack={handleUpdateTrack}
        />
        <RightToolbar 
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />
        
        <main className="flex-1 relative flex flex-col">
          <div className="flex-1 relative">
            <TrackTabs 
              tracks={allTracks}
              selectedTrackIds={selectedTrackIds}
              onSelect={handleSelect}
              onDelete={handleDelete}
            />
            
            <Map 
              tracks={allTracks}
              selectedTrackIds={selectedTrackIds}
              hoverPoint={hoverPoint}
              onMapReady={setMapInstance}
              elevationMode={elevationMode}
              bounds={mapBounds}
              showDirectionArrows={showDirectionArrows}
              showDistanceMarkers={showDistanceMarkers}
              units={units}
              onFileDrop={handleFileDrop}
            />
          </div>
          
          {selectedTrack && showElevation && (
            <div className="relative z-[1000] flex flex-col sm:flex-row bg-black border-t border-white/10 h-auto sm:h-56">
              <div className="w-full sm:w-56 shrink-0">
                <StatsPanel 
                  track={selectedTrack} 
                  onToggleElevation={() => setShowElevation(!showElevation)}
                  isMetric={units === 'metric'}
                  elevationMode={elevationMode}
                  onSetElevationMode={setElevationMode}
                />
              </div>
              <div className="flex-1 min-w-0 h-40 sm:h-full">
                <ElevationProfile 
                  track={selectedTrack}
                  onHover={throttledSetHoverPoint}
                  units={units}
                  mode={elevationMode}
                  onToggleMode={() => setElevationMode(prev => prev === 'elevation' ? 'slope' : 'elevation')}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {showFileTree && (
        <FileTreePanel 
          tracks={allTracks}
          selectedTrackIds={selectedTrackIds}
          onSelect={handleSelect}
          onDelete={handleDelete}
          onToggleVisibility={handleToggleVisibility}
          onDownload={handleDownload}
          onNew={handleNewTrack}
        />
      )}

      {/* URL Import Modal */}
      <AnimatePresence>
        {showUrlModal && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Link size={18} className="text-blue-400" />
                  {t('importUrlTitle')}
                </h3>
                <button onClick={() => setShowUrlModal(false)} className="text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-white/40 uppercase font-bold tracking-wider">{t('url')}</label>
                  <input 
                    autoFocus
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlImport()}
                    placeholder={t('importUrlPlaceholder')}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setShowUrlModal(false)}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button 
                    onClick={handleUrlImport}
                    disabled={!importUrl || isImporting}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 rounded-lg text-sm font-medium text-white transition-colors flex items-center justify-center gap-2"
                  >
                    {isImporting ? (
                      <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" 
                      />
                    ) : (
                      <Download size={16} />
                    )}
                    {t('importUrlButton')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
