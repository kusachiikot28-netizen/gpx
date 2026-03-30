import React from 'react';
import { GPXTrack } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { FileText, Eye, EyeOff, Trash2, Download, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

interface FileTreePanelProps {
  tracks: GPXTrack[];
  selectedTrackIds: string[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onDownload: (id: string) => void;
  onNew: () => void;
}

export const FileTreePanel: React.FC<FileTreePanelProps> = React.memo(({
  tracks,
  selectedTrackIds,
  onSelect,
  onDelete,
  onToggleVisibility,
  onDownload,
  onNew
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-64 bg-[#1a1a1a] border-l border-white/10 text-white flex flex-col animate-in slide-in-from-right duration-200 shrink-0">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider opacity-60">{t('fileTree')}</h2>
        <button 
          onClick={onNew}
          className="p-1 hover:bg-white/10 rounded text-blue-400 transition-colors"
          title={t('new')}
        >
          <Plus size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {tracks.length === 0 ? (
          <div className="text-xs opacity-40 p-4 text-center italic">
            No tracks loaded
          </div>
        ) : (
          tracks.map((track) => (
            <div
              key={track.id}
              onClick={() => onSelect(track.id)}
              className={cn(
                "group flex flex-col p-2 rounded transition-colors cursor-pointer border border-transparent",
                selectedTrackIds.includes(track.id) 
                  ? "bg-white/10 border-white/10" 
                  : "hover:bg-white/5"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {track.color && (
                    <div 
                      className="w-1.5 h-1.5 rounded-full shrink-0" 
                      style={{ backgroundColor: track.color }}
                    />
                  )}
                  <FileText size={14} className={cn(track.hidden ? "opacity-30" : "text-blue-400")} />
                  <span className={cn("text-xs truncate", track.hidden && "opacity-30")}>
                    {track.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility(track.id);
                    }}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    {track.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload(track.id);
                    }}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <Download size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(track.id);
                    }}
                    className="p-1 hover:bg-white/10 rounded text-red-400"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1 text-[10px] opacity-40">
                <span>{(track.distance / 1000).toFixed(1)} km</span>
                <span>•</span>
                <span>{track.points.length} pts</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});
