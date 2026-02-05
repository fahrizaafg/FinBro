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
  Maximize,
  ArrowLeft
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { translations } from '../lib/translations';
import UndoRedoControls from './UndoRedoControls';
import NotificationDropdown from './NotificationDropdown';
import TitleBar from './TitleBar';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, settings } = useApp();
  const t = translations[settings.language];
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [startX, setStartX] = useState<number | null>(null);
  const [startY, setStartY] = useState<number | null>(null);
  const mainRef = React.useRef<HTMLDivElement>(null);

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

  const getAvatarSrc = (user: { name?: string; avatar?: string } | null) => {
    if (user?.avatar && typeof user.avatar === 'string') {
      return user.avatar;
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`;
  };

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const updateShadows = () => {
      const maxScroll = el.scrollHeight - el.clientHeight;
      setShowTopShadow(el.scrollTop > 2);
      setShowBottomShadow(el.scrollTop < maxScroll - 2);
    };
    updateShadows();
    el.addEventListener('scroll', updateShadows, { passive: true });
    return () => el.removeEventListener('scroll', updateShadows);
  }, []);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (touch.clientX < 24) {
      setStartX(touch.clientX);
      setStartY(touch.clientY);
      setIsSwiping(true);
      setSwipeProgress(0);
    } else {
      setIsSwiping(false);
      setStartX(null);
      setStartY(null);
      setSwipeProgress(0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isSwiping || startX === null || startY === null) return;
    const touch = e.touches[0];
    const dx = touch.clientX - startX;
    const dy = Math.abs(touch.clientY - startY);
    if (dx > 0 && dy < 60) {
      const progress = Math.min(1, dx / 120);
      setSwipeProgress(progress);
    }
  };

  const handleTouchEnd = () => {
    if (isSwiping && swipeProgress > 0.7) {
      navigate(-1);
    }
    setIsSwiping(false);
    setSwipeProgress(0);
    setStartX(null);
    setStartY(null);
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
    <div className="flex flex-col min-h-screen w-full bg-background backdrop-blur-[12px] text-white font-sans selection:bg-primary/30 md:rounded-lg md:border md:border-[#4B0080]/30 md:shadow-[0_0_20px_rgba(75,0,128,0.5)] md:h-screen md:overflow-hidden">
      <div className="hidden md:block">
        <TitleBar />
      </div>
      <div className="flex flex-1 w-full relative md:overflow-hidden">
        {/* Sidebar - Desktop Only */}
        <aside className="hidden md:flex w-64 glass-sidebar flex-col p-6 relative z-20 bg-transparent border-r-0">
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
                <p className="font-bold truncate text-sm">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-400 truncate">Pro Plan</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Header (Top) */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass-header transition-all duration-300">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 ring-1 ring-white/10">
                <span className="font-bold text-white text-lg">F</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">FinBro</h1>
            </div>
            <div className="flex items-center gap-2">
              <NotificationDropdown />
              <Link to="/settings" className="p-2 text-gray-400 hover:text-white transition-colors relative group">
                <div className="absolute inset-0 bg-white/5 rounded-full scale-0 group-active:scale-100 transition-transform" />
                <Settings size={22} />
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Navigation (Bottom) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-nav pb-safe">
          <nav className="flex items-center justify-around px-4 py-2">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className="relative flex flex-col items-center gap-1 p-1 transition-all duration-300 min-w-[64px] group"
                >
                  {isActive && (
                    <div className="absolute -top-[9px] w-12 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />
                  )}
                  
                  <div className={cn(
                    "relative p-1.5 rounded-2xl transition-all duration-300",
                    isActive ? "bg-primary/15 -translate-y-1" : "group-active:scale-95"
                  )}>
                    <item.icon size={24} className={cn(
                      "transition-all duration-300",
                      isActive ? "text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" : "text-gray-500"
                    )} />
                  </div>
                  
                  <span className={cn(
                    "text-[10px] font-medium transition-all duration-300",
                    isActive ? "text-white scale-105" : "text-gray-500"
                  )}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content Area */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto overflow-x-hidden md:p-6 p-4 pt-24 pb-28 md:pb-6 relative w-full scroll-smooth"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="pointer-events-none absolute inset-0">
            {showTopShadow && <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/25 to-transparent" />}
            {showBottomShadow && <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/25 to-transparent" />}
            {isSwiping && (
              <div className="absolute top-1/2 -translate-y-1/2 left-2 flex items-center gap-2 text-white/80">
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <ArrowLeft size={18} />
                </div>
                <div className="w-24 h-1 bg-white/15 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${swipeProgress * 100}%` }} />
                </div>
              </div>
            )}
          </div>
          <div className="max-w-7xl mx-auto w-full relative z-10">
            {/* Header / Title Bar for Mobile Context */}
            <header className="flex justify-between items-center mb-6 md:mb-8">
              <div className="flex flex-col">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">{getPageTitle()}</h2>
                <div className="flex items-center gap-2 text-gray-400 text-xs md:text-sm mt-1">
                  <Calendar size={14} />
                  <span>{currentTime.toLocaleDateString(settings.language === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5 text-xs font-mono text-gray-400">
                  <Clock size={12} />
                  <span>{currentTime.toLocaleTimeString(settings.language === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="hidden md:block">
                  <NotificationDropdown />
                </div>
              </div>
            </header>

            {children}
          </div>
          <UndoRedoControls />
        </main>
      </div>
    </div>
  );
}
