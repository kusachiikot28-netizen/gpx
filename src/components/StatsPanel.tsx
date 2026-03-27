import React from 'react';
import { Link, ArrowUpRight, ArrowDownRight, Zap, Clock, BarChart2 } from 'lucide-react';
import { GPXTrack } from '../types';

interface StatsPanelProps {
  track: GPXTrack | null;
  onToggleElevation: () => void;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ track, onToggleElevation }) => {
  if (!track) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-black text-white p-6 flex flex-col gap-4 border-t border-white/10">
      <div className="flex items-start justify-between max-w-4xl mx-auto w-full">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Link size={18} className="text-slate-400" />
            <span className="text-xl font-medium">{(track.distance / 1000).toFixed(2)} km</span>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <ArrowUpRight size={18} className="text-slate-400" />
              <span className="text-base">{track.elevationGain.toFixed(0)} m</span>
              <ArrowDownRight size={18} className="text-slate-400 ml-2" />
              <span className="text-base">{track.elevationLoss.toFixed(0)} m</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Zap size={18} className="text-slate-400" />
            <span className="text-base">0.00 / 0.00 km/h</span>
          </div>

          <div className="flex items-center gap-3">
            <Clock size={18} className="text-slate-400" />
            <span className="text-base">00:00 / 00:00</span>
          </div>
        </div>

        <div className="flex flex-col text-right text-slate-500 text-sm gap-1">
          <span>1 m</span>
          <span>1 m</span>
          <span>1 m</span>
          <span>0 m</span>
          <span>0 m</span>
          <span>0 m</span>
        </div>

        <button 
          onClick={onToggleElevation}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors self-end"
        >
          <BarChart2 size={20} />
        </button>
      </div>
    </div>
  );
};
