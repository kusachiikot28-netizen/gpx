import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { 
  ArrowUpRight, ArrowDownRight, Tag, 
  Clock, Zap, BarChart2, Check, Mountain, Layers,
  Activity, Heart, Thermometer, Box, X
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

export const StatsPanel: React.FC<StatsPanelProps> = React.memo(({ 
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

  const StatItem = ({ icon: Icon, value, unit, secondaryValue, secondaryUnit, secondaryIcon: SecondaryIcon }: any) => (
    <div className="flex items-center gap-3 py-1">
      <Icon size={16} className="text-white shrink-0" />
      <div className="flex items-baseline gap-1.5 font-medium text-sm sm:text-base">
        <span className="tabular-nums">{value}</span>
        <span className="text-[10px] text-white/50">{unit}</span>
        {secondaryValue !== undefined && (
          <>
            {SecondaryIcon && <SecondaryIcon size={14} className="text-white/50 ml-1" />}
            <span className="tabular-nums ml-1">{secondaryValue}</span>
            <span className="text-[10px] text-white/50">{secondaryUnit}</span>
          </>
        )}
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
    <div className="flex flex-col h-full bg-black text-white p-4 sm:p-6 relative overflow-y-auto no-scrollbar">
      <div className="flex flex-col gap-1 sm:gap-2">
        <StatItem 
          icon={Tag} 
          value={distance.toFixed(2)} 
          unit={distUnit} 
        />
        <StatItem 
          icon={ArrowUpRight} 
          value={gain.toFixed(0)} 
          unit={elevUnit} 
          secondaryIcon={ArrowDownRight}
          secondaryValue={loss.toFixed(0)}
          secondaryUnit={elevUnit}
        />
        <StatItem 
          icon={Zap} 
          value="0.00 / 0.00" 
          unit={isMetric ? 'km/h' : 'mph'} 
        />
        <StatItem 
          icon={Clock} 
          value="00:00 / 00:00" 
          unit="" 
        />
      </div>
      
      <div className="mt-auto pt-4 flex items-center justify-between">
        {/* Mode toggle moved to ElevationProfile */}
      </div>
    </div>
  );
});
