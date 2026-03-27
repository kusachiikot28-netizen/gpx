import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../contexts/LanguageContext';
import { 
  Activity, ArrowLeftRight, Home, RotateCcw, 
  HelpCircle, ExternalLink, X, Calendar, 
  Clock, Zap, Trash2, Mountain, Filter,
  MousePointer2, Scissors, Maximize, Layers,
  MapPin, Edit2
} from 'lucide-react';
import { cn } from '../lib/utils';

interface PanelProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: string;
}

const Panel: React.FC<PanelProps> = ({ title, onClose, children, footer }) => {
  const { t } = useTranslation();
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="absolute left-14 top-0 w-[calc(100vw-80px)] sm:w-80 bg-[#0a0a0a] text-white rounded-lg shadow-2xl border border-white/10 overflow-hidden z-[1001]"
    >
      <div className="flex items-center justify-between p-3 border-bottom border-white/5 bg-white/5">
        <div className="flex items-center gap-2 font-medium text-sm">
          {title}
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors">
          <X size={16} />
        </button>
      </div>
      <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
        {children}
      </div>
      {footer && (
        <div className="p-3 bg-white/5 border-t border-white/5 flex gap-3 items-start relative">
          <HelpCircle size={16} className="text-white/40 shrink-0 mt-0.5" />
          <div className="text-xs text-white/60 leading-relaxed pr-6">
            {footer} <a href="#" className="text-blue-400 hover:underline">{t('more')}</a>
          </div>
          <ExternalLink size={14} className="absolute right-3 bottom-3 text-white/40" />
        </div>
      )}
    </motion.div>
  );
};

export const RoutingPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useTranslation();
  return (
    <Panel 
      title={t('routing')} 
      onClose={onClose}
      footer={t('routingFooter')}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Activity size={16} /> {t('routing')}
        </div>
        <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer">
          <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-xs text-white/40 uppercase font-bold tracking-wider">{t('activity')}</label>
        <select className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none focus:border-blue-500">
          <option>{t('bike')}</option>
          <option>{t('foot')}</option>
          <option>{t('car')}</option>
        </select>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-white/80">
          <Zap size={16} className="text-white/40" /> {t('allowPrivate')}
        </div>
        <div className="w-10 h-5 bg-white/10 rounded-full relative cursor-pointer">
          <div className="absolute left-1 top-1 w-3 h-3 bg-white/40 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button className="flex flex-col items-center gap-1 p-2 bg-white/5 hover:bg-white/10 rounded text-[10px] transition-colors">
          <ArrowLeftRight size={14} /> {t('reverse')}
        </button>
        <button className="flex flex-col items-center gap-1 p-2 bg-white/5 hover:bg-white/10 rounded text-[10px] transition-colors">
          <Home size={14} /> {t('backToStart')}
        </button>
        <button className="flex flex-col items-center gap-1 p-2 bg-white/5 hover:bg-white/10 rounded text-[10px] transition-colors">
          <RotateCcw size={14} /> {t('roundTrip')}
        </button>
      </div>
    </Panel>
  );
};

export const POIPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useTranslation();
  return (
    <Panel 
      title={t('poi')} 
      onClose={onClose}
      footer={t('poiFooter')}
    >
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs text-white/40">{t('name')}</label>
          <input className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none focus:border-blue-500" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-white/40">{t('description')}</label>
          <textarea className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none focus:border-blue-500 h-20 resize-none" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-white/40">{t('icon')}</label>
          <select className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none focus:border-blue-500">
            <option></option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-white/40">{t('link')}</label>
          <input className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none focus:border-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-white/40">{t('latitude')}</label>
            <input type="number" defaultValue="0" className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none focus:border-blue-500" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-white/40">{t('longitude')}</label>
            <input type="number" defaultValue="0" className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none focus:border-blue-500" />
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-sm transition-colors flex items-center justify-center gap-2">
            <MapPin size={16} /> {t('createPoi')}
          </button>
          <button className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>
    </Panel>
  );
};

export const EditPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useTranslation();
  return (
    <Panel 
      title={t('cropSplit')} 
      onClose={onClose}
      footer={t('cropSplitFooter')}
    >
      <div className="space-y-6 py-2">
        <div className="px-2">
          <div className="h-1 bg-white/10 rounded-full relative">
            <div className="absolute left-[10%] right-[10%] h-full bg-blue-500 rounded-full" />
            <div className="absolute left-[10%] top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg cursor-pointer border-2 border-blue-500" />
            <div className="absolute right-[10%] top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg cursor-pointer border-2 border-blue-500" />
          </div>
        </div>
        
        <button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-sm transition-colors flex items-center justify-center gap-2">
          <Scissors size={16} /> {t('crop')}
        </button>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">{t('splitInto')}</span>
            <select className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs outline-none">
              <option>{t('files')}</option>
              <option>{t('tracks')}</option>
              <option>{t('segments')}</option>
            </select>
          </div>
        </div>
      </div>
    </Panel>
  );
};

export const TimePanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useTranslation();
  return (
    <Panel 
      title={t('time')} 
      onClose={onClose}
      footer={t('timeFooter')}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Zap size={12} /> {t('speed')}
            </div>
            <div className="flex items-center gap-2">
              <input className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none" placeholder="0" />
              <span className="text-xs text-white/40">km/h</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Clock size={12} /> {t('movingTime')}
            </div>
            <input className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none" placeholder="--:--:--" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-white/40">{t('start')}</label>
            <div className="flex gap-2">
              <button className="flex-1 bg-white/5 border border-white/10 rounded p-2 text-xs text-left text-white/40">{t('pickDate')}</button>
              <select className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs outline-none w-20">
                <option>00:00</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-white/40">{t('end')}</label>
            <div className="flex gap-2">
              <button className="flex-1 bg-white/5 border border-white/10 rounded p-2 text-xs text-left text-white/40">{t('pickDate')}</button>
              <select className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs outline-none w-20">
                <option>00:00</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-white/80">
          <input type="checkbox" className="rounded bg-white/5 border-white/10" defaultChecked />
          {t('realisticTime')}
        </div>

        <div className="flex gap-2">
          <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-sm transition-colors flex items-center justify-center gap-2">
            <Calendar size={16} /> {t('updateTime')}
          </button>
          <button className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>
    </Panel>
  );
};

export const MergePanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useTranslation();
  return (
    <Panel 
      title={t('merge')} 
      onClose={onClose}
      footer={t('mergeFooter')}
    >
      <div className="space-y-4">
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-sm cursor-pointer group">
            <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            </div>
            <span>{t('connectTraces')}</span>
          </label>
          <label className="flex items-center gap-3 text-sm cursor-pointer group opacity-40">
            <div className="w-4 h-4 rounded-full border-2 border-white/20" />
            <span>{t('mergeKeepDisconnected')}</span>
          </label>
        </div>

        <button className="w-full py-2 bg-white/5 border border-white/10 rounded text-sm text-white/20 cursor-not-allowed flex items-center justify-center gap-2">
          <Maximize size={16} /> {t('mergeSelection')}
        </button>
      </div>
    </Panel>
  );
};

export const ExtractPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useTranslation();
  return (
    <Panel 
      title={t('extract')} 
      onClose={onClose}
      footer={t('extractFooter')}
    >
      <button className="w-full py-2 bg-white/5 border border-white/10 rounded text-sm text-white/20 cursor-not-allowed flex items-center justify-center gap-2">
        <Layers size={16} /> {t('extract')}
      </button>
    </Panel>
  );
};

export const ElevationPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useTranslation();
  return (
    <Panel 
      title={t('elevation')} 
      onClose={onClose}
      footer={t('elevationFooter')}
    >
      <button className="w-full py-2 bg-white/5 border border-white/10 rounded text-sm text-white/20 cursor-not-allowed flex items-center justify-center gap-2">
        <Mountain size={16} /> {t('requestElevation')}
      </button>
    </Panel>
  );
};

export const FilterPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useTranslation();
  return (
    <Panel 
      title={t('filter')} 
      onClose={onClose}
      footer={t('filterFooter')}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-1 bg-white/10 rounded-full relative">
            <div className="absolute left-0 w-1/2 h-full bg-blue-500 rounded-full" />
            <div className="absolute left-1/2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg cursor-pointer" />
          </div>
          <div className="flex justify-between text-[10px] text-white/40">
            <span>{t('tolerance')}</span>
            <span>0.0316 km</span>
          </div>
          <div className="flex justify-between text-[10px] text-white/40">
            <span>{t('numGpsPoints')}</span>
            <span>0/0</span>
          </div>
        </div>

        <button className="w-full py-2 bg-white/5 border border-white/10 rounded text-sm text-white/20 cursor-not-allowed flex items-center justify-center gap-2">
          <Filter size={16} /> {t('minify')}
        </button>
      </div>
    </Panel>
  );
};

export const CleanPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useTranslation();
  return (
    <Panel 
      title={t('clean')} 
      onClose={onClose}
      footer={t('cleanFooter')}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded bg-white/5 border-white/10" defaultChecked />
            {t('deleteGpsPoints')}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded bg-white/5 border-white/10" defaultChecked />
            {t('deletePoi')}
          </label>
        </div>

        <div className="space-y-2 pt-2">
          <label className="flex items-center gap-3 text-sm cursor-pointer">
            <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            </div>
            <span>{t('deleteInside')}</span>
          </label>
          <label className="flex items-center gap-3 text-sm cursor-pointer opacity-40">
            <div className="w-4 h-4 rounded-full border-2 border-white/20" />
            <span>{t('deleteOutside')}</span>
          </label>
        </div>

        <button className="w-full py-2 bg-white/5 border border-white/10 rounded text-sm text-white/20 cursor-not-allowed flex items-center justify-center gap-2">
          <Trash2 size={16} /> {t('delete')}
        </button>
      </div>
    </Panel>
  );
};
