import React from 'react';
import { Edit2, MapPin, Scissors, Clock, Maximize, Layers, Mountain, Filter, MousePointer2, Upload } from 'lucide-react';

interface LeftToolbarProps {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleTrackList: () => void;
  trackCount: number;
}

export const LeftToolbar: React.FC<LeftToolbarProps> = ({ onUpload, onToggleTrackList, trackCount }) => {
  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col bg-[#1a1a1a] text-white rounded-lg shadow-2xl p-1 gap-1 border border-white/10">
      <button className="p-2 hover:bg-white/10 rounded transition-colors"><Edit2 size={20} /></button>
      <button className="p-2 hover:bg-white/10 rounded transition-colors"><MapPin size={20} /></button>
      <button className="p-2 hover:bg-white/10 rounded transition-colors"><Scissors size={20} /></button>
      <button className="p-2 hover:bg-white/10 rounded transition-colors"><Clock size={20} /></button>
      <button className="p-2 hover:bg-white/10 rounded transition-colors"><Maximize size={20} /></button>
      <div className="w-full h-[1px] bg-white/10 my-1" />
      <button 
        onClick={onToggleTrackList}
        className="p-2 hover:bg-white/10 rounded transition-colors relative"
      >
        <Layers size={20} />
        {trackCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
        )}
      </button>
      <button className="p-2 hover:bg-white/10 rounded transition-colors"><Mountain size={20} /></button>
      <button className="p-2 hover:bg-white/10 rounded transition-colors"><Filter size={20} /></button>
      <button className="p-2 hover:bg-white/10 rounded transition-colors"><MousePointer2 size={20} /></button>
      <div className="w-full h-[1px] bg-white/10 my-1" />
      <label className="p-2 hover:bg-white/10 rounded transition-colors cursor-pointer">
        <Upload size={20} />
        <input type="file" accept=".gpx" className="hidden" onChange={onUpload} />
      </label>
    </div>
  );
};
