import { RotateCcw, RotateCw, History } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { translations } from '../lib/translations';

export default function UndoRedoControls() {
    const { undo, redo, canUndo, canRedo, history, settings } = useApp();
    const t = translations[settings.language];
    const [showHistory, setShowHistory] = useState(false);

    // Get the last action name for tooltip
    const lastAction = canUndo ? history[history.length - 1].name : null;
    
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            {/* History Popover */}
            {showHistory && (
                <div className="mb-2 w-64 glass-card bg-[#1a1625] border border-white/10 rounded-xl overflow-hidden shadow-2xl p-0 animate-fade-in-up">
                    <div className="p-3 border-b border-white/10 bg-white/5 flex items-center gap-2">
                        <History size={14} className="text-primary" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">{t.common.history}</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                        {history.length === 0 ? (
                            <div className="p-4 text-center text-xs text-gray-500 italic">{t.common.noActions}</div>
                        ) : (
                            [...history].reverse().map((cmd) => (
                                <div key={cmd.id} className="text-xs text-gray-300 p-2 hover:bg-white/5 rounded-lg border-b border-white/5 last:border-0 flex justify-between gap-2">
                                    <span className="truncate">{cmd.name}</span>
                                    <span className="text-gray-600 font-mono text-[10px] whitespace-nowrap">
                                        {new Date(cmd.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <div className="flex items-center gap-2 bg-[#1a1625] border border-white/10 p-1.5 rounded-xl shadow-xl backdrop-blur-md">
                 <button
                    onClick={() => setShowHistory(!showHistory)}
                    className={cn(
                        "p-2 rounded-lg transition-colors relative",
                        showHistory ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                    title={t.common.history}
                >
                    <History size={18} />
                    {history.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                    )}
                </button>
                
                <div className="w-px h-6 bg-white/10 mx-1" />

                <button
                    onClick={undo}
                    disabled={!canUndo}
                    className={cn(
                        "p-2 rounded-lg transition-colors group relative",
                        !canUndo ? "text-gray-600 cursor-not-allowed" : "text-gray-300 hover:text-white hover:bg-white/10"
                    )}
                    title={lastAction ? `${t.common.undo}: ${lastAction} (Ctrl+Z)` : `${t.common.undo} (Ctrl+Z)`}
                >
                    <RotateCcw size={18} />
                </button>
                
                <button
                    onClick={redo}
                    disabled={!canRedo}
                    className={cn(
                        "p-2 rounded-lg transition-colors",
                        !canRedo ? "text-gray-600 cursor-not-allowed" : "text-gray-300 hover:text-white hover:bg-white/10"
                    )}
                    title={`${t.common.redo} (Ctrl+Y)`}
                >
                    <RotateCw size={18} />
                </button>
            </div>
        </div>
    );
}
