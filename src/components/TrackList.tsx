import React from 'react';
import { Trash2, Download, FileText, X } from 'lucide-react';
import { GPXTrack } from '../types';
import { cn } from '../lib/utils';

interface TrackListProps {
  tracks: GPXTrack[];
  selectedTrackId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
  onClose: () => void;
}

export const TrackList: React.FC<TrackListProps> = React.memo(({ 
  tracks, 
  selectedTrackId, 
  onSelect, 
  onDelete, 
  onDownload,
  onClose
}) => {
  return (
    <div className="absolute left-20 top-1/2 -translate-y-1/2 z-[1001] w-72 bg-[#1a1a1a] text-white rounded-xl shadow-2xl border border-white/10 flex flex-col max-h-[80vh]">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <FileText size={18} className="text-blue-400" />
          Tracks
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
          <X size={18} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        {tracks.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm italic">
            No tracks loaded
          </div>
        ) : (
          tracks.map(track => (
            <div 
              key={track.id}
              onClick={() => onSelect(track.id)}
              className={cn(
                "p-3 rounded-lg border cursor-pointer transition-all flex flex-col gap-1",
                selectedTrackId === track.id 
                  ? "bg-blue-600/20 border-blue-500/50" 
                  : "bg-transparent border-transparent hover:bg-white/5"
              )}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium truncate flex-1 pr-2">{track.name}</span>
                <div className="flex gap-1 opacity-60 hover:opacity-100">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDownload(track.id); }}
                    className="p-1 hover:text-blue-400"
                  >
                    <Download size={14} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(track.id); }}
                    className="p-1 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex gap-3 text-[10px] text-slate-400 font-mono">
                <span>{(track.distance / 1000).toFixed(1)} km</span>
                <span>+{track.elevationGain.toFixed(0)} m</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});
