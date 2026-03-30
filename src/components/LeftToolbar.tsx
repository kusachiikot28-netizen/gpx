import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Edit2, MapPin, Scissors, Clock, Maximize, 
  Layers, Mountain, Filter, MousePointer2, Upload,
  Maximize2, Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from '../contexts/LanguageContext';
import { 
  RoutingPanel, POIPanel, EditPanel, TimePanel, 
  MergePanel, ExtractPanel, ElevationPanel, FilterPanel, CleanPanel 
} from './ToolbarPanels';

import { GPXTrack } from '../types';
import { useRouting } from '../contexts/RoutingContext';

interface LeftToolbarProps {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddTrack: (track: GPXTrack) => void;
  onNew: () => void;
}

type ActivePanel = 'routing' | 'poi' | 'edit' | 'time' | 'merge' | 'extract' | 'elevation' | 'filter' | 'clean' | null;

export const LeftToolbar: React.FC<LeftToolbarProps> = React.memo(({ onUpload, onAddTrack, onNew }) => {
  const { t } = useTranslation();
  const { isMinimized, setIsMinimized, isEditMode, setIsEditMode, activePanel, setActivePanel } = useRouting();

  const togglePanel = (panel: string) => {
    if (panel === 'routing') {
      if (isMinimized) {
        setIsMinimized(false);
      }
      const newEditMode = !isEditMode;
      setIsEditMode(newEditMode);
      setActivePanel(newEditMode ? 'routing' : null);
    } else {
      setActivePanel(activePanel === panel ? null : panel);
    }
  };

  return (
    <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-[1000] flex items-start gap-2">
      <div className="flex flex-col bg-[#1a1a1a] text-white rounded-lg shadow-2xl p-0.5 sm:p-1 gap-0.5 sm:gap-1 border border-white/10">
        <button 
          onClick={onNew}
          className="p-1.5 sm:p-2 hover:bg-white/10 rounded transition-colors text-blue-400"
          title={t('new')}
        >
          <Plus size={18} className="sm:w-5 sm:h-5" />
        </button>
        <div className="w-full h-[1px] bg-white/10 my-0.5 sm:my-1" />
        <button 
          onClick={() => togglePanel('routing')}
          className={cn(
            "p-1.5 sm:p-2 hover:bg-white/10 rounded transition-colors", 
            activePanel === 'routing' && !isMinimized && "bg-blue-600 hover:bg-blue-700",
            isEditMode && "relative after:absolute after:top-1 after:right-1 after:w-1.5 after:h-1.5 after:bg-blue-500 after:rounded-full"
          )}
          title={t('routing')}
        >
          <Edit2 size={18} className="sm:w-5 sm:h-5" />
        </button>
        <button 
          onClick={() => togglePanel('poi')}
          className={cn("p-1.5 sm:p-2 hover:bg-white/10 rounded transition-colors", activePanel === 'poi' && "bg-blue-600 hover:bg-blue-700")}
          title={t('poi')}
        >
          <MapPin size={18} className="sm:w-5 sm:h-5" />
        </button>
        <button 
          onClick={() => togglePanel('edit')}
          className={cn("p-1.5 sm:p-2 hover:bg-white/10 rounded transition-colors", activePanel === 'edit' && "bg-blue-600 hover:bg-blue-700")}
          title={t('cropSplit')}
        >
          <Scissors size={18} className="sm:w-5 sm:h-5" />
        </button>
        <button 
          onClick={() => togglePanel('time')}
          className={cn("p-1.5 sm:p-2 hover:bg-white/10 rounded transition-colors", activePanel === 'time' && "bg-blue-600 hover:bg-blue-700")}
          title={t('time')}
        >
          <Clock size={18} className="sm:w-5 sm:h-5" />
        </button>
        <button 
          onClick={() => togglePanel('merge')}
          className={cn("p-1.5 sm:p-2 hover:bg-white/10 rounded transition-colors", activePanel === 'merge' && "bg-blue-600 hover:bg-blue-700")}
          title={t('merge')}
        >
          <Maximize size={18} className="sm:w-5 sm:h-5" />
        </button>
        <div className="w-full h-[1px] bg-white/10 my-0.5 sm:my-1" />
        <button 
          onClick={() => togglePanel('elevation')}
          className={cn("p-1.5 sm:p-2 hover:bg-white/10 rounded transition-colors", activePanel === 'elevation' && "bg-blue-600 hover:bg-blue-700")}
          title={t('elevation')}
        >
          <Mountain size={18} className="sm:w-5 sm:h-5" />
        </button>
        <button 
          onClick={() => togglePanel('filter')}
          className={cn("p-1.5 sm:p-2 hover:bg-white/10 rounded transition-colors", activePanel === 'filter' && "bg-blue-600 hover:bg-blue-700")}
          title={t('filter')}
        >
          <Filter size={18} className="sm:w-5 sm:h-5" />
        </button>
        <button 
          onClick={() => togglePanel('clean')}
          className={cn("p-1.5 sm:p-2 hover:bg-white/10 rounded transition-colors", activePanel === 'clean' && "bg-blue-600 hover:bg-blue-700")}
          title={t('clean')}
        >
          <MousePointer2 size={18} className="sm:w-5 sm:h-5" />
        </button>
        <div className="w-full h-[1px] bg-white/10 my-0.5 sm:my-1" />
        <button 
          onClick={onUpload}
          className="p-1.5 sm:p-2 hover:bg-white/10 rounded transition-colors cursor-pointer" 
          title={t('open')}
        >
          <Upload size={18} className="sm:w-5 sm:h-5" />
        </button>
      </div>

      {isEditMode && isMinimized && (
        <button 
          onClick={() => {
            setIsMinimized(false);
            setActivePanel('routing');
          }}
          className="p-1.5 sm:p-2 bg-[#1a1a1a] text-white rounded-lg shadow-2xl border border-white/10 hover:bg-white/10 transition-colors"
          title={t('expand')}
        >
          <Maximize2 size={18} className="sm:w-5 sm:h-5" />
        </button>
      )}

      <AnimatePresence>
        {activePanel === 'routing' && !isMinimized && <RoutingPanel onClose={() => setActivePanel(null)} />}
        {activePanel === 'poi' && <POIPanel onClose={() => setActivePanel(null)} />}
        {activePanel === 'edit' && <EditPanel onClose={() => setActivePanel(null)} />}
        {activePanel === 'time' && <TimePanel onClose={() => setActivePanel(null)} />}
        {activePanel === 'merge' && <MergePanel onClose={() => setActivePanel(null)} />}
        {activePanel === 'extract' && <ExtractPanel onClose={() => setActivePanel(null)} />}
        {activePanel === 'elevation' && <ElevationPanel onClose={() => setActivePanel(null)} />}
        {activePanel === 'filter' && <FilterPanel onClose={() => setActivePanel(null)} />}
        {activePanel === 'clean' && <CleanPanel onClose={() => setActivePanel(null)} />}
      </AnimatePresence>
    </div>
  );
});
