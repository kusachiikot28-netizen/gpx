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
  updateWaypoint: (index: number, point: GPXPoint) => Promise<void>;
  insertWaypoint: (index: number, point: GPXPoint) => Promise<void>;
  removeWaypoint: (index: number) => Promise<void>;
  clearWaypoints: () => void;
  removeLastWaypoint: () => void;
  reverseWaypoints: () => Promise<void>;
  backToStart: () => Promise<void>;
  roundTrip: () => Promise<void>;
  isCalculating: boolean;
  setIsCalculating: (calculating: boolean) => void;
  selectedWaypointIndex: number | null;
  setSelectedWaypointIndex: (index: number | null) => void;
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
  const [selectedWaypointIndex, setSelectedWaypointIndex] = useState<number | null>(null);
  const isCalculatingRef = useRef(false);
  const lastOperationIdRef = useRef(0);

  const setIsCalculating = useCallback((val: boolean, opId?: number) => {
    if (opId !== undefined && opId !== lastOperationIdRef.current) return;
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
    const opId = ++lastOperationIdRef.current;

    if (points.length === 0) {
      setTrackPoints([]);
      return;
    }
    if (points.length === 1) {
      // Fetch elevation for single point
      setIsCalculating(true);
      try {
        const elevations = await getElevation([points[0]]);
        if (opId !== lastOperationIdRef.current) return;
        setTrackPoints([{ ...points[0], ele: elevations[0] || 0 }]);
      } catch (error) {
        if (opId !== lastOperationIdRef.current) return;
        setTrackPoints([points[0]]);
      } finally {
        if (opId === lastOperationIdRef.current) {
          setIsCalculating(false);
        }
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
      
      if (opId !== lastOperationIdRef.current) return;

      const elevations = await getElevation(finalPoints);
      if (opId !== lastOperationIdRef.current) return;

      const pointsWithEle = finalPoints.map((p, i) => ({
        ...p,
        ele: elevations[i] || 0
      }));
      
      setTrackPoints(pointsWithEle);
    } catch (error) {
      if (opId !== lastOperationIdRef.current) return;
      setTrackPoints(points);
    } finally {
      setIsCalculating(false, opId);
    }
  }, [setIsCalculating]);

  const addWaypoint = useCallback(async (point: GPXPoint) => {
    if (isCalculatingRef.current) return;
    const opId = ++lastOperationIdRef.current;
    const currentWaypoints = waypointsRef.current;
    
    if (currentWaypoints.length === 0) {
      setIsCalculating(true);
      try {
        const elevations = await getElevation([point]);
        if (opId !== lastOperationIdRef.current) return;
        const pointWithEle = { ...point, ele: elevations[0] || 0 };
        updateWaypoints([pointWithEle]);
        setTrackPoints([pointWithEle]);
      } catch (error) {
        if (opId !== lastOperationIdRef.current) return;
        updateWaypoints([point]);
        setTrackPoints([point]);
      } finally {
        setIsCalculating(false, opId);
      }
      return;
    }

    const lastWaypoint = currentWaypoints[currentWaypoints.length - 1];

    if (isRoutingEnabled) {
      setIsCalculating(true);
      try {
        const segment = await getRoute([lastWaypoint, point], activity);
        if (opId !== lastOperationIdRef.current) return;
        const elevations = await getElevation(segment);
        if (opId !== lastOperationIdRef.current) return;
        const segmentWithEle = segment.map((p, i) => ({
          ...p,
          ele: elevations[i] || 0
        }));
        
        const newWaypoint = segmentWithEle[segmentWithEle.length - 1];
        updateWaypoints([...currentWaypoints, newWaypoint]);
        setTrackPoints(prev => [...prev, ...segmentWithEle.slice(1)]);
      } catch (error) {
        if (opId !== lastOperationIdRef.current) return;
        console.error('Routing failed, falling back to straight line', error);
        toast.error(t('routingFailedFallback'));
        const elevations = await getElevation([point]);
        if (opId !== lastOperationIdRef.current) return;
        const pointWithEle = { ...point, ele: elevations[0] || 0 };
        updateWaypoints([...currentWaypoints, pointWithEle]);
        setTrackPoints(prev => [...prev, pointWithEle]);
      } finally {
        setIsCalculating(false, opId);
      }
    } else {
      setIsCalculating(true);
      try {
        const elevations = await getElevation([point]);
        if (opId !== lastOperationIdRef.current) return;
        const pointWithEle = { ...point, ele: elevations[0] || 0 };
        updateWaypoints([...currentWaypoints, pointWithEle]);
        setTrackPoints(prev => [...prev, pointWithEle]);
      } catch (error) {
        if (opId !== lastOperationIdRef.current) return;
        updateWaypoints([...currentWaypoints, point]);
        setTrackPoints(prev => [...prev, point]);
      } finally {
        setIsCalculating(false, opId);
      }
    }
  }, [isRoutingEnabled, activity, updateWaypoints, setIsCalculating, t]);

  const updateWaypoint = useCallback(async (index: number, point: GPXPoint) => {
    const currentWaypoints = [...waypointsRef.current];
    if (index < 0 || index >= currentWaypoints.length) return;
    
    currentWaypoints[index] = point;
    updateWaypoints(currentWaypoints);
    await recalculateTrack(currentWaypoints, isRoutingEnabled, activity);
  }, [isRoutingEnabled, activity, recalculateTrack, updateWaypoints]);

  const insertWaypoint = useCallback(async (index: number, point: GPXPoint) => {
    const currentWaypoints = [...waypointsRef.current];
    currentWaypoints.splice(index, 0, point);
    updateWaypoints(currentWaypoints);
    await recalculateTrack(currentWaypoints, isRoutingEnabled, activity);
  }, [isRoutingEnabled, activity, recalculateTrack, updateWaypoints]);

  const removeWaypoint = useCallback(async (index: number) => {
    const currentWaypoints = [...waypointsRef.current];
    if (index < 0 || index >= currentWaypoints.length) return;
    
    currentWaypoints.splice(index, 1);
    updateWaypoints(currentWaypoints);
    await recalculateTrack(currentWaypoints, isRoutingEnabled, activity);
  }, [isRoutingEnabled, activity, recalculateTrack, updateWaypoints]);

  const clearWaypoints = useCallback(() => {
    lastOperationIdRef.current++;
    setIsCalculating(false);
    updateWaypoints([]);
    setTrackPoints([]);
  }, [updateWaypoints, setIsCalculating]);

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
    updateWaypoint,
    insertWaypoint,
    removeWaypoint,
    clearWaypoints,
    removeLastWaypoint,
    reverseWaypoints,
    backToStart,
    roundTrip,
    isCalculating,
    setIsCalculating,
    selectedWaypointIndex,
    setSelectedWaypointIndex,
    loadSession
  }), [
    isEditMode, isRoutingEnabled, isMinimized, activity, waypoints, trackPoints, pois, 
    activePanel, onMapClick, hasSelection, addWaypoint, updateWaypoint, insertWaypoint, removeWaypoint, clearWaypoints, removeLastWaypoint, 
    reverseWaypoints, backToStart, roundTrip, isCalculating, setIsCalculating, selectedWaypointIndex, loadSession
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
