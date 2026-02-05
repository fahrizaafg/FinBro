import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  title?: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, title, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={cn(
      "fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border backdrop-blur-xl animate-in slide-in-from-bottom-5 fade-in duration-300",
      type === 'success' 
        ? "bg-[#0f0720]/80 border-green-500/30 text-white" 
        : "bg-[#0f0720]/80 border-red-500/30 text-white"
    )}>
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full",
        type === 'success' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
      )}>
        {type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
      </div>
      
      <div className="flex flex-col">
        <h4 className={cn("text-sm font-bold", type === 'success' ? "text-green-400" : "text-red-400")}>
          {title || (type === 'success' ? 'Success' : 'Error')}
        </h4>
        <p className="text-sm font-medium text-gray-200">{message}</p>
      </div>

      <button 
        onClick={onClose} 
        className="ml-4 hover:bg-white/10 p-1.5 rounded-full transition-colors text-gray-400 hover:text-white"
      >
        <X size={16} />
      </button>
    </div>
  );
}
