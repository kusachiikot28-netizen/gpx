import React, { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react';
import { GPXPoint, POI } from '../types';
import { getRoute } from '../services/routingService';
import { getElevation } from '../services/elevationService';
import { toast } from 'sonner';
import { useTranslation } from './LanguageContext';

export type ActivityType = 'run' | 'road_bike' | 'gravel_bike' | 'mountain_bike' | 'motorcycle';

interface RoutingContextType {
  isEditMode: boolean;
  setIsEditMode: (active: boolean) => void;
  isRoutingEnabled: boolean;
  setIsRoutingEnabled: (enabled: boolean) => void;
  isMinimized: boolean;
  setIsMinimized: (minimized: boolean) => void;
  activity: ActivityType;
  setActivity: (activity: ActivityType) => void;
  waypoints: GPXPoint[];
  trackPoints: GPXPoint[];
  pois: POI[];
  addPOI: (poi: POI) => void;
  removePOI: (id: string) => void;
  clearPOIs: () => void;
  activePanel: string | null;
  setActivePanel: (panel: string | null) => void;
  onMapClick: ((lat: number, lng: number) => void) | null;
  setOnMapClick: (cb: ((lat: number, lng: number) => void) | null) => void;
  hasSelection: boolean;
  setHasSelection: (has: boolean) => void;
  addWaypoint: (point: GPXPoint) => Promise<void>;
  clearWaypoints: () => void;
  removeLastWaypoint: () => void;
  reverseWaypoints: () => Promise<void>;
  backToStart: () => Promise<void>;
  roundTrip: () => Promise<void>;
  isCalculating: boolean;
  setIsCalculating: (calculating: boolean) => void;
  loadSession: (waypoints: GPXPoint[], trackPoints: GPXPoint[], pois?: POI[]) => void;
}

const RoutingContext = createContext<RoutingContextType | undefined>(undefined);

export const RoutingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isRoutingEnabled, setIsRoutingEnabled] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activity, setActivity] = useState<ActivityType>('road_bike');
  const [waypoints, setWaypoints] = useState<GPXPoint[]>([]);
  const waypointsRef = useRef<GPXPoint[]>([]);
  const [trackPoints, setTrackPoints] = useState<GPXPoint[]>([]);
  const [pois, setPois] = useState<POI[]>([]);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [onMapClick, setOnMapClick] = useState<((lat: number, lng: number) => void) | null>(null);
  const [hasSelection, setHasSelection] = useState(false);
  const [isCalculating, setIsCalculatingState] = useState(false);
  const isCalculatingRef = useRef(false);

  const setIsCalculating = useCallback((val: boolean) => {
    isCalculatingRef.current = val;
    setIsCalculatingState(val);
  }, []);

  const { t } = useTranslation();

  const updateWaypoints = useCallback((newWaypoints: GPXPoint[]) => {
    waypointsRef.current = newWaypoints;
    setWaypoints(newWaypoints);
  }, []);

  const loadSession = useCallback((wps: GPXPoint[], tps: GPXPoint[], ps: POI[] = []) => {
    updateWaypoints(wps);
    setTrackPoints(tps);
    setPois(ps);
  }, [updateWaypoints]);

  const addPOI = useCallback((poi: POI) => {
    setPois(prev => [...prev, poi]);
  }, []);

  const removePOI = useCallback((id: string) => {
    setPois(prev => prev.filter(p => p.id !== id));
  }, []);

  const clearPOIs = useCallback(() => {
    setPois([]);
  }, []);

  const recalculateTrack = useCallback(async (points: GPXPoint[], routing: boolean, act: ActivityType) => {
    if (isCalculatingRef.current) return;
    if (points.length === 0) {
      setTrackPoints([]);
      return;
    }
    if (points.length === 1) {
      // Fetch elevation for single point
      setIsCalculating(true);
      try {
        const elevations = await getElevation([points[0]]);
        setTrackPoints([{ ...points[0], ele: elevations[0] || 0 }]);
      } catch (error) {
        setTrackPoints([points[0]]);
      } finally {
        setIsCalculating(false);
      }
      return;
    }

    setIsCalculating(true);
    try {
      let finalPoints: GPXPoint[];
      if (routing) {
        finalPoints = await getRoute(points, act);
      } else {
        finalPoints = points;
      }
      
      const elevations = await getElevation(finalPoints);
      const pointsWithEle = finalPoints.map((p, i) => ({
        ...p,
        ele: elevations[i] || 0
      }));
      
      setTrackPoints(pointsWithEle);
    } catch (error) {
      setTrackPoints(points);
    } finally {
      setIsCalculating(false);
    }
  }, [isCalculating, setIsCalculating]);

  const addWaypoint = useCallback(async (point: GPXPoint) => {
    if (isCalculatingRef.current) return;
    const currentWaypoints = waypointsRef.current;
    
    if (currentWaypoints.length === 0) {
      setIsCalculating(true);
      try {
        const elevations = await getElevation([point]);
        const pointWithEle = { ...point, ele: elevations[0] || 0 };
        updateWaypoints([pointWithEle]);
        setTrackPoints([pointWithEle]);
      } catch (error) {
        updateWaypoints([point]);
        setTrackPoints([point]);
      } finally {
        setIsCalculating(false);
      }
      return;
    }

    const lastWaypoint = currentWaypoints[currentWaypoints.length - 1];

    if (isRoutingEnabled) {
      setIsCalculating(true);
      try {
        const segment = await getRoute([lastWaypoint, point], activity);
        const elevations = await getElevation(segment);
        const segmentWithEle = segment.map((p, i) => ({
          ...p,
          ele: elevations[i] || 0
        }));
        
        const newWaypoint = segmentWithEle[segmentWithEle.length - 1];
        updateWaypoints([...currentWaypoints, newWaypoint]);
        setTrackPoints(prev => [...prev, ...segmentWithEle.slice(1)]);
      } catch (error) {
        console.error('Routing failed, falling back to straight line', error);
        toast.error(t('routingFailedFallback'));
        const elevations = await getElevation([point]);
        const pointWithEle = { ...point, ele: elevations[0] || 0 };
        updateWaypoints([...currentWaypoints, pointWithEle]);
        setTrackPoints(prev => [...prev, pointWithEle]);
      } finally {
        setIsCalculating(false);
      }
    } else {
      setIsCalculating(true);
      try {
        const elevations = await getElevation([point]);
        const pointWithEle = { ...point, ele: elevations[0] || 0 };
        updateWaypoints([...currentWaypoints, pointWithEle]);
        setTrackPoints(prev => [...prev, pointWithEle]);
      } catch (error) {
        updateWaypoints([...currentWaypoints, point]);
        setTrackPoints(prev => [...prev, point]);
      } finally {
        setIsCalculating(false);
      }
    }
  }, [isRoutingEnabled, activity, updateWaypoints, isCalculating, setIsCalculating, t]);

  const clearWaypoints = useCallback(() => {
    updateWaypoints([]);
    setTrackPoints([]);
  }, [updateWaypoints]);

  const removeLastWaypoint = useCallback(() => {
    const currentWaypoints = waypointsRef.current;
    if (currentWaypoints.length <= 1) {
      clearWaypoints();
      return;
    }
    
    const newWaypoints = currentWaypoints.slice(0, -1);
    updateWaypoints(newWaypoints);
    recalculateTrack(newWaypoints, isRoutingEnabled, activity);
  }, [isRoutingEnabled, activity, clearWaypoints, recalculateTrack, updateWaypoints]);

  const reverseWaypoints = useCallback(async () => {
    const reversed = [...waypointsRef.current].reverse();
    updateWaypoints(reversed);
    await recalculateTrack(reversed, isRoutingEnabled, activity);
  }, [isRoutingEnabled, activity, recalculateTrack, updateWaypoints]);

  const backToStart = useCallback(async () => {
    const currentWaypoints = waypointsRef.current;
    if (currentWaypoints.length === 0) return;
    const newWaypoints = [...currentWaypoints, currentWaypoints[0]];
    updateWaypoints(newWaypoints);
    await recalculateTrack(newWaypoints, isRoutingEnabled, activity);
  }, [isRoutingEnabled, activity, recalculateTrack, updateWaypoints]);

  const roundTrip = useCallback(async () => {
    const currentWaypoints = waypointsRef.current;
    if (currentWaypoints.length < 2) return;
    const reversed = [...currentWaypoints].reverse().slice(1);
    const newWaypoints = [...currentWaypoints, ...reversed];
    updateWaypoints(newWaypoints);
    await recalculateTrack(newWaypoints, isRoutingEnabled, activity);
  }, [isRoutingEnabled, activity, recalculateTrack, updateWaypoints]);

  const value = useMemo(() => ({
    isEditMode,
    setIsEditMode,
    isRoutingEnabled,
    setIsRoutingEnabled,
    isMinimized,
    setIsMinimized,
    activity,
    setActivity,
    waypoints,
    trackPoints,
    pois,
    addPOI,
    removePOI,
    clearPOIs,
    activePanel,
    setActivePanel,
    onMapClick,
    setOnMapClick,
    hasSelection,
    setHasSelection,
    addWaypoint,
    clearWaypoints,
    removeLastWaypoint,
    reverseWaypoints,
    backToStart,
    roundTrip,
    isCalculating,
    setIsCalculating,
    loadSession
  }), [
    isEditMode, isRoutingEnabled, isMinimized, activity, waypoints, trackPoints, pois, 
    activePanel, onMapClick, hasSelection, addWaypoint, clearWaypoints, removeLastWaypoint, 
    reverseWaypoints, backToStart, roundTrip, isCalculating, setIsCalculating, loadSession
  ]);

  return (
    <RoutingContext.Provider value={value}>
      {children}
    </RoutingContext.Provider>
  );
};

export const useRouting = () => {
  const context = useContext(RoutingContext);
  if (context === undefined) {
    throw new Error('useRouting must be used within a RoutingProvider');
  }
  return context;
};
