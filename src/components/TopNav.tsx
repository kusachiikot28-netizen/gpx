import React, { useState, useRef, useEffect } from 'react';
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
  onUpload: () => void;
  onDeleteAll: () => void;
  onExportAll: () => void;
  onToggleElevation: () => void;
  showElevation: boolean;
  units: 'metric' | 'imperial';
  onToggleUnits: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ 
  onUpload, 
  onDeleteAll, 
  onExportAll, 
  onToggleElevation,
  showElevation,
  units,
  onToggleUnits
}) => {
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

  const Dropdown = ({ children, title }: any) => (
    <div className="absolute top-full mt-2 left-0 min-w-[220px] bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl p-1 z-[2000] animate-in fade-in zoom-in duration-150">
      {children}
    </div>
  );

  return (
    <div ref={menuRef} className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center bg-[#1a1a1a] text-white rounded-lg shadow-2xl px-2 py-1 gap-1 border border-white/10">
      <button className="p-2 hover:bg-white/10 rounded transition-colors text-red-400"><Wand2 size={20} /></button>
      <div className="w-[1px] h-6 bg-white/10 mx-1" />
      
      {/* File Menu */}
      <div className="relative">
        <button 
          onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
          className={cn("p-2 hover:bg-white/10 rounded transition-colors", activeMenu === 'file' && "bg-white/10")}
        >
          <FileText size={20} />
        </button>
        {activeMenu === 'file' && (
          <Dropdown>
            <MenuItem icon={Plus} label="New" shortcut="Ctrl +" />
            <MenuItem icon={FolderOpen} label="Open..." shortcut="Ctrl O" onClick={onUpload} />
            <MenuItem icon={Copy} label="Duplicate" shortcut="Ctrl D" />
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem icon={Trash2} label="Delete" shortcut="Ctrl ⌫" />
            <MenuItem icon={Trash2} label="Delete all" shortcut="⇧ Ctrl ⌫" onClick={onDeleteAll} />
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem icon={Download} label="Export..." shortcut="Ctrl S" />
            <MenuItem icon={Download} label="Export all..." shortcut="⇧ Ctrl S" onClick={onExportAll} />
          </Dropdown>
        )}
      </div>

      {/* Edit Menu */}
      <div className="relative">
        <button 
          onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
          className={cn("p-2 hover:bg-white/10 rounded transition-colors", activeMenu === 'edit' && "bg-white/10")}
        >
          <Edit3 size={20} />
        </button>
        {activeMenu === 'edit' && (
          <Dropdown>
            <MenuItem icon={Undo2} label="Undo" shortcut="Ctrl Z" />
            <MenuItem icon={Redo2} label="Redo" shortcut="⇧ Ctrl Z" />
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem icon={Info} label="Info..." shortcut="Ctrl I" />
            <MenuItem icon={Palette} label="Appearance..." />
            <MenuItem icon={EyeOff} label="Unhide" shortcut="Ctrl H" />
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem icon={MousePointer} label="Select all" shortcut="Ctrl A" />
            <MenuItem icon={Target} label="Center" shortcut="Ctrl ↵" />
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem icon={Trash2} label="Delete" shortcut="Ctrl ⌫" color="text-red-400" />
          </Dropdown>
        )}
      </div>

      {/* View Menu */}
      <div className="relative">
        <button 
          onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
          className={cn("p-2 hover:bg-white/10 rounded transition-colors", activeMenu === 'view' && "bg-white/10")}
        >
          <Eye size={20} />
        </button>
        {activeMenu === 'view' && (
          <Dropdown>
            <MenuItem active={showElevation} label="Elevation profile" shortcut="Ctrl P" onClick={onToggleElevation} />
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem icon={MapIcon} label="Switch to previous basemap" shortcut="F1" />
            <MenuItem icon={Layers} label="Toggle overlays" shortcut="F2" />
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem icon={Ruler} label="Distance markers" shortcut="F3" />
            <MenuItem icon={Navigation} label="Direction arrows" shortcut="F4" />
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem icon={Box} label="Toggle 3D" shortcut="Ctrl Drag" />
          </Dropdown>
        )}
      </div>

      {/* Settings Menu */}
      <div className="relative">
        <button 
          onClick={() => setActiveMenu(activeMenu === 'settings' ? null : 'settings')}
          className={cn("p-2 hover:bg-white/10 rounded transition-colors", activeMenu === 'settings' && "bg-white/10")}
        >
          <Settings size={20} />
        </button>
        {activeMenu === 'settings' && (
          <Dropdown>
            <MenuItem 
              icon={RulerIcon} 
              label={`Distance units (${units === 'metric' ? 'Metric' : 'Imperial'})`} 
              onClick={onToggleUnits}
            />
            <MenuItem icon={Zap} label="Velocity units" hasSubmenu />
            <MenuItem icon={Thermometer} label="Temperature units" hasSubmenu />
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem icon={Languages} label="Language" hasSubmenu />
            <MenuItem icon={Moon} label="Theme" hasSubmenu />
            <div className="h-[1px] bg-white/10 my-1" />
            <MenuItem icon={User} label="Street view source" hasSubmenu />
            <MenuItem icon={Layers} label="Map layers..." />
          </Dropdown>
        )}
      </div>

      <button className="p-2 hover:bg-white/10 rounded transition-colors"><BookOpen size={20} /></button>
      <button className="p-2 hover:bg-white/10 rounded transition-colors text-pink-400"><Heart size={20} /></button>
    </div>
  );
};
