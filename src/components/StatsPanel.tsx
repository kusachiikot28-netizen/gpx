import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { 
  ArrowUpRight, ArrowDownRight, MoveRight, 
  Clock, Zap, BarChart2, Check, Mountain, Layers,
  Activity, Heart, Thermometer, Box
} from 'lucide-react';
import { GPXTrack } from '../types';
import { cn } from '../lib/utils';

interface StatsPanelProps {
  track: GPXTrack | null;
  onToggleElevation: () => void;
  isMetric?: boolean;
  elevationMode: 'elevation' | 'slope';
  onSetElevationMode: (mode: 'elevation' | 'slope') => void;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ 
  track, 
  onToggleElevation,
  isMetric = true,
  elevationMode,
  onSetElevationMode
}) => {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!track) return null;

  const distUnit = isMetric ? 'km' : 'mi';
  const elevUnit = isMetric ? 'm' : 'ft';
  
  const distance = isMetric ? track.distance / 1000 : (track.distance / 1000) * 0.621371;
  const gain = isMetric ? track.elevationGain : track.elevationGain * 3.28084;
  const loss = isMetric ? track.elevationLoss : track.elevationLoss * 3.28084;

  const StatItem = ({ icon: Icon, label, value, unit }: any) => (
    <div className="flex flex-col gap-0.5 min-w-[70px] sm:min-w-[90px]">
      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-white/40 uppercase font-bold tracking-wider">
        <Icon size={12} className="shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-sm sm:text-lg font-medium tabular-nums">{value}</span>
        <span className="text-[10px] sm:text-xs text-white/40">{unit}</span>
      </div>
    </div>
  );

  const MenuItem = ({ icon: Icon, label, active, onClick, checkable = false }: any) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 text-xs text-white transition-colors"
    >
      <div className="w-4 flex items-center justify-center shrink-0">
        {checkable ? (active && <Check size={14} className="text-blue-400" />) : (Icon && <Icon size={14} className="text-white/60" />)}
      </div>
      <span className="flex-1 text-left">{label}</span>
      {!checkable && active && <Check size={14} className="text-blue-400" />}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-4 sm:gap-8 px-4 py-3 bg-[#0a0a0a] text-white border-t border-white/10 relative">
      <StatItem 
        icon={MoveRight} 
        label={t('distance')} 
        value={distance.toFixed(2)} 
        unit={distUnit} 
      />
      <StatItem 
        icon={ArrowUpRight} 
        label={t('elevationGain')} 
        value={gain.toFixed(0)} 
        unit={elevUnit} 
      />
      <StatItem 
        icon={ArrowDownRight} 
        label={t('elevationLoss')} 
        value={loss.toFixed(0)} 
        unit={elevUnit} 
      />
      <StatItem 
        icon={Zap} 
        label={t('speed')} 
        value="0.00" 
        unit={isMetric ? 'km/h' : 'mph'} 
      />
      <StatItem 
        icon={Clock} 
        label={t('movingTime')} 
        value="00:00" 
        unit="" 
      />
      
      <div className="flex-1" />
      
      <div className="relative" ref={menuRef}>
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className={cn(
            "p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors",
            showMenu && "bg-white/10"
          )}
          title={t('elevationProfile')}
        >
          <BarChart2 size={20} />
        </button>

        {showMenu && (
          <div className="absolute right-0 bottom-full mb-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl py-1 z-[1002]">
            <MenuItem 
              icon={Mountain} 
              label={t('elevation')} 
              active={elevationMode === 'elevation'} 
              onClick={() => { onSetElevationMode('elevation'); setShowMenu(false); }} 
            />
            <MenuItem 
              icon={BarChart2} 
              label={t('slope')} 
              active={elevationMode === 'slope'} 
              onClick={() => { onSetElevationMode('slope'); setShowMenu(false); }} 
            />
            <MenuItem icon={Layers} label={t('surface')} />
            <MenuItem icon={Box} label={t('category')} />
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem checkable active label={t('speed')} />
            <MenuItem checkable active label={t('heartRate')} />
            <MenuItem checkable active label={t('cadence')} />
            <MenuItem checkable active label={t('temperature')} />
            <MenuItem checkable active label={t('power')} />
          </div>
        )}
      </div>
    </div>
  );
};
