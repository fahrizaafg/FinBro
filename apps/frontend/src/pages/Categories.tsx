import { useState, useMemo } from 'react';
import { 
  Plus, 
  Utensils, 
  Car, 
  Gamepad2, 
  Wallet, 
  ShoppingBag, 
  BriefcaseMedical, 
  Receipt,
  Search,
  Ghost,
  X,
  Lightbulb,
  Zap,
  Heart,
  GraduationCap,
  Home,
  TrendingUp,
  Gift,
  Briefcase,
  Smartphone,
  Banknote,
  Music,
  Coffee,
  Plane
} from 'lucide-react';
import { cn, getTranslatedCategory } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { translations } from '../lib/translations';

export default function Categories() {
  const { transactions, formatCurrency, budgets, settings, customCategories, addCustomCategory } = useApp();
  const t = translations[settings.language];
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'expense', 'income'
  const [searchTerm, setSearchTerm] = useState('');
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'income' | 'expense'>('expense');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    
    // Simple add - just add to custom categories list in context
    addCustomCategory(newCategory.trim(), newCategoryType);
    setNewCategory('');
    setIsAddModalOpen(false);
  };

  // Helper to determine category style properties
  const getCategoryStyle = (name: string, type: 'income' | 'expense') => {
    const lower = name.toLowerCase();
    
    // Default Styles
    let style = {
      icon: type === 'income' ? Banknote : Receipt,
      color: 'text-slate-400',
      bg: 'bg-slate-500/5',
      border: 'border-slate-500/20',
      hover: 'hover:bg-slate-500/10 hover:border-slate-500/40',
      progress: 'bg-slate-500',
      iconBg: 'bg-slate-500/10'
    };

    if (type === 'income') {
      if (lower.includes('gaji') || lower.includes('salary') || lower.includes('kerja')) {
        style = {
          icon: Briefcase,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/5',
          border: 'border-emerald-500/20',
          hover: 'hover:bg-emerald-500/10 hover:border-emerald-500/40',
          progress: 'bg-emerald-500',
          iconBg: 'bg-emerald-500/10'
        };
      } else if (lower.includes('invest')) {
        style = {
          icon: TrendingUp,
          color: 'text-green-400',
          bg: 'bg-green-500/5',
          border: 'border-green-500/20',
          hover: 'hover:bg-green-500/10 hover:border-green-500/40',
          progress: 'bg-green-500',
          iconBg: 'bg-green-500/10'
        };
      } else if (lower.includes('hadiah') || lower.includes('bonus') || lower.includes('gift')) {
        style = {
          icon: Gift,
          color: 'text-pink-400',
          bg: 'bg-pink-500/5',
          border: 'border-pink-500/20',
          hover: 'hover:bg-pink-500/10 hover:border-pink-500/40',
          progress: 'bg-pink-500',
          iconBg: 'bg-pink-500/10'
        };
      } else {
        // Generic Income
        style = {
          icon: Wallet,
          color: 'text-teal-400',
          bg: 'bg-teal-500/5',
          border: 'border-teal-500/20',
          hover: 'hover:bg-teal-500/10 hover:border-teal-500/40',
          progress: 'bg-teal-500',
          iconBg: 'bg-teal-500/10'
        };
      }
    } else {
      // Expenses
      if (lower.includes('makan') || lower.includes('food') || lower.includes('minum')) {
        style = {
          icon: Utensils,
          color: 'text-orange-400',
          bg: 'bg-orange-500/5',
          border: 'border-orange-500/20',
          hover: 'hover:bg-orange-500/10 hover:border-orange-500/40',
          progress: 'bg-orange-500',
          iconBg: 'bg-orange-500/10'
        };
      } else if (lower.includes('kopi') || lower.includes('coffee') || lower.includes('cafe')) {
        style = {
          icon: Coffee,
          color: 'text-amber-400',
          bg: 'bg-amber-500/5',
          border: 'border-amber-500/20',
          hover: 'hover:bg-amber-500/10 hover:border-amber-500/40',
          progress: 'bg-amber-500',
          iconBg: 'bg-amber-500/10'
        };
      } else if (lower.includes('trans') || lower.includes('car') || lower.includes('bensin') || lower.includes('gojek') || lower.includes('grab')) {
        style = {
          icon: Car,
          color: 'text-blue-400',
          bg: 'bg-blue-500/5',
          border: 'border-blue-500/20',
          hover: 'hover:bg-blue-500/10 hover:border-blue-500/40',
          progress: 'bg-blue-500',
          iconBg: 'bg-blue-500/10'
        };
      } else if (lower.includes('travel') || lower.includes('liburan') || lower.includes('pesawat')) {
        style = {
          icon: Plane,
          color: 'text-sky-400',
          bg: 'bg-sky-500/5',
          border: 'border-sky-500/20',
          hover: 'hover:bg-sky-500/10 hover:border-sky-500/40',
          progress: 'bg-sky-500',
          iconBg: 'bg-sky-500/10'
        };
      } else if (lower.includes('game') || lower.includes('hiburan') || lower.includes('film') || lower.includes('movie')) {
        style = {
          icon: Gamepad2,
          color: 'text-violet-400',
          bg: 'bg-violet-500/5',
          border: 'border-violet-500/20',
          hover: 'hover:bg-violet-500/10 hover:border-violet-500/40',
          progress: 'bg-violet-500',
          iconBg: 'bg-violet-500/10'
        };
      } else if (lower.includes('musik') || lower.includes('music') || lower.includes('spotify')) {
        style = {
          icon: Music,
          color: 'text-fuchsia-400',
          bg: 'bg-fuchsia-500/5',
          border: 'border-fuchsia-500/20',
          hover: 'hover:bg-fuchsia-500/10 hover:border-fuchsia-500/40',
          progress: 'bg-fuchsia-500',
          iconBg: 'bg-fuchsia-500/10'
        };
      } else if (lower.includes('shop') || lower.includes('belanja') || lower.includes('baju')) {
        style = {
          icon: ShoppingBag,
          color: 'text-indigo-400',
          bg: 'bg-indigo-500/5',
          border: 'border-indigo-500/20',
          hover: 'hover:bg-indigo-500/10 hover:border-indigo-500/40',
          progress: 'bg-indigo-500',
          iconBg: 'bg-indigo-500/10'
        };
      } else if (lower.includes('sehat') || lower.includes('medis') || lower.includes('dokter') || lower.includes('obat') || lower.includes('sakit')) {
        style = {
          icon: BriefcaseMedical, // Or Heart
          color: 'text-rose-400',
          bg: 'bg-rose-500/5',
          border: 'border-rose-500/20',
          hover: 'hover:bg-rose-500/10 hover:border-rose-500/40',
          progress: 'bg-rose-500',
          iconBg: 'bg-rose-500/10'
        };
      } else if (lower.includes('tagihan') || lower.includes('bill') || lower.includes('listrik') || lower.includes('air') || lower.includes('pln')) {
        style = {
          icon: Zap,
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/5',
          border: 'border-yellow-500/20',
          hover: 'hover:bg-yellow-500/10 hover:border-yellow-500/40',
          progress: 'bg-yellow-500',
          iconBg: 'bg-yellow-500/10'
        };
      } else if (lower.includes('sekolah') || lower.includes('kuliah') || lower.includes('pendidikan') || lower.includes('kursus') || lower.includes('buku')) {
        style = {
          icon: GraduationCap,
          color: 'text-cyan-400',
          bg: 'bg-cyan-500/5',
          border: 'border-cyan-500/20',
          hover: 'hover:bg-cyan-500/10 hover:border-cyan-500/40',
          progress: 'bg-cyan-500',
          iconBg: 'bg-cyan-500/10'
        };
      } else if (lower.includes('rumah') || lower.includes('kos') || lower.includes('kontrakan') || lower.includes('kpr') || lower.includes('sewa')) {
        style = {
          icon: Home,
          color: 'text-purple-400',
          bg: 'bg-purple-500/5',
          border: 'border-purple-500/20',
          hover: 'hover:bg-purple-500/10 hover:border-purple-500/40',
          progress: 'bg-purple-500',
          iconBg: 'bg-purple-500/10'
        };
      } else if (lower.includes('pulsa') || lower.includes('kuota') || lower.includes('internet') || lower.includes('wifi') || lower.includes('hp')) {
        style = {
          icon: Smartphone,
          color: 'text-lime-400',
          bg: 'bg-lime-500/5',
          border: 'border-lime-500/20',
          hover: 'hover:bg-lime-500/10 hover:border-lime-500/40',
          progress: 'bg-lime-500',
          iconBg: 'bg-lime-500/10'
        };
      } else if (lower.includes('keluarga') || lower.includes('family') || lower.includes('anak') || lower.includes('orang tua')) {
        style = {
          icon: Heart,
          color: 'text-red-400',
          bg: 'bg-red-500/5',
          border: 'border-red-500/20',
          hover: 'hover:bg-red-500/10 hover:border-red-500/40',
          progress: 'bg-red-500',
          iconBg: 'bg-red-500/10'
        };
      }
    }
    
    return style;
  };

  // Derive categories from transactions and budgets
  const categoriesData = useMemo(() => {
    const categoryMap = new Map();

    // Initialize from budgets
    budgets.forEach(b => {
      categoryMap.set(b.category, {
        name: b.category,
        type: 'expense',
        transactions: 0,
        amount: 0,
        ...getCategoryStyle(b.category, 'expense')
      });
    });

    // Initialize from custom categories
    customCategories.forEach(c => {
      if (!categoryMap.has(c.name)) {
        categoryMap.set(c.name, {
          name: c.name,
          type: c.type,
          transactions: 0,
          amount: 0,
          ...getCategoryStyle(c.name, c.type)
        });
      }
    });

    // Process transactions
    transactions.forEach(t => {
      const current = categoryMap.get(t.category) || {
        name: t.category,
        type: t.type,
        transactions: 0,
        amount: 0,
        ...getCategoryStyle(t.category, t.type)
      };

      current.transactions += 1;
      current.amount += t.amount;
      
      // Update type if needed (and re-fetch style if type changed, though unlikely)
      if (!categoryMap.has(t.category)) {
        current.type = t.type;
        // Update style based on actual type from transaction
        Object.assign(current, getCategoryStyle(t.category, t.type));
      }
      
      categoryMap.set(t.category, current);
    });

    // Convert map to array and add metadata
    return Array.from(categoryMap.values()).map((cat, index) => {
      return {
        ...cat,
        id: index,
        // Calculate simplistic progress
        progress: Math.min((cat.transactions / (transactions.length || 1)) * 100, 100) 
      };
    });
  }, [transactions, budgets, customCategories]);

  const filteredCategories = categoriesData.filter(cat => {
    const matchesTab = activeTab === 'all' || cat.type === activeTab;
    const translatedName = getTranslatedCategory(cat.name, settings.language);
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          translatedName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabs = [
    { id: 'all', label: t.categories.tabs.all },
    { id: 'expense', label: t.categories.tabs.expense },
    { id: 'income', label: t.categories.tabs.income }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          {t.categories.addCategory}
        </button>
      </div>

      {/* Tabs & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-white/5 pb-6">
        <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                activeTab === tab.id 
                  ? "bg-white/10 text-white shadow-lg" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Search */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
             <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                    type="text" 
                    placeholder={t.categories.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/20 border border-white/5 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
                />
            </div>
        </div>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
            <Ghost size={48} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{t.categories.emptyState.title}</h3>
          <p className="text-gray-400 font-medium">{t.categories.emptyState.subtitle}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
          {filteredCategories.map((category) => (
            <div 
              key={category.id} 
              className={cn(
                "glass-card p-5 flex flex-col gap-6 group transition-all duration-300 cursor-pointer h-full border border-white/5",
                category.bg,
                category.hover,
                category.border
              )}
            >
              {/* Icon & Name */}
              <div>
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300", 
                  category.iconBg, 
                  category.color
                )}>
                  <category.icon size={24} />
                </div>
                <div className="flex justify-between items-start h-12">
                  <h3 className={cn("text-lg font-bold line-clamp-2 leading-tight", category.color)}>
                    {getTranslatedCategory(category.name, settings.language)}
                  </h3>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full bg-black/20 shrink-0 ml-2 font-medium border border-white/5",
                    category.type === 'income' ? "text-emerald-400" : "text-rose-400"
                  )}>
                    {category.type === 'income' ? t.categories.tabs.income : t.categories.tabs.expense}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1">{category.transactions} {t.categories.card.transactions}</p>
                <p className="text-lg font-bold mt-2 text-white">{formatCurrency(category.amount)}</p>
              </div>

              {/* Progress Bar */}
              <div className="mt-auto">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{t.categories.card.activity}</span>
                  <span>{Math.round(category.progress)}%</span>
                </div>
                <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-500", category.progress)} 
                    style={{ width: `${category.progress}%` }} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Info Modal */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 relative animate-fade-in-up">
            <button 
              onClick={() => setIsInfoModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 text-primary">
                <Lightbulb size={32} />
              </div>
              <h3 className="text-xl font-bold">{t.categories.infoButton}</h3>
            </div>
            
            <div className="space-y-4 text-gray-300">
              <p className="bg-white/5 p-4 rounded-xl border border-white/5 text-sm leading-relaxed">
                {t.categories.infoAlert}
              </p>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-white text-sm uppercase tracking-wider">{t.categories.tipsLabel}</h4>
                <ul className="text-sm space-y-2 list-disc pl-5 text-gray-400">
                  {(t.categories.tips || []).map((tip: string, i: number) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button 
              onClick={() => setIsInfoModalOpen(false)}
              className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 border border-white/5 rounded-xl font-medium transition-colors"
            >
              {t.categories.gotIt}
            </button>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 relative animate-fade-in-up">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-bold mb-6">{t.categories.addCategory}</h3>
            
            <form onSubmit={handleAddCategory} className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">{t.dashboard.modal.type}</label>
                <div className="grid grid-cols-2 bg-black/20 p-1 rounded-xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setNewCategoryType('expense')}
                    className={cn(
                      "py-2 rounded-lg text-sm font-medium transition-all",
                      newCategoryType === 'expense' 
                        ? "bg-red-500/20 text-red-400 shadow-lg border border-red-500/20" 
                        : "text-gray-400 hover:text-white"
                    )}
                  >
                    {t.dashboard.modal.expense}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCategoryType('income')}
                    className={cn(
                      "py-2 rounded-lg text-sm font-medium transition-all",
                      newCategoryType === 'income' 
                        ? "bg-green-500/20 text-green-400 shadow-lg border border-green-500/20" 
                        : "text-gray-400 hover:text-white"
                    )}
                  >
                    {t.dashboard.modal.income}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">{t.dashboard.modal.category}</label>
                <input 
                  type="text" 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder={t.dashboard.modal.categoryPlaceholder}
                  className="w-full bg-black/20 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                  autoFocus
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity rounded-xl font-bold shadow-lg shadow-primary/20"
              >
                {t.categories.saveCategory}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
