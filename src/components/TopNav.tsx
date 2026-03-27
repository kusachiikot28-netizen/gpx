import React from 'react';
import { Wand2, FileText, Edit3, Eye, Settings, BookOpen, Heart } from 'lucide-react';

export const TopNav: React.FC = () => {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center bg-[#1a1a1a] text-white rounded-lg shadow-2xl px-2 py-1 gap-1 border border-white/10">
      <button className="p-2 hover:bg-white/10 rounded transition-colors text-red-400"><Wand2 size={20} /></button>
      <div className="w-[1px] h-6 bg-white/10 mx-1" />
      <button className="p-2 hover:bg-white/10 rounded transition-colors"><FileText size={20} /></button>
      <button className="p-2 hover:bg-white/10 rounded transition-colors"><Edit3 size={20} /></button>
      <button className="p-2 hover:bg-white/10 rounded transition-colors"><Eye size={20} /></button>
      <button className="p-2 hover:bg-white/10 rounded transition-colors"><Settings size={20} /></button>
      <button className="p-2 hover:bg-white/10 rounded transition-colors"><BookOpen size={20} /></button>
      <button className="p-2 hover:bg-white/10 rounded transition-colors text-pink-400"><Heart size={20} /></button>
    </div>
  );
};
