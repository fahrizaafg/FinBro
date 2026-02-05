import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  PiggyBank, 
  Settings,
  Calendar,
  CreditCard,
  Folder,
  Clock,
  LogOut,
  Maximize
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { translations } from '../lib/translations';
import UndoRedoControls from './UndoRedoControls';
import NotificationDropdown from './NotificationDropdown';
import TitleBar from './TitleBar';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, settings } = useApp();
  const t = translations[settings.language];
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Check initial status
    if (window.electronAPI) {
      window.electronAPI.checkFullscreen().then(setIsFullscreen);
      
      // Listen for changes
      const cleanup = window.electronAPI.onFullscreenChange((value) => {
        console.log('Fullscreen changed:', value);
        setIsFullscreen(value);
      });

      return () => cleanup();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen && window.electronAPI) {
        window.electronAPI.toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    if (window.electronAPI) {
      window.electronAPI.toggleFullscreen();
      // State update will be handled by the event listener
    }
  };

  const closeApp = () => {
    if (window.electronAPI) {
      window.electronAPI.close();
    }
  };

  const getAvatarSrc = (user: any) => {
    if (user?.avatar && typeof user.avatar === 'string') {
      return user.avatar;
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`;
  };

  const sidebarItems = [
    { icon: LayoutDashboard, label: t.sidebar.dashboard, path: '/' },
    { icon: Receipt, label: t.sidebar.transactions, path: '/transactions' },
    { icon: PiggyBank, label: t.sidebar.budget, path: '/budget' },
    { icon: CreditCard, label: t.sidebar.debts, path: '/debts' },
    { icon: Folder, label: t.sidebar.categories, path: '/categories' },
  ];

  const getPageTitle = () => {
    const currentPath = location.pathname;
    if (currentPath === '/') return t.sidebar.dashboard;
    if (currentPath === '/transactions') return t.sidebar.transactions;
    if (currentPath === '/debts') return t.sidebar.debts;
    if (currentPath === '/budget') return t.sidebar.budget;
    if (currentPath === '/categories') return t.sidebar.categories;
    if (currentPath === '/settings') return t.sidebar.settings;
    return t.sidebar.dashboard;
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background backdrop-blur-[12px] text-white overflow-hidden font-sans selection:bg-primary/30 rounded-lg border border-[#4B0080]/30 shadow-[0_0_20px_rgba(75,0,128,0.5)]">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden w-full relative">
        {/* Sidebar */}
        <aside className="w-64 glass-sidebar flex flex-col p-6 relative z-20 bg-transparent border-r-0">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="font-bold text-white">F</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">FinBro</h1>
            <div className="ml-auto text-[10px] font-bold tracking-wider text-gray-500 uppercase">{t.sidebar.pro}</div>
          </div>

          <nav className="flex-1 space-y-2">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                    isActive 
                      ? "text-white font-medium" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent border-l-2 border-primary" />
                  )}
                  <item.icon size={20} className={cn("relative z-10", isActive ? "text-primary" : "text-gray-400 group-hover:text-white")} />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4">
            <Link 
              to="/settings"
              className={cn(
                "flex items-center gap-3 px-4 py-2 transition-colors w-full rounded-xl",
                location.pathname === '/settings' 
                  ? "bg-white/10 text-white font-medium border border-white/5" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Settings size={20} />
              <span>{t.sidebar.settings}</span>
            </Link>

            {/* Desktop Controls */}
            {window.electronAPI && (
              <div className="pt-4 border-t border-white/5 space-y-2">
                {/* Fullscreen Toggle */}
                <button 
                  onClick={toggleFullscreen}
                  className="w-full flex items-center justify-between px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
                  title={t.common.fullscreen}
                >
                  <div className="flex items-center gap-3">
                    <Maximize size={20} className="group-hover:text-primary transition-colors" />
                    <span className="text-sm font-medium">{t.common.fullscreen}</span>
                  </div>
                  {/* Switch UI */}
                  <div className={cn(
                    "w-8 h-4 rounded-full relative transition-colors duration-300",
                    isFullscreen ? "bg-primary" : "bg-white/20"
                  )}>
                    <div className={cn(
                      "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 shadow-sm",
                      isFullscreen ? "left-[18px]" : "left-0.5"
                    )} />
                  </div>
                </button>

                {/* Close App Button */}
                <button
                  onClick={closeApp}
                  className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all group"
                  title={t.common.exitApp}
                >
                  <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{t.common.exitApp}</span>
                </button>
              </div>
            )}
            {/* Profile Card */}
            <div className="glass-card p-3 flex items-center gap-3 bg-white/5 border-white/5">
              <div className="w-10 h-10 rounded-full bg-yellow-200 overflow-hidden border-2 border-primary/20">
                <img 
                  src={getAvatarSrc(user)}
                  onError={handleImageError}
                  alt={t.common.profile} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">{user?.name || t.common.guest}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-transparent">
          {/* Header */}
          <header className="h-20 border-b border-white/5 bg-transparent flex items-center justify-between px-8 z-10 sticky top-0">
            <div className="flex flex-col">
              <h2 className="text-xl font-bold tracking-tight">{getPageTitle()}</h2>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar size={12} />
                  <span>{currentTime.toLocaleDateString(settings.language === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2 pl-4 border-l border-white/10">
                  <Clock size={12} />
                  <span className="tabular-nums font-medium">
                    {currentTime.toLocaleTimeString(settings.language === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZoneName: 'short' })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <NotificationDropdown />
              <div className="flex items-center gap-3 pl-4 border-l border-white/5">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{user?.name || t.common.user}</p>
                  <p className="text-xs text-gray-400">{t.sidebar.welcomeBack}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-purple-500 p-[2px]">
                  {user?.avatar || user?.name ? (
                    <img 
                      src={getAvatarSrc(user)} 
                      onError={handleImageError}
                      alt={t.common.profile} 
                      className="w-full h-full object-cover rounded-[10px]" 
                    />
                  ) : (
                    <div className="w-full h-full rounded-[10px] bg-background flex items-center justify-center">
                      <span className="font-bold text-primary">{user?.name?.charAt(0) || 'U'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <div className="max-w-7xl mx-auto pb-20">
              {children}
            </div>
          </div>
          
          <UndoRedoControls />
        </main>
      </div>
    </div>
  );
}
