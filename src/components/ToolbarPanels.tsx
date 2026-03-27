import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

const Panel: React.FC<PanelProps> = ({ title, onClose, children, footer }) => (
  <motion.div 
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -10 }}
    className="absolute left-14 top-0 w-80 bg-[#0a0a0a] text-white rounded-lg shadow-2xl border border-white/10 overflow-hidden z-[1001]"
  >
    <div className="flex items-center justify-between p-3 border-bottom border-white/5 bg-white/5">
      <div className="flex items-center gap-2 font-medium text-sm">
        {title}
      </div>
      <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors">
        <X size={16} />
      </button>
    </div>
    <div className="p-4 space-y-4">
      {children}
    </div>
    {footer && (
      <div className="p-3 bg-white/5 border-t border-white/5 flex gap-3 items-start relative">
        <HelpCircle size={16} className="text-white/40 shrink-0 mt-0.5" />
        <div className="text-xs text-white/60 leading-relaxed pr-6">
          {footer} <a href="#" className="text-blue-400 hover:underline">More...</a>
        </div>
        <ExternalLink size={14} className="absolute right-3 bottom-3 text-white/40" />
      </div>
    )}
  </motion.div>
);

export const RoutingPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <Panel 
    title="Routing" 
    onClose={onClose}
    footer="Select a trace to use the routing tool, or click on the map to start creating a new route."
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm">
        <Activity size={16} /> Routing
      </div>
      <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer">
        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
      </div>
    </div>
    
    <div className="space-y-2">
      <label className="text-xs text-white/40 uppercase font-bold tracking-wider">Activity</label>
      <select className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none focus:border-blue-500">
        <option>Bike</option>
        <option>Foot</option>
        <option>Car</option>
      </select>
    </div>

    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-white/80">
        <Zap size={16} className="text-white/40" /> Allow private roads
      </div>
      <div className="w-10 h-5 bg-white/10 rounded-full relative cursor-pointer">
        <div className="absolute left-1 top-1 w-3 h-3 bg-white/40 rounded-full" />
      </div>
    </div>

    <div className="grid grid-cols-3 gap-2">
      <button className="flex flex-col items-center gap-1 p-2 bg-white/5 hover:bg-white/10 rounded text-[10px] transition-colors">
        <ArrowLeftRight size={14} /> Reverse
      </button>
      <button className="flex flex-col items-center gap-1 p-2 bg-white/5 hover:bg-white/10 rounded text-[10px] transition-colors">
        <Home size={14} /> Back to start
      </button>
      <button className="flex flex-col items-center gap-1 p-2 bg-white/5 hover:bg-white/10 rounded text-[10px] transition-colors">
        <RotateCcw size={14} /> Round trip
      </button>
    </div>
  </Panel>
);

export const POIPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <Panel 
    title="Points of Interest" 
    onClose={onClose}
    footer="Select a file to create or edit points of interest."
  >
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="text-xs text-white/40">Name</label>
        <input className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none focus:border-blue-500" />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-white/40">Description</label>
        <textarea className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none focus:border-blue-500 h-20 resize-none" />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-white/40">Icon</label>
        <select className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none focus:border-blue-500">
          <option></option>
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs text-white/40">Link</label>
        <input className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none focus:border-blue-500" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-white/40">Latitude</label>
          <input type="number" defaultValue="0" className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none focus:border-blue-500" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-white/40">Longitude</label>
          <input type="number" defaultValue="0" className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none focus:border-blue-500" />
        </div>
      </div>
      <div className="flex gap-2">
        <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-sm transition-colors flex items-center justify-center gap-2">
          <MapPin size={16} /> Create point of interest
        </button>
        <button className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  </Panel>
);

export const EditPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <Panel 
    title="Crop / Split" 
    onClose={onClose}
    footer="Select a trace to crop or split."
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
        <Scissors size={16} /> Crop
      </button>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Split the trace into</span>
          <select className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs outline-none">
            <option>Files</option>
            <option>Tracks</option>
            <option>Segments</option>
          </select>
        </div>
      </div>
    </div>
  </Panel>
);

export const TimePanel: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <Panel 
    title="Time" 
    onClose={onClose}
    footer="Select a single trace to manage its time data."
  >
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Zap size={12} /> Speed
          </div>
          <div className="flex items-center gap-2">
            <input className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none" placeholder="0" />
            <span className="text-xs text-white/40">km/h</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Clock size={12} /> Moving time
          </div>
          <input className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none" placeholder="--:--:--" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs text-white/40">Start</label>
          <div className="flex gap-2">
            <button className="flex-1 bg-white/5 border border-white/10 rounded p-2 text-xs text-left text-white/40">Pick a date</button>
            <select className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs outline-none w-20">
              <option>00:00</option>
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-white/40">End</label>
          <div className="flex gap-2">
            <button className="flex-1 bg-white/5 border border-white/10 rounded p-2 text-xs text-left text-white/40">Pick a date</button>
            <select className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs outline-none w-20">
              <option>00:00</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-white/80">
        <input type="checkbox" className="rounded bg-white/5 border-white/10" defaultChecked />
        Create realistic time data
      </div>

      <div className="flex gap-2">
        <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-sm transition-colors flex items-center justify-center gap-2">
          <Calendar size={16} /> Update time data
        </button>
        <button className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  </Panel>
);

export const MergePanel: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <Panel 
    title="Merge" 
    onClose={onClose}
    footer="Your selection must contain several traces to connect them. Tip: use Ctrl Click to add items to the selection."
  >
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="flex items-center gap-3 text-sm cursor-pointer group">
          <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
          </div>
          <span>Connect the traces</span>
        </label>
        <label className="flex items-center gap-3 text-sm cursor-pointer group opacity-40">
          <div className="w-4 h-4 rounded-full border-2 border-white/20" />
          <span>Merge the contents and keep the traces disconnected</span>
        </label>
      </div>

      <button className="w-full py-2 bg-white/5 border border-white/10 rounded text-sm text-white/20 cursor-not-allowed flex items-center justify-center gap-2">
        <Maximize size={16} /> Merge selection
      </button>
    </div>
  </Panel>
);

export const ExtractPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <Panel 
    title="Extract" 
    onClose={onClose}
    footer="Your selection must contain items with multiple traces to extract them."
  >
    <button className="w-full py-2 bg-white/5 border border-white/10 rounded text-sm text-white/20 cursor-not-allowed flex items-center justify-center gap-2">
      <Layers size={16} /> Extract
    </button>
  </Panel>
);

export const ElevationPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <Panel 
    title="Elevation" 
    onClose={onClose}
    footer="Select a file item to request elevation data."
  >
    <button className="w-full py-2 bg-white/5 border border-white/10 rounded text-sm text-white/20 cursor-not-allowed flex items-center justify-center gap-2">
      <Mountain size={16} /> Request elevation data
    </button>
  </Panel>
);

export const FilterPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <Panel 
    title="Filter" 
    onClose={onClose}
    footer="Select a trace to reduce the number of its GPS points."
  >
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="h-1 bg-white/10 rounded-full relative">
          <div className="absolute left-0 w-1/2 h-full bg-blue-500 rounded-full" />
          <div className="absolute left-1/2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg cursor-pointer" />
        </div>
        <div className="flex justify-between text-[10px] text-white/40">
          <span>Tolerance</span>
          <span>0.0316 km</span>
        </div>
        <div className="flex justify-between text-[10px] text-white/40">
          <span>Number of GPS points</span>
          <span>0/0</span>
        </div>
      </div>

      <button className="w-full py-2 bg-white/5 border border-white/10 rounded text-sm text-white/20 cursor-not-allowed flex items-center justify-center gap-2">
        <Filter size={16} /> Minify
      </button>
    </div>
  </Panel>
);

export const CleanPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <Panel 
    title="Clean" 
    onClose={onClose}
    footer="Clean GPS points and points of interest with a rectangle selection"
  >
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="rounded bg-white/5 border-white/10" defaultChecked />
          Delete GPS points
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="rounded bg-white/5 border-white/10" defaultChecked />
          Delete points of interest
        </label>
      </div>

      <div className="space-y-2 pt-2">
        <label className="flex items-center gap-3 text-sm cursor-pointer">
          <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
          </div>
          <span>Delete inside selection</span>
        </label>
        <label className="flex items-center gap-3 text-sm cursor-pointer opacity-40">
          <div className="w-4 h-4 rounded-full border-2 border-white/20" />
          <span>Delete outside selection</span>
        </label>
      </div>

      <button className="w-full py-2 bg-white/5 border border-white/10 rounded text-sm text-white/20 cursor-not-allowed flex items-center justify-center gap-2">
        <Trash2 size={16} /> Delete
      </button>
    </div>
  </Panel>
);
