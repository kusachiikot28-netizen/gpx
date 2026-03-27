import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { 
  ArrowUpRight, ArrowDownRight, MoveRight, 
  Clock, Zap, BarChart2
} from 'lucide-react';
import { GPXTrack } from '../types';

interface StatsPanelProps {
  track: GPXTrack | null;
  onToggleElevation: () => void;
  isMetric?: boolean;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ 
  track, 
  onToggleElevation,
  isMetric = true
}) => {
  const { t } = useTranslation();
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

  return (
    <div className="flex flex-wrap items-center gap-4 sm:gap-8 px-4 py-3 bg-[#0a0a0a] text-white border-t border-white/10">
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
      
      <button 
        onClick={onToggleElevation}
        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
        title={t('elevationProfile')}
      >
        <BarChart2 size={20} />
      </button>
    </div>
  );
};
