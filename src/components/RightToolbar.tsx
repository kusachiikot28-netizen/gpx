import React from 'react';
import { Plus, Minus, Navigation, Search, Target, User, Layers } from 'lucide-react';

interface RightToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const RightToolbar: React.FC<RightToolbarProps> = ({ onZoomIn, onZoomOut }) => {
  return (
    <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-2 sm:gap-4">
      <div className="flex flex-col bg-[#1a1a1a] text-white rounded-lg shadow-2xl p-0.5 sm:p-1 gap-0.5 sm:gap-1 border border-white/10">
        <button onClick={onZoomIn} className="p-1.5 sm:p-2 hover:bg-white/10 rounded transition-colors"><Plus size={18} className="sm:w-5 sm:h-5" /></button>
        <button onClick={onZoomOut} className="p-1.5 sm:p-2 hover:bg-white/10 rounded transition-colors"><Minus size={18} className="sm:w-5 sm:h-5" /></button>
        <button className="p-1.5 sm:p-2 hover:bg-white/10 rounded transition-colors"><Navigation size={18} className="sm:w-5 sm:h-5 rotate-45" /></button>
      </div>
      
      <div className="flex flex-col bg-[#1a1a1a] text-white rounded-lg shadow-2xl p-0.5 sm:p-1 gap-0.5 sm:gap-1 border border-white/10">
        <button className="p-1.5 sm:p-2 hover:bg-white/10 rounded transition-colors"><Search size={18} className="sm:w-5 sm:h-5" /></button>
      </div>

      <div className="flex flex-col bg-[#1a1a1a] text-white rounded-lg shadow-2xl p-0.5 sm:p-1 gap-0.5 sm:gap-1 border border-white/10">
        <button className="p-1.5 sm:p-2 hover:bg-white/10 rounded transition-colors opacity-50"><Target size={18} className="sm:w-5 sm:h-5" /></button>
        <button className="p-1.5 sm:p-2 hover:bg-white/10 rounded transition-colors"><User size={18} className="sm:w-5 sm:h-5" /></button>
      </div>

      <div className="flex flex-col bg-[#1a1a1a] text-white rounded-lg shadow-2xl p-0.5 sm:p-1 gap-0.5 sm:gap-1 border border-white/10">
        <button className="p-1.5 sm:p-2 hover:bg-white/10 rounded transition-colors"><Layers size={18} className="sm:w-5 sm:h-5" /></button>
      </div>
    </div>
  );
};
