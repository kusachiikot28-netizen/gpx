import React from 'react';
import { cn } from '../lib/utils';
import { GPXTrack } from '../types';
import { X } from 'lucide-react';

interface TrackTabsProps {
  tracks: GPXTrack[];
  selectedTrackIds: string[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TrackTabs: React.FC<TrackTabsProps> = React.memo(({ 
  tracks, 
  selectedTrackIds, 
  onSelect, 
  onDelete 
}) => {
  if (tracks.length === 0) return null;

  return (
    <div className="absolute left-0 bottom-0 z-[1001] flex items-end gap-1 px-2 w-full overflow-x-auto no-scrollbar pointer-events-none">
      <div className="flex items-end gap-1 pointer-events-auto">
        {tracks.map((track) => {
          const isSelected = selectedTrackIds.includes(track.id);
          return (
            <div
              key={track.id}
              onClick={() => onSelect(track.id)}
              className={cn(
                "group relative flex items-center gap-2 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer rounded bg-black text-white border border-white/10 shadow-lg whitespace-nowrap",
                isSelected
                  ? "opacity-100 ring-1 ring-white/30"
                  : "opacity-60 hover:opacity-100",
                track.hidden && "opacity-30 grayscale"
              )}
            >
              {track.color && (
                <div 
                  className="w-2 h-2 rounded-full shrink-0" 
                  style={{ backgroundColor: track.color }}
                />
              )}
              <span className={cn("truncate max-w-[150px]", track.hidden && "line-through")}>
                {track.name}
              </span>
              {tracks.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(track.id);
                  }}
                  className={cn(
                    "p-0.5 hover:bg-white/10 rounded transition-opacity ml-1",
                    isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
