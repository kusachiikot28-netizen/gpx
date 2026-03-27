import React from 'react';
import { Plus, Minus, Navigation, Search, Target, User, Layers } from 'lucide-react';

export const RightToolbar: React.FC = () => {
  return (
    <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-4">
      <div className="flex flex-col bg-[#1a1a1a] text-white rounded-lg shadow-2xl p-1 gap-1 border border-white/10">
        <button className="p-2 hover:bg-white/10 rounded transition-colors"><Plus size={20} /></button>
        <button className="p-2 hover:bg-white/10 rounded transition-colors"><Minus size={20} /></button>
        <button className="p-2 hover:bg-white/10 rounded transition-colors"><Navigation size={20} className="rotate-45" /></button>
      </div>
      
      <div className="flex flex-col bg-[#1a1a1a] text-white rounded-lg shadow-2xl p-1 gap-1 border border-white/10">
        <button className="p-2 hover:bg-white/10 rounded transition-colors"><Search size={20} /></button>
      </div>

      <div className="flex flex-col bg-[#1a1a1a] text-white rounded-lg shadow-2xl p-1 gap-1 border border-white/10">
        <button className="p-2 hover:bg-white/10 rounded transition-colors opacity-50"><Target size={20} /></button>
        <button className="p-2 hover:bg-white/10 rounded transition-colors"><User size={20} /></button>
      </div>

      <div className="flex flex-col bg-[#1a1a1a] text-white rounded-lg shadow-2xl p-1 gap-1 border border-white/10">
        <button className="p-2 hover:bg-white/10 rounded transition-colors"><Layers size={20} /></button>
      </div>
    </div>
  );
};
