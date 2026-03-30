import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../contexts/LanguageContext';
import { 
  Activity, ArrowLeftRight, Home, RotateCcw, 
  HelpCircle, ExternalLink, X, Calendar, 
  Clock, Zap, Trash2, Mountain, Filter,
  MousePointer2, Scissors, Maximize, Layers,
  MapPin, Edit2, Minimize2, Sliders
} from 'lucide-react';
import { cn } from '../lib/utils';

import { useRouting, ActivityType } from '../contexts/RoutingContext';
import { getRoute } from '../services/routingService';
import { GPXTrack, GPXPoint } from '../types';

interface PanelProps {
  title: string;
  onClose: () => void;
  onMinimize?: () => void;
  children: React.ReactNode;
  footer?: string;
}

const Panel: React.FC<PanelProps> = ({ title, onClose, onMinimize, children, footer }) => {
  const { t } = useTranslation();
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="absolute left-12 sm:left-14 top-[-50px] sm:top-0 w-[calc(100vw-60px)] sm:w-80 bg-[#0a0a0a] text-white rounded-lg shadow-2xl border border-white/10 overflow-hidden z-[1001] max-h-[80vh] flex flex-col"
    >
      <div className="flex items-center justify-between p-3 border-b border-white/5 bg-white/5 shrink-0">
        <div className="flex items-center gap-2 font-medium text-sm">
          {title}
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors">
          <X size={16} />
        </button>
      </div>
      <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1">
        {children}
      </div>
      {footer && (
        <div className="p-3 bg-white/5 border-t border-white/5 flex gap-3 items-start relative shrink-0">
          <HelpCircle size={16} className="text-white/40 shrink-0 mt-0.5" />
          <div className="text-xs text-white/60 leading-relaxed pr-10">
            {footer} <a href="#" className="text-blue-400 hover:underline">{t('more')}</a>
          </div>
          {onMinimize ? (
            <button 
              onClick={onMinimize}
              className="absolute right-3 bottom-3 p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors text-white/60"
              title={t('minimize')}
            >
              <Minimize2 size={14} />
            </button>
          ) : (
            <ExternalLink size={14} className="absolute right-3 bottom-3 text-white/40" />
          )}
        </div>
      )}
    </motion.div>
  );
};

export const RoutingPanel: React.FC<{ onClose: () => void, onSave?: () => void }> = React.memo(({ onClose, onSave }) => {
  const { t } = useTranslation();
  const { 
    setIsEditMode, 
    isRoutingEnabled, setIsRoutingEnabled,
    isMinimized, setIsMinimized,
    activity, setActivity, 
    waypoints, trackPoints, clearWaypoints, removeLastWaypoint, removeWaypoint,
    reverseWaypoints, backToStart, roundTrip,
    isCalculating, setIsCalculating,
    selectedWaypointIndex, setSelectedWaypointIndex,
    hasSelection
  } = useRouting();

  if (isMinimized) return null;

  return (
    <Panel 
      title={t('routing')} 
      onClose={onClose}
      onMinimize={() => setIsMinimized(true)}
      footer={t('routingFooter')}
    >
      {!hasSelection && (
        <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] text-amber-200/80 mb-4">
          {t('noTrackSelectedRouting')}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Activity size={16} /> {t('routing')}
          {isCalculating && (
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
              className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full" 
            />
          )}
        </div>
        <div 
          onClick={() => setIsRoutingEnabled(!isRoutingEnabled)}
          className={cn("w-10 h-5 rounded-full relative cursor-pointer transition-colors", isRoutingEnabled ? "bg-blue-600" : "bg-white/10")}
        >
          <motion.div 
            animate={{ x: isRoutingEnabled ? 20 : 0 }}
            className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-xs text-white/40 uppercase font-bold tracking-wider">{t('activity')}</label>
        <select 
          value={activity}
          onChange={(e) => setActivity(e.target.value as ActivityType)}
          className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="run">{t('run')}</option>
          <option value="road_bike">{t('roadBike')}</option>
          <option value="gravel_bike">{t('gravelBike')}</option>
          <option value="mountain_bike">{t('mountainBike')}</option>
          <option value="motorcycle">{t('motorcycle')}</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button 
          onClick={reverseWaypoints}
          disabled={waypoints.length < 2 || isCalculating}
          className="flex flex-col items-center gap-1 p-2 bg-white/5 hover:bg-white/10 rounded text-[10px] transition-colors disabled:opacity-30"
          title={t('reverse')}
        >
          <ArrowLeftRight size={14} /> {t('reverse')}
        </button>
        <button 
          onClick={backToStart}
          disabled={waypoints.length < 2 || isCalculating}
          className="flex flex-col items-center gap-1 p-2 bg-white/5 hover:bg-white/10 rounded text-[10px] transition-colors disabled:opacity-30"
          title={t('backToStart')}
        >
          <Home size={14} /> {t('backToStart')}
        </button>
        <button 
          onClick={roundTrip}
          disabled={waypoints.length < 2 || isCalculating}
          className="flex flex-col items-center gap-1 p-2 bg-white/5 hover:bg-white/10 rounded text-[10px] transition-colors disabled:opacity-30"
          title={t('roundTrip')}
        >
          <RotateCcw size={14} /> {t('roundTrip')}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={clearWaypoints}
          disabled={waypoints.length === 0 || isCalculating}
          className="flex flex-col items-center gap-1 p-2 bg-white/5 hover:bg-white/10 rounded text-[10px] transition-colors disabled:opacity-30"
        >
          <Trash2 size={14} /> {t('clear')}
        </button>
        {selectedWaypointIndex !== null && (
          <button 
            onClick={() => {
              removeWaypoint(selectedWaypointIndex);
              setSelectedWaypointIndex(null);
            }}
            disabled={isCalculating}
            className="flex flex-col items-center gap-1 p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-[10px] transition-colors disabled:opacity-30 border border-red-500/20"
          >
            <Trash2 size={14} /> {t('deletePoint')}
          </button>
        )}
      </div>

      {waypoints.length > 0 && (
        <div className="pt-2 border-t border-white/5">
          <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-2">{t('waypoints')} ({waypoints.length})</div>
          <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
            {waypoints.map((wp, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedWaypointIndex(idx)}
                className={cn(
                  "flex items-center gap-2 text-[10px] p-1 rounded cursor-pointer transition-colors",
                  selectedWaypointIndex === idx ? "bg-blue-600 text-white" : "text-white/60 bg-white/5 hover:bg-white/10"
                )}
              >
                <MapPin size={10} />
                <span>{wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {onSave && (
        <button 
          onClick={onSave}
          disabled={trackPoints.length === 0 || isCalculating}
          className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Edit2 size={16} />
          {t('saveTrack')}
        </button>
      )}
    </Panel>
  );
});

export const AttributesPanel: React.FC<{ 
  onClose: () => void, 
  track: GPXTrack | null,
  onUpdate: (id: string, updates: Partial<GPXTrack>) => void
}> = React.memo(({ onClose, track, onUpdate }) => {
  const { t } = useTranslation();
  
  if (!track) {
    return (
      <Panel title={t('attributes')} onClose={onClose} footer={t('attributesFooter')}>
        <div className="p-4 text-center text-xs text-white/40 italic">
          {t('noTrackSelectedPOI')}
        </div>
      </Panel>
    );
  }

  return (
    <Panel title={t('attributes')} onClose={onClose} footer={t('attributesFooter')}>
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs text-white/40">{t('trackName')}</label>
          <input 
            value={track.name}
            onChange={(e) => onUpdate(track.id, { name: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none focus:border-blue-500" 
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-white/40">{t('lineColor')}</label>
          <div className="flex gap-2 flex-wrap">
            {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ffffff', '#000000'].map(color => (
              <button
                key={color}
                onClick={() => onUpdate(track.id, { color })}
                className={cn(
                  "w-6 h-6 rounded-full border border-white/10 transition-transform hover:scale-110",
                  track.color === color && "ring-2 ring-blue-500 ring-offset-2 ring-offset-[#1a1a1a]"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
            <input 
              type="color"
              value={track.color || '#3b82f6'}
              onChange={(e) => onUpdate(track.id, { color: e.target.value })}
              className="w-6 h-6 bg-transparent border-none p-0 cursor-pointer"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs text-white/40">{t('lineOpacity')}</label>
            <span className="text-[10px] text-white/60">{Math.round((track.opacity ?? 0.8) * 100)}%</span>
          </div>
          <input 
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={track.opacity ?? 0.8}
            onChange={(e) => onUpdate(track.id, { opacity: parseFloat(e.target.value) })}
            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs text-white/40">{t('lineWidth')}</label>
            <span className="text-[10px] text-white/60">{track.width ?? 3}px</span>
          </div>
          <input 
            type="range"
            min="1"
            max="10"
            step="1"
            value={track.width ?? 3}
            onChange={(e) => onUpdate(track.id, { width: parseInt(e.target.value) })}
            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-white/40">{t('lineStyle')}</label>
          <div className="grid grid-cols-3 gap-2">
            {(['solid', 'dashed', 'dotted'] as const).map(style => (
              <button
                key={style}
                onClick={() => onUpdate(track.id, { lineStyle: style })}
                className={cn(
                  "py-1.5 px-2 rounded text-[10px] border transition-colors",
                  track.lineStyle === style || (!track.lineStyle && style === 'solid')
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                )}
              >
                {t(style)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
});

export const POIPanel: React.FC<{ onClose: () => void }> = React.memo(({ onClose }) => {
  const { t } = useTranslation();
  const { addPOI, pois, removePOI, setOnMapClick, hasSelection } = useRouting();
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [lat, setLat] = React.useState<number | null>(null);
  const [lng, setLng] = React.useState<number | null>(null);
  const [icon, setIcon] = React.useState('MapPin');
  const [link, setLink] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setOnMapClick(() => (lat: number, lng: number) => {
      setLat(lat);
      setLng(lng);
      setError(null);
    });
    return () => setOnMapClick(null);
  }, [setOnMapClick]);

  const handleCreate = () => {
    if (!name) {
      setError(t('nameRequired'));
      return;
    }
    if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
      setError(t('locationRequired'));
      return;
    }
    
    addPOI({
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      lat,
      lng,
      icon,
      link
    });
    setName('');
    setDescription('');
    setLink('');
    setLat(null);
    setLng(null);
    setError(null);
    // Show success briefly or just rely on the list update
  };

  return (
    <Panel 
      title={t('poi')} 
      onClose={onClose}
      footer={t('poiFooter')}
    >
      <div className="space-y-3">
        {!hasSelection && (
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] text-amber-200/80 mb-2">
            {t('noTrackSelectedPOI')}
          </div>
        )}

        {hasSelection && (
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] text-blue-200/80 mb-2">
            {t('clickMapToSetLocation')}
          </div>
        )}

        {error && (
          <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400 mb-2">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs text-white/40">{t('name')}</label>
          <input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none focus:border-blue-500" 
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-white/40">{t('description')}</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none focus:border-blue-500 h-20 resize-none" 
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-white/40">{t('icon')}</label>
          <select 
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="MapPin">MapPin</option>
            <option value="Home">Home</option>
            <option value="Flag">Flag</option>
            <option value="Star">Star</option>
            <option value="Camera">Camera</option>
            <option value="Info">Info</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-white/40">{t('link')}</label>
          <input 
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none focus:border-blue-500" 
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-white/40">{t('latitude')}</label>
            <input 
              type="number" 
              value={lat ?? ''}
              placeholder="0.0000"
              onChange={(e) => setLat(parseFloat(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none focus:border-blue-500" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-white/40">{t('longitude')}</label>
            <input 
              type="number" 
              value={lng ?? ''}
              placeholder="0.0000"
              onChange={(e) => setLng(parseFloat(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none focus:border-blue-500" 
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleCreate}
            disabled={!hasSelection}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 rounded text-sm transition-colors flex items-center justify-center gap-2"
          >
            <MapPin size={16} /> {t('createPoi')}
          </button>
        </div>

        {pois.length > 0 && (
          <div className="pt-4 border-t border-white/5 space-y-2">
            <label className="text-xs text-white/40 uppercase font-bold tracking-wider">{t('poiList')} ({pois.length})</label>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {pois.map(poi => (
                <div key={poi.id} className="flex items-center justify-between bg-white/5 p-2 rounded group">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <MapPin size={14} className="text-blue-400 shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-medium truncate">{poi.name}</div>
                      <div className="text-[10px] text-white/40 truncate">{poi.lat.toFixed(4)}, {poi.lng.toFixed(4)}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => removePOI(poi.id)}
                    className="p-1 hover:bg-red-500/20 text-white/20 hover:text-red-500 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
});

export const EditPanel: React.FC<{ onClose: () => void }> = React.memo(({ onClose }) => {
  const { t } = useTranslation();
  return (
    <Panel 
      title={t('cropSplit')} 
      onClose={onClose}
      footer={t('cropSplitFooter')}
    >
      <div className="space-y-6 py-2">
        <div className="px-2">
          <div className="h-1 bg-white/10 rounded-full relative">
            <div className="absolute left-[10%] right-[10%] h-full bg-blue-500 rounded-full" />
            <div className="absolute left-[10%] top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg cursor-pointer border-2 border-blue-500" />
            <div className="absolute right-[10%] top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg cursor-pointer border-2 border-blue-500" />
          </div>
        </div>
        
        <button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-sm transition-colors flex items-center justify-center gap-2">
          <Scissors size={16} /> {t('crop')}
        </button>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">{t('splitInto')}</span>
            <select className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs outline-none">
              <option>{t('files')}</option>
              <option>{t('tracks')}</option>
              <option>{t('segments')}</option>
            </select>
          </div>
        </div>
      </div>
    </Panel>
  );
});

export const TimePanel: React.FC<{ onClose: () => void }> = React.memo(({ onClose }) => {
  const { t } = useTranslation();
  return (
    <Panel 
      title={t('time')} 
      onClose={onClose}
      footer={t('timeFooter')}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Zap size={12} /> {t('speed')}
            </div>
            <div className="flex items-center gap-2">
              <input className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none" placeholder="0" />
              <span className="text-xs text-white/40">km/h</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Clock size={12} /> {t('movingTime')}
            </div>
            <input className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none" placeholder="--:--:--" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-white/40">{t('start')}</label>
            <div className="flex gap-2">
              <button className="flex-1 bg-white/5 border border-white/10 rounded p-2 text-xs text-left text-white/40">{t('pickDate')}</button>
              <select className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs outline-none w-20">
                <option>00:00</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-white/40">{t('end')}</label>
            <div className="flex gap-2">
              <button className="flex-1 bg-white/5 border border-white/10 rounded p-2 text-xs text-left text-white/40">{t('pickDate')}</button>
              <select className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs outline-none w-20">
                <option>00:00</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-white/80">
          <input type="checkbox" className="rounded bg-white/5 border-white/10" defaultChecked />
          {t('realisticTime')}
        </div>

        <div className="flex gap-2">
          <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-sm transition-colors flex items-center justify-center gap-2">
            <Calendar size={16} /> {t('updateTime')}
          </button>
          <button className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>
    </Panel>
  );
});

export const MergePanel: React.FC<{ onClose: () => void }> = React.memo(({ onClose }) => {
  const { t } = useTranslation();
  return (
    <Panel 
      title={t('merge')} 
      onClose={onClose}
      footer={t('mergeFooter')}
    >
      <div className="space-y-4">
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-sm cursor-pointer group">
            <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            </div>
            <span>{t('connectTraces')}</span>
          </label>
          <label className="flex items-center gap-3 text-sm cursor-pointer group opacity-40">
            <div className="w-4 h-4 rounded-full border-2 border-white/20" />
            <span>{t('mergeKeepDisconnected')}</span>
          </label>
        </div>

        <button className="w-full py-2 bg-white/5 border border-white/10 rounded text-sm text-white/20 cursor-not-allowed flex items-center justify-center gap-2">
          <Maximize size={16} /> {t('mergeSelection')}
        </button>
      </div>
    </Panel>
  );
});

export const ExtractPanel: React.FC<{ onClose: () => void }> = React.memo(({ onClose }) => {
  const { t } = useTranslation();
  return (
    <Panel 
      title={t('extract')} 
      onClose={onClose}
      footer={t('extractFooter')}
    >
      <button className="w-full py-2 bg-white/5 border border-white/10 rounded text-sm text-white/20 cursor-not-allowed flex items-center justify-center gap-2">
        <Layers size={16} /> {t('extract')}
      </button>
    </Panel>
  );
});

export const ElevationPanel: React.FC<{ onClose: () => void }> = React.memo(({ onClose }) => {
  const { t } = useTranslation();
  return (
    <Panel 
      title={t('elevation')} 
      onClose={onClose}
      footer={t('elevationFooter')}
    >
      <button className="w-full py-2 bg-white/5 border border-white/10 rounded text-sm text-white/20 cursor-not-allowed flex items-center justify-center gap-2">
        <Mountain size={16} /> {t('requestElevation')}
      </button>
    </Panel>
  );
});

export const FilterPanel: React.FC<{ onClose: () => void }> = React.memo(({ onClose }) => {
  const { t } = useTranslation();
  return (
    <Panel 
      title={t('filter')} 
      onClose={onClose}
      footer={t('filterFooter')}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-1 bg-white/10 rounded-full relative">
            <div className="absolute left-0 w-1/2 h-full bg-blue-500 rounded-full" />
            <div className="absolute left-1/2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg cursor-pointer" />
          </div>
          <div className="flex justify-between text-[10px] text-white/40">
            <span>{t('tolerance')}</span>
            <span>0.0316 km</span>
          </div>
          <div className="flex justify-between text-[10px] text-white/40">
            <span>{t('numGpsPoints')}</span>
            <span>0/0</span>
          </div>
        </div>

        <button className="w-full py-2 bg-white/5 border border-white/10 rounded text-sm text-white/20 cursor-not-allowed flex items-center justify-center gap-2">
          <Filter size={16} /> {t('minify')}
        </button>
      </div>
    </Panel>
  );
});

export const CleanPanel: React.FC<{ onClose: () => void }> = React.memo(({ onClose }) => {
  const { t } = useTranslation();
  return (
    <Panel 
      title={t('clean')} 
      onClose={onClose}
      footer={t('cleanFooter')}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded bg-white/5 border-white/10" defaultChecked />
            {t('deleteGpsPoints')}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded bg-white/5 border-white/10" defaultChecked />
            {t('deletePoi')}
          </label>
        </div>

        <div className="space-y-2 pt-2">
          <label className="flex items-center gap-3 text-sm cursor-pointer">
            <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            </div>
            <span>{t('deleteInside')}</span>
          </label>
          <label className="flex items-center gap-3 text-sm cursor-pointer opacity-40">
            <div className="w-4 h-4 rounded-full border-2 border-white/20" />
            <span>{t('deleteOutside')}</span>
          </label>
        </div>

        <button className="w-full py-2 bg-white/5 border border-white/10 rounded text-sm text-white/20 cursor-not-allowed flex items-center justify-center gap-2">
          <Trash2 size={16} /> {t('delete')}
        </button>
      </div>
    </Panel>
  );
});
