import { Link, useNavigate } from 'react-router-dom';
import { Plus, ArrowUpRight, X, ChevronDown, AlertTriangle, Trash, PiggyBank, MoreHorizontal, Ghost, Calendar, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';
import { getCategoryStyles, getTranslatedCategory, cn } from '../lib/utils';
import { useMemo, useState, useEffect, useRef } from 'react';
import { translations } from '../lib/translations';

export default function Dashboard() {
  const { transactions, formatCurrency, budgets, addTransaction, deleteBudget, addBudget, settings, updateSettings, customCategories } = useApp();
  const t = translations[settings.language];
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showBudgetMenu, setShowBudgetMenu] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isGlobalBudgetModalOpen, setIsGlobalBudgetModalOpen] = useState(false);
  const [globalBudgetInput, setGlobalBudgetInput] = useState('');
  const [isSavingBudget, setIsSavingBudget] = useState(false);
  const [showChartRangeDropdown, setShowChartRangeDropdown] = useState(false);
  const [chartRange, setChartRange] = useState<'7days' | '30days'>('7days');
  const [isDateManuallyEdited, setIsDateManuallyEdited] = useState(false);
  const [newBudget, setNewBudget] = useState({ category: '', limit: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    date: new Date().toISOString().slice(0, 16)
  });

  const categoryWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryWrapperRef.current && !categoryWrapperRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    }

    if (showCategoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoryDropdown]);

  // Live clock effect for modal
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isModalOpen && !isDateManuallyEdited) {
      interval = setInterval(() => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        setFormData(prev => ({
          ...prev,
          date: now.toISOString().slice(0, 16)
        }));
      }, 1000); // Update every second
    }

    return () => clearInterval(interval);
  }, [isModalOpen, isDateManuallyEdited]);

  // Get unique categories based on selected transaction type
  const availableCategories = useMemo(() => {
    // 1. Get categories from Context (which has types)
    const contextCategories = customCategories
      .filter(c => c.type === formData.type)
      .map(c => c.name);

    // 2. Get categories from Budgets (only for expenses)
    const budgetCategories = formData.type === 'expense' 
      ? budgets.map(b => b.category)
      : [];

    // 3. Get categories from Transactions history (filter by type)
    const txCategories = transactions
      .filter(t => t.type === formData.type)
      .map(t => t.category);

    const all = [...contextCategories, ...budgetCategories, ...txCategories];
    
    // Filter out 'Lainnya' and 'Other' to avoid duplicates
    return Array.from(new Set(all))
      .filter(c => c !== 'Lainnya' && c !== 'Other')
      .sort();
  }, [budgets, customCategories, transactions, formData.type]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (!value) {
      setFormData({ ...formData, amount: '' });
      return;
    }
    const formatted = new Intl.NumberFormat(settings.language === 'id' ? 'id-ID' : 'en-US').format(parseInt(value));
    setFormData({ ...formData, amount: formatted });
  };

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudget.category || !newBudget.limit) return;
    
    // Check if exists
    if (budgets.some(b => b.category.toLowerCase() === newBudget.category.toLowerCase())) {
        alert(t.budget.modal.existsAlert);
        return;
    }

    const limit = parseInt(newBudget.limit.replace(/\D/g, ''));
    if (isNaN(limit)) return;

    addBudget({ category: newBudget.category, limit });
    setNewBudget({ category: '', limit: '' });
  };

  const handleOpenGlobalBudgetModal = () => {
    setGlobalBudgetInput(settings.monthlyBudget ? settings.monthlyBudget.toString() : '');
    setIsGlobalBudgetModalOpen(true);
    setShowBudgetMenu(false);
  };

  const handleSaveGlobalBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBudget(true);

    // Simulate network delay for UX
    await new Promise(resolve => setTimeout(resolve, 800));

    const amount = parseInt(globalBudgetInput.replace(/\D/g, ''));
    if (!isNaN(amount)) {
      updateSettings({ monthlyBudget: amount });
    } else if (globalBudgetInput === '') {
      updateSettings({ monthlyBudget: 0 }); // Reset to sum of categories
    }

    setIsSavingBudget(false);
    setIsGlobalBudgetModalOpen(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setShowCategoryDropdown(false);
    setIsDateManuallyEdited(false);
    
    // Get local datetime YYYY-MM-DDTHH:mm
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const localDateTime = now.toISOString().slice(0, 16);
    
    setFormData({
      name: '',
      desc: '',
      amount: '',
      type: 'expense',
      category: '',
      date: localDateTime
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount || !formData.category) return;

    const amount = parseInt(formData.amount.replace(/\D/g, ''));
    if (isNaN(amount)) return;

    addTransaction({
      name: formData.name,
      desc: formData.desc || 'Manual Entry',
      category: formData.category,
      amount: amount,
      date: new Date(formData.date).toISOString(),
      type: formData.type
    });

    setIsModalOpen(false);
  };

  // Calculate Balance
  const balance = useMemo(() => {
    return transactions.reduce((acc, tx) => {
      return tx.type === 'income' ? acc + tx.amount : acc - tx.amount;
    }, 0);
  }, [transactions]);

  // Calculate Chart Data
  const chartData = useMemo(() => {
    const days = t.common.days;
    const count = chartRange === '7days' ? 7 : 30;
    
    const datePoints = Array.from({ length: count }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (count - 1 - i));
      return d;
    });

    return datePoints.map(date => {
      const dayName = chartRange === '7days' 
        ? days[date.getDay()] 
        : date.getDate().toString();
      
      const dateStr = date.toISOString().split('T')[0];
      const dailyTotal = transactions
        .filter(tx => tx.date.startsWith(dateStr) && tx.type === 'expense')
        .reduce((acc, tx) => acc + tx.amount, 0);
      
      return { day: dayName, amount: dailyTotal, fullDate: dateStr };
    });
  }, [transactions, chartRange, t]);

  const sumOfCategories = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalBudget = settings.monthlyBudget && settings.monthlyBudget > 0
    ? settings.monthlyBudget
    : sumOfCategories;

  const totalSpent = transactions
    .filter(tx => tx.type === 'expense' && new Date(tx.date).getMonth() === new Date().getMonth())
    .reduce((acc, tx) => acc + tx.amount, 0);
  
  const budgetProgress = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 md:pb-10">
      {/* Budget Warning Notification */}
      {totalSpent > totalBudget && totalBudget > 0 && (
        <div className="w-full animate-fade-in-up">
          <div className="bg-[#1a1625] border border-red-500/30 rounded-xl p-4 shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center gap-4 backdrop-blur-md">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-red-400">{t.dashboard.warning.title}</h4>
              <p className="text-sm text-gray-300">
                {t.dashboard.warning.message} <span className="font-bold text-white">{formatCurrency(totalSpent - totalBudget)}</span>
              </p>
            </div>
            <div className="text-right hidden sm:block">
               <span className="text-xs text-red-400 font-medium bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20">
                 {t.dashboard.warning.badge}
               </span>
            </div>
          </div>
        </div>
      )}

      {/* Top Row: Balance */}
      <div className="glass-card p-6 md:p-8 relative overflow-hidden group border-white/10 shadow-2xl shadow-primary/5">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        {/* Animated Blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/30 transition-all duration-700" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2 group-hover:bg-secondary/20 transition-all duration-700" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <span className="font-medium tracking-wide text-sm uppercase opacity-80">{t.dashboard.totalBalance}</span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tighter bg-gradient-to-b from-white to-white/90 bg-clip-text text-transparent">
              {formatCurrency(balance)}
            </h2>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20 shadow-sm backdrop-blur-md">
              <ArrowUpRight size={14} strokeWidth={3} />
              +0% <span className="text-gray-400 font-medium">{t.dashboard.vsLastMonth}</span>
            </div>
          </div>
          
          <button 
            onClick={handleOpenModal}
            className="w-full md:w-auto px-6 py-4 bg-gradient-to-r from-primary to-secondary hover:opacity-90 active:scale-[0.98] transition-all duration-200 rounded-2xl font-bold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 flex items-center justify-center gap-3 group/btn relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
            <Plus size={22} strokeWidth={2.5} />
            <span className="relative">{t.dashboard.addTransaction}</span>
          </button>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 relative animate-fade-in-up">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-bold mb-6">{t.dashboard.modal.title}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">{t.dashboard.modal.name}</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/20 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50"
                  placeholder={t.dashboard.modal.namePlaceholder}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t.dashboard.modal.type}</label>
                  <div className="grid grid-cols-2 bg-black/20 p-1 rounded-xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, type: 'expense'})}
                      className={`py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.type === 'expense' 
                          ? 'bg-red-500/20 text-red-400 shadow-lg border border-red-500/20' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {t.dashboard.modal.expense}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, type: 'income'})}
                      className={`py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.type === 'income' 
                          ? 'bg-green-500/20 text-green-400 shadow-lg border border-green-500/20' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {t.dashboard.modal.income}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t.dashboard.modal.amount}</label>
                  <input 
                    type="text" 
                    value={formData.amount}
                    onChange={handleAmountChange}
                    className="w-full bg-black/20 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50"
                    placeholder={t.dashboard.modal.amountPlaceholder}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">{t.dashboard.modal.category}</label>
                
                {/* Quick Category Selection */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {availableCategories.slice(0, 6).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setFormData({...formData, category: getTranslatedCategory(cat, settings.language)});
                        setShowCategoryDropdown(false);
                      }}
                      className={`px-2 py-1 rounded-xl text-xs font-medium transition-all border h-12 flex items-center justify-center text-center touch-manipulation ${
                        formData.category === cat || formData.category === getTranslatedCategory(cat, settings.language)
                          ? formData.type === 'income'
                            ? 'bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                            : 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                          : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="line-clamp-2 leading-none">{getTranslatedCategory(cat, settings.language)}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="px-2 py-1 rounded-xl text-xs font-medium transition-all border bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white h-12 flex items-center justify-center text-center touch-manipulation"
                  >
                    {t.dashboard.modal.other} <ChevronDown size={12} className="ml-1" />
                  </button>
                </div>

                {/* Custom Category Input */}
                {(showCategoryDropdown || (formData.category && !availableCategories.slice(0, 6).includes(formData.category))) && (
                <div ref={categoryWrapperRef} className="relative animate-fade-in">
                  <div className="relative z-50">
                    <input 
                      autoFocus
                      type="text" 
                      value={formData.category}
                      onChange={e => {
                        setFormData({...formData, category: e.target.value});
                        setShowCategoryDropdown(true);
                      }}
                      onFocus={() => setShowCategoryDropdown(true)}
                      className="w-full bg-black/20 border border-white/5 rounded-xl py-3 px-4 pr-10 text-white focus:outline-none focus:border-primary/50 text-sm"
                      placeholder={t.dashboard.modal.categoryPlaceholder}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        setFormData({...formData, category: ''});
                        setShowCategoryDropdown(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  {/* Dropdown - Only show if there are OTHER categories matching search, or user is typing */}
                  {showCategoryDropdown && formData.category && (
                    <div className="absolute z-50 w-full mt-2 bg-[#1a1625] border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                      {availableCategories
                        .filter(c => !availableCategories.slice(0, 6).includes(c)) // Exclude top 6 already shown
                        .filter(c => {
                          const translated = getTranslatedCategory(c, settings.language);
                          return c.toLowerCase().includes(formData.category.toLowerCase()) || 
                                 translated.toLowerCase().includes(formData.category.toLowerCase());
                        })
                        .map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setFormData({...formData, category: getTranslatedCategory(cat, settings.language)});
                            setShowCategoryDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-white/5 text-sm text-gray-300 hover:text-white transition-colors border-b border-white/5 last:border-0"
                        >
                          {getTranslatedCategory(cat, settings.language)}
                        </button>
                      ))}
                      
                      {/* Show "Create New" if it doesn't exist */}
                      {!availableCategories.some(c => c.toLowerCase() === formData.category.toLowerCase()) && (
                        <div className="px-4 py-3 text-sm text-gray-500 italic border-t border-white/5">
                          {t.dashboard.modal.newCategoryHint.replace('{category}', formData.category)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">{t.dashboard.modal.desc}</label>
                <input 
                  type="text" 
                  value={formData.desc}
                  onChange={e => setFormData({...formData, desc: e.target.value})}
                  className="w-full bg-black/20 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50"
                  placeholder={t.dashboard.modal.descPlaceholder}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">{t.dashboard.modal.date}</label>
                <input 
                  type="datetime-local" 
                  value={formData.date}
                  onChange={e => {
                    setFormData({...formData, date: e.target.value});
                    setIsDateManuallyEdited(true);
                  }}
                  className="w-full bg-black/20 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 [color-scheme:dark]"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity rounded-xl font-semibold mt-2"
              >
                {t.dashboard.modal.save}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Budget Management Modal */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6 relative animate-fade-in-up max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button 
              onClick={() => setIsBudgetModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-bold mb-6">{t.dashboard.monthlyBudget}</h3>
            
            {/* Add New Budget Form */}
            <form onSubmit={handleAddBudget} className="mb-8 p-4 bg-white/5 rounded-xl border border-white/5">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">{t.budget.addBudget}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <input 
                        type="text" 
                        placeholder={t.dashboard.modal.categoryPlaceholder}
                        value={newBudget.category}
                        onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
                        className="bg-black/20 border border-white/5 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-primary/50"
                        required
                    />
                    <input 
                        type="text" 
                        placeholder={t.dashboard.modal.amountPlaceholder}
                        value={newBudget.limit}
                        onChange={(e) => setNewBudget({...newBudget, limit: e.target.value})}
                        className="bg-black/20 border border-white/5 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-primary/50"
                        required
                    />
                </div>
                <button 
                    type="submit"
                    className="w-full py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 rounded-lg text-sm font-medium transition-colors"
                >
                    {t.budget.addBudget}
                </button>
            </form>

            {/* Budget List */}
            <div className="space-y-4">
                {budgets.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {t.budget.emptyState.subtitle}
                    </div>
                ) : (
                    budgets.map((budget) => {
                        const Icon = getCategoryStyles(budget.category).icon;
                        const spent = transactions
                            .filter(t => t.type === 'expense' && t.category.toLowerCase() === budget.category.toLowerCase() && new Date(t.date).getMonth() === new Date().getMonth())
                            .reduce((acc, curr) => acc + curr.amount, 0);
                        const progress = Math.min((spent / budget.limit) * 100, 100);
                        
                        return (
                            <div key={budget.id} className="p-4 bg-white/5 rounded-xl border border-white/5 group">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-gray-300">
                                            <Icon size={16} />
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-sm">{getTranslatedCategory(budget.category, settings.language)}</h5>
                                            <p className="text-xs text-gray-400">{formatCurrency(spent)} / {formatCurrency(budget.limit)}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if (confirm(`Delete budget for ${getTranslatedCategory(budget.category, settings.language)}?`)) {
                                                deleteBudget(budget.id);
                                            }
                                        }}
                                        className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash size={16} />
                                    </button>
                                </div>
                                <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${spent > budget.limit ? 'bg-red-500' : 'bg-primary'}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
          </div>
        </div>
      )}

      {/* Middle Row: Budget & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Monthly Budget */}
        <div className="glass-card p-4 md:p-6 flex flex-col justify-between h-[280px] md:h-[300px]">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                <PiggyBank size={20} />
              </div>
              <h3 className="font-semibold text-lg">{t.dashboard.monthlyBudget}</h3>
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowBudgetMenu(!showBudgetMenu)}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors touch-manipulation"
              >
                <MoreHorizontal size={20} />
              </button>
              
              {showBudgetMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowBudgetMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1625] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden animate-fade-in">
                    <button
                      onClick={() => navigate('/budget')}
                      className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors touch-manipulation"
                    >
                      View Details
                    </button>
                    <button
                      onClick={handleOpenGlobalBudgetModal}
                      className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors border-t border-white/5 touch-manipulation"
                    >
                      {t.dashboard.modal.editBudget}
                    </button>
                    <button
                      onClick={() => {
                        setShowBudgetMenu(false);
                        setIsBudgetModalOpen(true);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors border-t border-white/5 touch-manipulation"
                    >
                      Manage Categories
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <p className="text-gray-400 text-sm mb-1">{t.dashboard.totalSpent}</p>
            <div className="flex items-end gap-3 mb-4">
              <span className="text-2xl font-bold">{formatCurrency(totalSpent)}</span>
              <span className="text-secondary font-medium mb-1">{Math.round(budgetProgress)}%</span>
            </div>
            
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-6">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full shadow-[0_0_15px_rgba(124,58,237,0.5)] transition-all duration-500"
                style={{ width: `${budgetProgress}%` }}
              />
            </div>

            <div className="bg-white/5 rounded-xl p-4 flex justify-between items-center border border-white/5">
              <span className="text-gray-400 text-sm">{t.dashboard.remaining}</span>
              <span className="font-semibold">{formatCurrency(Math.max(0, totalBudget - totalSpent))}</span>
            </div>
          </div>
        </div>

        {/* Weekly Spending Chart */}
        <div className="glass-card p-4 md:p-6 lg:col-span-2 h-[280px] md:h-[300px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <ArrowUpRight size={20} />
              </div>
              <h3 className="font-semibold text-lg">
                {chartRange === '7days' ? t.dashboard.weeklySpending : t.dashboard.monthlySpending}
              </h3>
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowChartRangeDropdown(!showChartRangeDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-sm text-gray-300 border border-white/5 hover:bg-white/10 hover:text-white transition-all touch-manipulation"
              >
                {chartRange === '7days' ? t.dashboard.last7Days : t.dashboard.last30Days}
                <ChevronDown size={14} className={`transition-transform duration-300 ${showChartRangeDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showChartRangeDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowChartRangeDropdown(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-40 bg-[#1a1625] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden animate-fade-in">
                    <button
                      onClick={() => {
                        setChartRange('7days');
                        setShowChartRangeDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors touch-manipulation ${
                        chartRange === '7days' ? 'bg-primary/20 text-primary' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {t.dashboard.last7Days}
                    </button>
                    <button
                      onClick={() => {
                        setChartRange('30days');
                        setShowChartRangeDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors touch-manipulation ${
                        chartRange === '30days' ? 'bg-primary/20 text-primary' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {t.dashboard.last30Days}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} key={chartRange}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }} 
                  dy={10}
                />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1035', borderColor: '#ffffff10', borderRadius: '0.75rem' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number | undefined) => [formatCurrency(value || 0), 'Amount']}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-lg">{t.dashboard.recentTransactions}</h3>
          <Link to="/transactions" className="text-primary hover:text-primary/80 text-sm font-medium transition-colors touch-manipulation p-2 -mr-2">
            {t.dashboard.viewAll}
          </Link>
        </div>

        <div className="overflow-x-auto">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in-up">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5">
                <Ghost size={40} className="text-gray-400" />
              </div>
              <p className="text-gray-400 font-medium">{t.dashboard.emptyState.title}, {t.dashboard.emptyState.subtitle}</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <table className="w-full hidden md:table">
                <thead>
                  <tr className="text-left text-gray-400 text-sm border-b border-white/5">
                    <th className="pb-4 font-medium pl-2">{t.transactions.table.desc}</th>
                    <th className="pb-4 font-medium">{t.transactions.table.category}</th>
                    <th className="pb-4 font-medium">{t.transactions.table.date}</th>
                    <th className="pb-4 font-medium text-right pr-2">{t.transactions.table.amount}</th>
                  </tr>
                </thead>
                <tbody className="space-y-4">
                  {transactions.slice(0, 5).map((tx) => {
                    const date = new Date(tx.date);
                    const { icon: Icon, bg, text } = getCategoryStyles(tx.category);
                    return (
                      <tr key={tx.id} className="group hover:bg-white/5 transition-colors rounded-lg">
                        <td className="py-4 pl-2">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bg} ${text}`}>
                              <Icon size={20} />
                            </div>
                            <div>
                              <p className="font-semibold">{tx.name}</p>
                              <p className="text-xs text-gray-400">{tx.desc}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-medium border border-white/5">
                            {getTranslatedCategory(tx.category, settings.language)}
                          </span>
                        </td>
                        <td className="py-4 text-gray-400 text-sm">
                          <div className="flex flex-col">
                            <span className="flex items-center gap-1.5 text-sm font-medium">
                              <Calendar size={14} className="text-gray-500" />
                              {date.toLocaleDateString(settings.language === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                              <Clock size={14} />
                              {date.toLocaleTimeString(settings.language === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td className={`py-4 text-right font-semibold pr-2 ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Mobile List View */}
              <div className="md:hidden flex flex-col divide-y divide-white/5">
                {transactions.slice(0, 5).map((tx) => {
                  const styles = getCategoryStyles(tx.category);
                  const Icon = styles.icon;
                  const date = new Date(tx.date);
                  
                  return (
                    <div key={tx.id} className="py-4 flex items-center justify-between hover:bg-white/5 active:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", styles.bg, styles.text)}>
                          <Icon size={18} />
                        </div>
                        <div className="flex flex-col overflow-hidden min-w-0">
                          <span className="font-semibold text-white text-sm truncate">{tx.name}</span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            {getTranslatedCategory(tx.category, settings.language)} • {date.toLocaleDateString(settings.language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                        <span className={cn("font-bold text-sm whitespace-nowrap", 
                          tx.type === 'income' ? "text-green-400" : "text-red-400"
                        )}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
      {/* Global Budget Modal */}
      {isGlobalBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-sm p-6 relative animate-fade-in-up">
            <button 
              onClick={() => !isSavingBudget && setIsGlobalBudgetModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              disabled={isSavingBudget}
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                <PiggyBank size={20} />
              </div>
              <h3 className="text-xl font-bold">{t.dashboard.monthlyBudget}</h3>
            </div>
            
            <form onSubmit={handleSaveGlobalBudget} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">{t.dashboard.modal.globalBudgetTitle}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    {settings.currency === 'IDR' ? 'Rp' : '$'}
                  </span>
                  <input 
                    type="text" 
                    value={globalBudgetInput ? new Intl.NumberFormat(settings.language === 'id' ? 'id-ID' : 'en-US').format(parseInt(globalBudgetInput.replace(/\D/g, '') || '0')) : ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setGlobalBudgetInput(val);
                    }}
                    className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 text-lg font-semibold"
                    placeholder="0"
                    disabled={isSavingBudget}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {t.dashboard.modal.autoCalculate}
                </p>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={isSavingBudget}
                  className="w-full py-3 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSavingBudget ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t.dashboard.modal.saving}
                    </>
                  ) : (
                    t.dashboard.modal.saveBudget
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
