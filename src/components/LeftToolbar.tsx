import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Edit2, MapPin, Scissors, Clock, Maximize, 
  Layers, Mountain, Filter, MousePointer2, Upload 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from '../contexts/LanguageContext';
import { 
  RoutingPanel, POIPanel, EditPanel, TimePanel, 
  MergePanel, ExtractPanel, ElevationPanel, FilterPanel, CleanPanel 
} from './ToolbarPanels';

interface LeftToolbarProps {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

type ActivePanel = 'routing' | 'poi' | 'edit' | 'time' | 'merge' | 'extract' | 'elevation' | 'filter' | 'clean' | null;

export const LeftToolbar: React.FC<LeftToolbarProps> = ({ onUpload }) => {
  const { t } = useTranslation();
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  const togglePanel = (panel: ActivePanel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  return (
    <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-1">
      <div className="flex flex-col bg-[#1a1a1a] text-white rounded-lg shadow-2xl p-0.5 sm:p-1 gap-0.5 sm:gap-1 border border-white/10">
        <button 
          onClick={() => togglePanel('routing')}
          className={cn("p-1.5 sm:p-2 hover:bg-white/10 rounded transition-colors", activePanel === 'routing' && "bg-blue-600 hover:bg-blue-700")}
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
        <label className="p-1.5 sm:p-2 hover:bg-white/10 rounded transition-colors cursor-pointer" title={t('open')}>
          <Upload size={18} className="sm:w-5 sm:h-5" />
          <input type="file" accept=".gpx" className="hidden" onChange={onUpload} />
        </label>
      </div>

      <AnimatePresence>
        {activePanel === 'routing' && <RoutingPanel onClose={() => setActivePanel(null)} />}
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
};
