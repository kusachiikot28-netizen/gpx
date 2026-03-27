import React from 'react';
import { Upload, Download, Trash2, FileText, Activity, Layers, Settings } from 'lucide-react';
import { GPXTrack } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  tracks: GPXTrack[];
  selectedTrackId: string | null;
  onSelectTrack: (id: string) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  tracks, 
  selectedTrackId, 
  onSelectTrack, 
  onUpload, 
  onDelete, 
  onDownload 
}) => {
  return (
    <div className="w-80 h-full bg-slate-50 border-r border-slate-200 flex flex-col">
      <div className="p-6 border-bottom border-slate-200">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Activity className="text-blue-600" />
          GPX Studio
        </h1>
        <p className="text-xs text-slate-500 mt-1">Online GPX Editor</p>
      </div>

      <div className="p-4 flex flex-col gap-2">
        <label className="flex items-center justify-center gap-2 w-full p-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
          <Upload size={18} />
          <span>Upload GPX</span>
          <input type="file" accept=".gpx" className="hidden" onChange={onUpload} />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <FileText size={14} />
          Tracks
        </div>
        
        {tracks.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm italic">
            No tracks uploaded yet
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {tracks.map(track => (
              <div 
                key={track.id}
                onClick={() => onSelectTrack(track.id)}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all",
                  selectedTrackId === track.id 
                    ? "bg-white border-blue-200 shadow-sm ring-1 ring-blue-100" 
                    : "bg-transparent border-transparent hover:bg-slate-100"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-sm truncate pr-2">{track.name}</h3>
                  <div className="flex gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDownload(track.id); }}
                      className="p-1 text-slate-400 hover:text-blue-600"
                    >
                      <Download size={14} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(track.id); }}
                      className="p-1 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                  <div className="flex flex-col">
                    <span className="text-slate-400 uppercase">Distance</span>
                    <span className="font-mono">{(track.distance / 1000).toFixed(2)} km</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400 uppercase">Elev. Gain</span>
                    <span className="font-mono">+{track.elevationGain.toFixed(0)} m</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="flex justify-around text-slate-400">
          <button className="p-2 hover:text-blue-600"><Layers size={20} /></button>
          <button className="p-2 hover:text-blue-600"><Settings size={20} /></button>
        </div>
      </div>
    </div>
  );
};
