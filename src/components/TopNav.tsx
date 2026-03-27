import React, { useState, useRef, useEffect } from 'react';
import { useTranslation, Language } from '../contexts/LanguageContext';
import { 
  Wand2, FileText, Edit3, Eye, Settings, BookOpen, Heart, 
  Plus, FolderOpen, Copy, Trash2, Download, Undo2, Redo2, 
  Info, Palette, EyeOff, MousePointer, Target, 
  Activity, ListTree, Map as MapIcon, Layers, Ruler, 
  Navigation, Box, Ruler as RulerIcon, Zap, Thermometer, 
  Languages, Moon, User, ChevronRight, Check
} from 'lucide-react';
import { cn } from '../lib/utils';

interface TopNavProps {
  onNew: () => void;
  onUpload: () => void;
  onDeleteAll: () => void;
  onExportAll: () => void;
  onToggleElevation: () => void;
  showElevation: boolean;
  units: 'metric' | 'imperial';
  onToggleUnits: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ 
  onNew,
  onUpload, 
  onDeleteAll, 
  onExportAll, 
  onToggleElevation,
  showElevation,
  units,
  onToggleUnits
}) => {
  const { t, language, setLanguage } = useTranslation();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const MenuItem = ({ icon: Icon, label, shortcut, onClick, active, hasSubmenu, color }: any) => (
    <button 
      onClick={(e) => {
        if (!hasSubmenu) {
          onClick?.();
          setActiveMenu(null);
        }
      }}
      className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/10 rounded text-sm transition-colors group"
    >
      <div className="flex items-center gap-3">
        {active !== undefined ? (
          <div className="w-4 flex justify-center">
            {active && <Check size={14} />}
          </div>
        ) : (
          <Icon size={16} className={cn("opacity-70 group-hover:opacity-100", color)} />
        )}
        <span className={cn(color)}>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {shortcut && <span className="text-[10px] opacity-40 font-mono bg-white/5 px-1 rounded">{shortcut}</span>}
        {hasSubmenu && <ChevronRight size={14} className="opacity-40" />}
      </div>
    </button>
  );

  const Dropdown = ({ children, title, isSubmenu }: any) => (
    <div className={cn(
      "absolute bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl p-1 z-[2000] animate-in fade-in zoom-in duration-150",
      isSubmenu ? "left-full top-0 ml-1 sm:block hidden" : "top-full mt-2 left-0 min-w-[220px]",
      isSubmenu && "group-hover/lang:block"
    )}>
      {children}
    </div>
  );

  return (
    <div ref={menuRef} className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center bg-[#1a1a1a] text-white rounded-lg shadow-2xl px-1 sm:px-2 py-1 gap-0.5 sm:gap-1 border border-white/10 max-w-[95vw] overflow-x-auto no-scrollbar">
      <button className="p-1.5 sm:p-2 hover:bg-white/10 rounded transition-colors text-red-400 shrink-0"><Wand2 size={18} className="sm:w-5 sm:h-5" /></button>
      <div className="w-[1px] h-5 sm:h-6 bg-white/10 mx-0.5 sm:mx-1 shrink-0" />
      
      {/* File Menu */}
      <div className="relative">
        <button 
          onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
          className={cn("px-2 sm:px-3 py-1 hover:bg-white/10 rounded transition-colors text-xs sm:text-sm font-medium whitespace-nowrap", activeMenu === 'file' && "bg-white/10")}
        >
          {t('file')}
        </button>
        {activeMenu === 'file' && (
          <Dropdown>
            <MenuItem icon={Plus} label={t('new')} shortcut="Ctrl +" onClick={onNew} />
            <MenuItem icon={FolderOpen} label={t('open')} shortcut="Ctrl O" onClick={onUpload} />
            <MenuItem icon={Copy} label={t('duplicate')} shortcut="Ctrl D" />
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem icon={Trash2} label={t('delete')} shortcut="Ctrl ⌫" />
            <MenuItem icon={Trash2} label={t('deleteAll')} shortcut="⇧ Ctrl ⌫" onClick={onDeleteAll} />
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem icon={Download} label={t('export')} shortcut="Ctrl S" />
            <MenuItem icon={Download} label={t('exportAll')} shortcut="⇧ Ctrl S" onClick={onExportAll} />
          </Dropdown>
        )}
      </div>

      {/* Edit Menu */}
      <div className="relative">
        <button 
          onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
          className={cn("px-2 sm:px-3 py-1 hover:bg-white/10 rounded transition-colors text-xs sm:text-sm font-medium whitespace-nowrap", activeMenu === 'edit' && "bg-white/10")}
        >
          {t('edit')}
        </button>
        {activeMenu === 'edit' && (
          <Dropdown>
            <MenuItem icon={Undo2} label={t('undo')} shortcut="Ctrl Z" />
            <MenuItem icon={Redo2} label={t('redo')} shortcut="⇧ Ctrl Z" />
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem icon={Info} label={t('info')} shortcut="Ctrl I" />
            <MenuItem icon={Palette} label={t('appearance')} />
            <MenuItem icon={EyeOff} label={t('unhide')} shortcut="Ctrl H" />
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem icon={MousePointer} label={t('selectAll')} shortcut="Ctrl A" />
            <MenuItem icon={Target} label={t('center')} shortcut="Ctrl ↵" />
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem icon={Trash2} label={t('delete')} shortcut="Ctrl ⌫" color="text-red-400" />
          </Dropdown>
        )}
      </div>

      {/* View Menu */}
      <div className="relative">
        <button 
          onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
          className={cn("px-2 sm:px-3 py-1 hover:bg-white/10 rounded transition-colors text-xs sm:text-sm font-medium whitespace-nowrap", activeMenu === 'view' && "bg-white/10")}
        >
          {t('view')}
        </button>
        {activeMenu === 'view' && (
          <Dropdown>
            <MenuItem active={showElevation} label={t('elevationProfile')} shortcut="Ctrl P" onClick={onToggleElevation} />
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem icon={MapIcon} label={t('previousBasemap')} shortcut="F1" />
            <MenuItem icon={Layers} label={t('toggleOverlays')} shortcut="F2" />
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem icon={Ruler} label={t('distanceMarkers')} shortcut="F3" />
            <MenuItem icon={Navigation} label={t('directionArrows')} shortcut="F4" />
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem icon={Box} label={t('toggle3D')} shortcut="Ctrl Drag" />
          </Dropdown>
        )}
      </div>

      {/* Settings Menu */}
      <div className="relative">
        <button 
          onClick={() => setActiveMenu(activeMenu === 'settings' ? null : 'settings')}
          className={cn("px-2 sm:px-3 py-1 hover:bg-white/10 rounded transition-colors text-xs sm:text-sm font-medium whitespace-nowrap", activeMenu === 'settings' && "bg-white/10")}
        >
          {t('settings')}
        </button>
        {activeMenu === 'settings' && (
          <Dropdown>
            <MenuItem 
              icon={RulerIcon} 
              label={`${t('distanceUnits')} (${units === 'metric' ? 'Metric' : 'Imperial'})`} 
              onClick={onToggleUnits}
            />
            <MenuItem icon={Zap} label={t('velocityUnits')} hasSubmenu />
            <MenuItem icon={Thermometer} label={t('temperatureUnits')} hasSubmenu />
            <div className="h-[1px] bg-white/10 my-1" />
            <div className="relative group/lang">
              <MenuItem icon={Languages} label={t('language')} hasSubmenu />
              <div className="absolute left-full top-0 ml-1 hidden group-hover/lang:block min-w-[150px] bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl p-1 sm:block">
                <MenuItem active={language === 'en'} label="English" onClick={() => setLanguage('en')} />
                <MenuItem active={language === 'de'} label="Deutsch" onClick={() => setLanguage('de')} />
                <MenuItem active={language === 'fr'} label="Français" onClick={() => setLanguage('fr')} />
                <MenuItem active={language === 'ru'} label="Русский" onClick={() => setLanguage('ru')} />
              </div>
              {/* Mobile language list - simplified for now */}
              <div className="sm:hidden pl-8 space-y-1 mt-1">
                <button onClick={() => setLanguage('en')} className={cn("text-xs block py-1", language === 'en' ? "text-blue-400" : "text-white/60")}>English</button>
                <button onClick={() => setLanguage('de')} className={cn("text-xs block py-1", language === 'de' ? "text-blue-400" : "text-white/60")}>Deutsch</button>
                <button onClick={() => setLanguage('fr')} className={cn("text-xs block py-1", language === 'fr' ? "text-blue-400" : "text-white/60")}>Français</button>
                <button onClick={() => setLanguage('ru')} className={cn("text-xs block py-1", language === 'ru' ? "text-blue-400" : "text-white/60")}>Русский</button>
              </div>
            </div>
            <MenuItem icon={Moon} label={t('theme')} hasSubmenu />
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem icon={User} label={t('streetView')} hasSubmenu />
            <MenuItem icon={Layers} label={t('mapLayers')} />
          </Dropdown>
        )}
      </div>

      <button className="p-1.5 sm:p-2 hover:bg-white/10 rounded transition-colors shrink-0"><BookOpen size={18} className="sm:w-5 sm:h-5" /></button>
      <button className="p-1.5 sm:p-2 hover:bg-white/10 rounded transition-colors text-pink-400 shrink-0"><Heart size={18} className="sm:w-5 sm:h-5" /></button>
    </div>
  );
};
