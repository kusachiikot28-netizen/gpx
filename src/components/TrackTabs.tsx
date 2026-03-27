import React from 'react';
import { cn } from '../lib/utils';
import { GPXTrack } from '../types';
import { X } from 'lucide-react';

interface TrackTabsProps {
  tracks: GPXTrack[];
  selectedTrackId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TrackTabs: React.FC<TrackTabsProps> = ({ 
  tracks, 
  selectedTrackId, 
  onSelect, 
  onDelete 
}) => {
  if (tracks.length === 0) return null;

  return (
    <div className="absolute left-0 bottom-0 z-[1001] flex items-end gap-1 px-2 w-full overflow-x-auto no-scrollbar pointer-events-none">
      <div className="flex items-end gap-1 pointer-events-auto">
        {tracks.map((track) => (
          <div
            key={track.id}
            onClick={() => onSelect(track.id)}
            className={cn(
              "group relative flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all cursor-pointer rounded-t-lg border-t-[3px] whitespace-nowrap",
              selectedTrackId === track.id
                ? "bg-[#1a1a1a] text-white border-red-600 shadow-2xl"
                : "bg-[#1a1a1a]/90 text-white/50 border-transparent hover:bg-[#1a1a1a] hover:text-white"
            )}
          >
            <span className="truncate max-w-[100px] sm:max-w-[150px]">{track.name}</span>
            {tracks.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(track.id);
                }}
                className={cn(
                  "p-0.5 hover:bg-white/10 rounded transition-opacity ml-1",
                  selectedTrackId === track.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
