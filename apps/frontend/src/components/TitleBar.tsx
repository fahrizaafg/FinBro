import { Minus, X } from 'lucide-react';
import { translations } from '../lib/translations';
import { useApp } from '../context/AppContext';

export default function TitleBar() {
  const isElectron = typeof window !== 'undefined' && window.electronAPI;
  const { settings } = useApp();
  const t = translations[settings.language];

  if (!isElectron) return null;

  return (
    <div className="h-10 w-full flex items-center justify-between select-none z-50 relative draggable bg-[#4B0080]/20 backdrop-blur-md border-b border-white/5 rounded-t-lg">
      {/* Label Aplikasi */}
      <div className="px-4 flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#9370DB] to-[#6A0DAD] opacity-80 blur-[1px]" />
        <span className="text-sm font-medium tracking-wide text-white/90 font-sans blur-[0.3px]">
          {t.common.appName}
        </span>
      </div>

      {/* Window Controls */}
      <div className="flex items-center h-full no-drag">
        {/* Minimize Button */}
        <button
          onClick={() => window.electronAPI?.minimize()}
          className="h-full w-12 flex items-center justify-center hover:bg-white/5 transition-colors group"
          title={t.common.minimize}
        >
          <Minus size={16} className="text-[#9370DB] opacity-80 group-hover:opacity-100" strokeWidth={3} />
        </button>

        {/* Maximize Button */}
        <button
          onClick={() => window.electronAPI?.maximize()}
          className="h-full w-12 flex items-center justify-center hover:bg-white/10 transition-colors group"
          title={t.common.maximize}
        >
          <div className="w-3.5 h-3.5 border-2 border-[#4B0080] rounded-[2px] group-hover:shadow-[0_0_8px_rgba(147,112,219,0.3)] transition-shadow" />
        </button>

        {/* Close Button */}
        <button
          onClick={() => window.electronAPI?.close()}
          className="h-full w-12 flex items-center justify-center bg-[#4B0080] hover:bg-red-500/80 transition-all duration-300 group rounded-tr-lg"
          title={t.common.close}
        >
          <X 
            size={16} 
            className="text-white group-hover:text-white group-hover:drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]" 
            strokeWidth={2.5} 
          />
        </button>
      </div>
    </div>
  );
}
