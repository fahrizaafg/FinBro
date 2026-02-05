import { useState, useRef } from 'react';
import { Globe, Save, Lightbulb, Wallet, Download, Upload, Instagram, User as UserIcon, Coffee } from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { translations } from '../lib/translations';
import ProfileUpload from '../components/ProfileUpload';
import Toast, { ToastType } from '../components/Toast';

export default function Settings() {
  const { settings, updateSettings, transactions, debts, budgets, importData, user } = useApp();
  const t = translations[settings.language];
  const [localLanguage, setLocalLanguage] = useState(settings.language);
  const [localCurrency, setLocalCurrency] = useState(settings.currency);
  const [toast, setToast] = useState<{ message: string; title?: string; type: ToastType } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    updateSettings({
      language: localLanguage,
      currency: localCurrency
    });

    const targetT = translations[localLanguage];

    setToast({
      message: targetT.settings.savedAlert,
      title: targetT.common.success,
      type: 'success'
    });
  };

  const handleExport = () => {
    const data = {
      settings: { language: localLanguage, currency: localCurrency }, // Export current local settings too
      transactions,
      debts,
      budgets,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finbro-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        importData(json);
        
        const newLang = (json.settings?.language || settings.language) as 'id' | 'en';
        const targetT = translations[newLang] || translations.en;

        setToast({
          message: targetT.settings.importAlert,
          title: targetT.common.success,
          type: 'success'
        });
        // Update local state to reflect imported settings if any
        if (json.settings) {
          setLocalLanguage(json.settings.language);
          setLocalCurrency(json.settings.currency);
        }
      } catch (err) {
        setToast({
          message: t.settings.importError,
          title: t.common.error,
          type: 'error'
        });
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {toast && (
        <Toast
          message={toast.message}
          title={toast.title}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t.settings.title}</h2>
        <p className="text-gray-400 mt-1">{t.settings.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Profile Section */}
          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-2">
              <UserIcon className="text-primary" size={24} />
              <h3 className="text-xl font-bold">{t.settings.profileSettings}</h3>
            </div>
            <p className="text-gray-400 text-sm mb-8">{t.settings.profileDesc}</p>
            
            <div className="space-y-6">
              <ProfileUpload />
              
              <div className="space-y-2">
                  <label className="text-sm text-gray-400">{t.settings.displayName}</label>
                  <input 
                    type="text" 
                    disabled
                    value={user?.name || ''} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 opacity-60 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500">{t.settings.nameSessionInfo}</p>
              </div>

              {/* Social Media Configuration Removed */}
            </div>
          </div>

          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="text-primary" size={24} />
              <h3 className="text-xl font-bold">{t.settings.appPreferences}</h3>
            </div>
            <p className="text-gray-400 text-sm mb-8">{t.settings.appPreferencesDesc}</p>

            <div className="space-y-8">
              {/* Language Section */}
              <div>
                <label className="block text-sm text-gray-400 mb-3">{t.settings.language}</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setLocalLanguage('id')}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border transition-all relative overflow-hidden",
                      localLanguage === 'id' 
                        ? "bg-primary/10 border-primary text-white" 
                        : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-xs font-bold border border-white/10">
                      ID
                    </div>
                    <span className="font-medium">Bahasa Indonesia</span>
                  </button>

                  <button
                    onClick={() => setLocalLanguage('en')}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border transition-all relative overflow-hidden",
                      localLanguage === 'en' 
                        ? "bg-primary/10 border-primary text-white" 
                        : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-xs font-bold border border-white/10">
                      EN
                    </div>
                    <span className="font-medium">English</span>
                  </button>
                </div>
              </div>

              {/* Currency Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <label className="block text-sm text-gray-400">{t.settings.currency}</label>
                  <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
                    {t.settings.wip}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4">{t.settings.wipDesc}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-50 pointer-events-none grayscale">
                  <button
                    disabled
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border transition-all relative overflow-hidden",
                      localCurrency === 'IDR' 
                        ? "bg-primary/10 border-primary text-white" 
                        : "bg-white/5 border-white/5 text-gray-400"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">
                      <Wallet size={16} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">IDR (Rp)</p>
                      <p className="text-xs text-gray-500">{t.settings.currencyIDR}</p>
                    </div>
                  </button>

                  <button
                    disabled
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border transition-all relative overflow-hidden",
                      localCurrency === 'USD' 
                        ? "bg-primary/10 border-primary text-white" 
                        : "bg-white/5 border-white/5 text-gray-400"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                      $
                    </div>
                    <div className="text-left">
                      <p className="font-medium">USD ($)</p>
                      <p className="text-xs text-gray-500">{t.settings.currencyUSD}</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleSave}
                className="px-6 py-3 bg-primary hover:bg-primary/90 transition-colors rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-primary/20"
              >
                <Save size={18} />
                {t.settings.save}
              </button>
            </div>
          </div>

          {/* Data Management */}
          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-2">
              <Save className="text-primary" size={24} />
              <h3 className="text-xl font-bold">{t.settings.dataManagement}</h3>
            </div>
            <p className="text-gray-400 text-sm mb-8">{t.settings.dataManagementDesc}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={handleExport}
                className="flex items-center justify-center gap-3 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-white"
              >
                <Download size={20} />
                <span className="font-medium">{t.settings.exportJson}</span>
              </button>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-3 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-white"
              >
                <Upload size={20} />
                <span className="font-medium">{t.settings.importJson}</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImport}
                accept=".json"
                className="hidden" 
              />
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* About Card */}
          <div className="glass-card p-8 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
             
             <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
                <Wallet size={32} className="text-white" />
             </div>

             <h3 className="text-2xl font-bold mb-2">FinBro</h3>
             <p className="text-gray-400 text-sm italic mb-8">{t.settings.tagline}</p>

             <div className="mb-8">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{t.settings.createdBy}</p>
                <p className="text-lg font-semibold">Fahriza</p>
                <a href="https://instagram.com/fahrizaafg" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline block mt-1">
                  @fahrizaafg
                </a>
             </div>

             <div className="flex flex-col gap-3 px-4">
                {/* Instagram Button */}
                <a 
                  href="https://instagram.com/fahrizaafg" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Visit Fahriza's Instagram Profile"
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 transition-all"
                >
                    <Instagram size={18} className="text-pink-500" />
                    <span className="font-semibold">Instagram</span>
                </a>

                {/* Saweria Button */}
                <a 
                  href="https://saweria.co/fahrizaafg" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Support Fahriza on Saweria"
                  className="w-full py-3 rounded-xl bg-[#faae2b] hover:bg-[#e59b1a] text-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-500/20"
                >
                    <Coffee size={18} />
                    <span className="font-bold">{t.settings.support}</span>
                </a>
             </div>
          </div>

          {/* Did You Know */}
          <div className="glass-card p-6 bg-yellow-500/5 border-yellow-500/10">
            <div className="flex items-center gap-2 text-yellow-400 mb-3">
                <Lightbulb size={20} />
                <span className="font-semibold">{t.settings.didYouKnow}</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
                {t.settings.didYouKnowDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Logout Removed */}
    </div>
  );
}
