import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, X, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale, enUS } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { translations } from '../lib/translations';

export default function NotificationDropdown() {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications, 
    settings 
  } = useApp();
  
  const t = translations[settings.language];
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const displayNotifications = notifications.slice(0, 5); // Show latest 5

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} className="text-green-400" />;
      case 'warning': return <AlertTriangle size={16} className="text-yellow-400" />;
      case 'error': return <AlertCircle size={16} className="text-red-400" />;
      default: return <Info size={16} className="text-blue-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
            "relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 outline-none focus:ring-2 focus:ring-primary/50",
            isOpen && "bg-white/5 text-white"
        )}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#1a1625] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h3 className="font-semibold text-sm text-white">{t.common.notifications}</h3>
            <div className="flex gap-2">
                {unreadCount > 0 && (
                    <button 
                        onClick={markAllAsRead}
                        className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                        title={t.common.markAllRead}
                    >
                        <Check size={14} />
                        {t.common.markAllRead}
                    </button>
                )}
                {notifications.length > 0 && (
                    <button 
                        onClick={clearAllNotifications}
                        className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1 ml-2"
                        title={t.common.deleteAll}
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center text-gray-500">
                <Bell size={32} className="mb-3 opacity-20" />
                <p className="text-sm">{t.common.noNotifications}</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {displayNotifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={cn(
                        "p-4 hover:bg-white/5 transition-colors relative group",
                        !notification.isRead && "bg-primary/5"
                    )}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                        <div className="mt-1 shrink-0">
                            {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                                <h4 className={cn("text-sm font-medium truncate pr-4", notification.isRead ? "text-gray-300" : "text-white")}>
                                    {notification.title}
                                </h4>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notification.id);
                                    }}
                                    className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                                {notification.message}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-2">
                                {formatDistanceToNow(new Date(notification.date), { 
                                    addSuffix: true,
                                    locale: settings.language === 'id' ? idLocale : enUS 
                                })}
                            </p>
                        </div>
                    </div>
                    {!notification.isRead && (
                        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>
                    )}
                  </div>
                ))}
                {notifications.length > 5 && (
                    <div className="p-2 text-center border-t border-white/5 bg-white/[0.02]">
                        <span className="text-xs text-gray-500">
                            +{notifications.length - 5} {t.common.otherNotifications}
                        </span>
                    </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
