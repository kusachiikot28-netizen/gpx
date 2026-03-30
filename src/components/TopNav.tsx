import React, { useState, useRef, useEffect } from 'react';
import { useTranslation, Language } from '../contexts/LanguageContext';
import { 
  Wand2, FileText, Edit3, Eye, Settings, BookOpen, Heart, 
  Plus, FolderOpen, Copy, Trash2, Download, Undo2, Redo2, 
  Info, Palette, EyeOff, MousePointer, Target, 
  Activity, ListTree, Map as MapIcon, Layers, Ruler, 
  Navigation, Box, Ruler as RulerIcon, Zap, Thermometer, 
  Languages, Moon, User, ChevronRight, Check, Link
} from 'lucide-react';
import { cn } from '../lib/utils';

interface TopNavProps {
  onNew: () => void;
  onUpload: () => void;
  onUrlImport: () => void;
  onDuplicate: () => void;
  onDeleteAll: () => void;
  onExportAll: () => void;
  onToggleElevation: () => void;
  showElevation: boolean;
  onToggleFileTree: () => void;
  showFileTree: boolean;
  onToggleDirectionArrows: () => void;
  showDirectionArrows: boolean;
  onToggleDistanceMarkers: () => void;
  showDistanceMarkers: boolean;
  elevationMode: 'elevation' | 'slope';
  onSetElevationMode: (mode: 'elevation' | 'slope') => void;
  units: 'metric' | 'imperial';
  onToggleUnits: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onDeleteSelected: () => void;
  onExportSelected: () => void;
  onHideSelected: () => void;
  onUnhideSelected: () => void;
  onSelectAll: () => void;
  onCenter: () => void;
  isSelectedHidden: boolean;
  hasSelection: boolean;
}

export const TopNav: React.FC<TopNavProps> = React.memo(({ 
  onNew,
  onUpload, 
  onUrlImport,
  onDuplicate,
  onDeleteAll, 
  onExportAll, 
  onToggleElevation,
  showElevation,
  onToggleFileTree,
  showFileTree,
  onToggleDirectionArrows,
  showDirectionArrows,
  onToggleDistanceMarkers,
  showDistanceMarkers,
  elevationMode,
  onSetElevationMode,
  units,
  onToggleUnits,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onDeleteSelected,
  onExportSelected,
  onHideSelected,
  onUnhideSelected,
  onSelectAll,
  onCenter,
  isSelectedHidden,
  hasSelection
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

  const MenuItem = ({ icon: Icon, label, shortcut, onClick, active, hasSubmenu, color, disabled }: any) => (
    <button 
      disabled={disabled}
      onClick={(e) => {
        if (!hasSubmenu && !disabled) {
          onClick?.();
          setActiveMenu(null);
        }
      }}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2 rounded text-sm transition-colors group",
        disabled ? "cursor-not-allowed opacity-50" : "hover:bg-white/10 cursor-pointer"
      )}
    >
      <div className="flex items-center gap-3">
        {active !== undefined ? (
          <div className="w-4 flex justify-center">
            {active && <Check size={14} />}
          </div>
        ) : (
          <Icon size={16} className={cn("opacity-70 group-hover:opacity-100", color)} />
        )}
        <span className={cn(color, active === false && "text-white/40")}>{label}</span>
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
    <div ref={menuRef} className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center bg-[#1a1a1a] text-white rounded-lg shadow-2xl px-1 sm:px-2 py-1 gap-0.5 sm:gap-1 border border-white/10 max-w-[98vw] w-max">
      <button type="button" className="p-1.5 sm:p-2 hover:bg-white/10 rounded transition-colors text-red-400 shrink-0"><Wand2 size={18} className="sm:w-5 sm:h-5" /></button>
      <div className="w-[1px] h-5 sm:h-6 bg-white/10 mx-0.5 sm:mx-1 shrink-0" />
      
      {/* File Menu */}
      <div className="relative">
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveMenu(activeMenu === 'file' ? null : 'file');
          }}
          className={cn("px-2 sm:px-3 py-1 hover:bg-white/10 rounded transition-colors text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer", activeMenu === 'file' && "bg-white/10")}
        >
          {t('file')}
        </button>
        {activeMenu === 'file' && (
          <Dropdown>
            <MenuItem icon={Plus} label={t('new')} shortcut="Ctrl +" onClick={onNew} />
            <MenuItem icon={FolderOpen} label={t('open')} shortcut="Ctrl O" onClick={onUpload} />
            <MenuItem icon={Link} label={t('importUrl')} onClick={onUrlImport} />
            <MenuItem icon={Copy} label={t('duplicate')} shortcut="Ctrl D" onClick={onDuplicate} disabled={!hasSelection} />
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem icon={Trash2} label={t('delete')} shortcut="Ctrl ⌫" onClick={onDeleteSelected} disabled={!hasSelection} />
            <MenuItem icon={Trash2} label={t('deleteAll')} shortcut="⇧ Ctrl ⌫" onClick={onDeleteAll} />
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem icon={Download} label={t('export')} shortcut="Ctrl S" onClick={onExportSelected} disabled={!hasSelection} />
            <MenuItem icon={Download} label={t('exportAll')} shortcut="⇧ Ctrl S" onClick={onExportAll} />
          </Dropdown>
        )}
      </div>

      {/* Edit Menu */}
      <div className="relative">
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveMenu(activeMenu === 'edit' ? null : 'edit');
          }}
          className={cn("px-2 sm:px-3 py-1 hover:bg-white/10 rounded transition-colors text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer", activeMenu === 'edit' && "bg-white/10")}
        >
          {t('edit')}
        </button>
        {activeMenu === 'edit' && (
          <Dropdown>
            <MenuItem 
              icon={Undo2} 
              label={t('undo')} 
              shortcut="Ctrl Z" 
              onClick={onUndo} 
              disabled={!canUndo}
              color={!canUndo ? "opacity-30" : ""}
            />
            <MenuItem 
              icon={Redo2} 
              label={t('redo')} 
              shortcut="⇧ Ctrl Z" 
              onClick={onRedo} 
              disabled={!canRedo}
              color={!canRedo ? "opacity-30" : ""}
            />
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem icon={Info} label={t('info')} shortcut="Ctrl I" />
            <MenuItem icon={Palette} label={t('appearance')} />
            {isSelectedHidden ? (
              <MenuItem icon={Eye} label={t('unhide')} shortcut="Ctrl H" onClick={onUnhideSelected} disabled={!hasSelection} />
            ) : (
              <MenuItem icon={EyeOff} label={t('hide')} shortcut="Ctrl H" onClick={onHideSelected} disabled={!hasSelection} />
            )}
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem icon={MousePointer} label={t('selectAll')} shortcut="Ctrl A" onClick={onSelectAll} />
            <MenuItem icon={Target} label={t('center')} shortcut="Ctrl ↵" onClick={onCenter} />
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem icon={Trash2} label={t('delete')} shortcut="Ctrl ⌫" color="text-red-400" onClick={onDeleteSelected} disabled={!hasSelection} />
          </Dropdown>
        )}
      </div>

      {/* View Menu */}
      <div className="relative">
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveMenu(activeMenu === 'view' ? null : 'view');
          }}
          className={cn("px-2 sm:px-3 py-1 hover:bg-white/10 rounded transition-colors text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer", activeMenu === 'view' && "bg-white/10")}
        >
          {t('view')}
        </button>
        {activeMenu === 'view' && (
          <Dropdown>
            <MenuItem active={showElevation} label={t('elevationProfile')} shortcut="Ctrl P" onClick={onToggleElevation} />
            <MenuItem active={showFileTree} label={t('fileTree')} shortcut="Ctrl T" onClick={onToggleFileTree} />
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem icon={MapIcon} label={t('previousBasemap')} shortcut="F1" />
            <MenuItem icon={Layers} label={t('toggleOverlays')} shortcut="F2" />
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem 
              icon={Ruler} 
              label={t('distanceMarkers')} 
              shortcut="F3" 
              active={showDistanceMarkers}
              onClick={onToggleDistanceMarkers}
            />
            <MenuItem 
              icon={Navigation} 
              label={t('directionArrows')} 
              shortcut="F4" 
              active={showDirectionArrows} 
              onClick={onToggleDirectionArrows} 
            />
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem icon={Box} label={t('toggle3D')} shortcut="Ctrl Drag" />
          </Dropdown>
        )}
      </div>

      {/* Settings Menu */}
      <div className="relative">
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveMenu(activeMenu === 'settings' ? null : 'settings');
          }}
          className={cn("px-2 sm:px-3 py-1 hover:bg-white/10 rounded transition-colors text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer", activeMenu === 'settings' && "bg-white/10")}
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
                <button type="button" onClick={() => { setLanguage('en'); setActiveMenu(null); }} className={cn("text-xs block py-1 w-full text-left", language === 'en' ? "text-blue-400" : "text-white/60")}>English</button>
                <button type="button" onClick={() => { setLanguage('de'); setActiveMenu(null); }} className={cn("text-xs block py-1 w-full text-left", language === 'de' ? "text-blue-400" : "text-white/60")}>Deutsch</button>
                <button type="button" onClick={() => { setLanguage('fr'); setActiveMenu(null); }} className={cn("text-xs block py-1 w-full text-left", language === 'fr' ? "text-blue-400" : "text-white/60")}>Français</button>
                <button type="button" onClick={() => { setLanguage('ru'); setActiveMenu(null); }} className={cn("text-xs block py-1 w-full text-left", language === 'ru' ? "text-blue-400" : "text-white/60")}>Русский</button>
              </div>
            </div>
            <MenuItem icon={Moon} label={t('theme')} hasSubmenu />
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem icon={User} label={t('streetView')} hasSubmenu />
            <MenuItem icon={Layers} label={t('mapLayers')} />
          </Dropdown>
        )}
      </div>

      <button type="button" className="p-1.5 sm:p-2 hover:bg-white/10 rounded transition-colors shrink-0"><BookOpen size={18} className="sm:w-5 sm:h-5" /></button>
      <button type="button" className="p-1.5 sm:p-2 hover:bg-white/10 rounded transition-colors text-pink-400 shrink-0"><Heart size={18} className="sm:w-5 sm:h-5" /></button>
    </div>
  );
});
