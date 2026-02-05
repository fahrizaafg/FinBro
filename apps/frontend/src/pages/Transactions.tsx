import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight, Ghost, Calendar, Clock, X, ChevronDown, Edit, Trash2 } from 'lucide-react';
import { cn, getCategoryStyles, getTranslatedCategory } from '../lib/utils';
import { useApp, Transaction } from '../context/AppContext';
import { translations } from '../lib/translations';

// Helper to map category to icon and color - Moved to lib/utils

export default function Transactions() {
  const { transactions, formatCurrency, addTransaction, updateTransaction, deleteTransaction, settings, budgets, customCategories } = useApp();
  const t = translations[settings.language];
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isDateManuallyEdited, setIsDateManuallyEdited] = useState(false);
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
      }, 1000);
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

  const handleOpenModal = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setFormData({
      name: '',
      desc: '',
      amount: '',
      type: 'expense',
      category: '',
      date: now.toISOString().slice(0, 16)
    });
    setEditingId(null);
    setIsModalOpen(true);
    setShowCategoryDropdown(false);
    setIsDateManuallyEdited(false);
  };

  const handleEdit = (tx: Transaction) => {
    setFormData({
      name: tx.name,
      desc: tx.desc,
      amount: new Intl.NumberFormat(settings.language === 'id' ? 'id-ID' : 'en-US').format(tx.amount),
      type: tx.type,
      category: tx.category,
      date: tx.date.slice(0, 16)
    });
    setEditingId(tx.id);
    setIsModalOpen(true);
    setShowCategoryDropdown(false);
    setIsDateManuallyEdited(true);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (!value) {
      setFormData({ ...formData, amount: '' });
      return;
    }
    const formatted = new Intl.NumberFormat(settings.language === 'id' ? 'id-ID' : 'en-US').format(parseInt(value));
    setFormData({ ...formData, amount: formatted });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount || !formData.category) return;

    const amount = parseInt(formData.amount.replace(/\D/g, ''));
    if (isNaN(amount)) return;

    if (editingId) {
      updateTransaction(editingId, {
        name: formData.name,
        desc: formData.desc || t.transactions.manualEntry,
        category: formData.category,
        amount: amount,
        date: new Date(formData.date).toISOString(),
        type: formData.type
      });
    } else {
      addTransaction({
        name: formData.name,
        desc: formData.desc || t.transactions.manualEntry,
        category: formData.category,
        amount: amount,
        date: new Date(formData.date).toISOString(),
        type: formData.type
      });
    }

    setIsModalOpen(false);
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tx.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || tx.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 md:pb-10">
      {/* Header */}
      <div className="flex md:justify-end mb-6">
        <button 
          onClick={handleOpenModal}
          className="w-full md:w-auto justify-center px-6 py-3.5 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all active:scale-[0.98] rounded-2xl font-bold text-white flex items-center gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40"
        >
          <Plus size={20} strokeWidth={2.5} />
          {t.dashboard.addTransaction}
        </button>
      </div>

      {/* Filters & Search - Mobile Optimized */}
      <div className="flex flex-col gap-4 relative z-[20] mb-6">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder={t.transactions.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1a1625]/60 backdrop-blur-xl border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-lg shadow-black/5"
          />
        </div>
        
        {/* Mobile Filter Chips */}
        <div className="flex p-1 bg-[#1a1625]/60 backdrop-blur-xl border border-white/10 rounded-2xl md:hidden">
          {[
            { id: 'all', label: t.transactions.allCategories },
            { id: 'income', label: t.transactions.income },
            { id: 'expense', label: t.transactions.expense }
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setFilterType(option.id as 'all' | 'income' | 'expense')}
              className={cn(
                "flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 relative overflow-hidden",
                filterType === option.id 
                  ? "text-white shadow-lg" 
                  : "text-gray-400 hover:text-white"
              )}
            >
              {filterType === option.id && (
                <div className={cn(
                  "absolute inset-0 opacity-100 transition-opacity duration-300",
                  option.id === 'income' ? "bg-gradient-to-r from-green-500 to-emerald-600" :
                  option.id === 'expense' ? "bg-gradient-to-r from-red-500 to-rose-600" :
                  "bg-gradient-to-r from-primary to-secondary"
                )} />
              )}
              <span className="relative z-10">{option.label}</span>
            </button>
          ))}
        </div>

        {/* Desktop Filter Dropdown (Hidden on Mobile) */}
        <div className="hidden md:flex gap-4">
          <div className="relative min-w-[200px]">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="w-full flex items-center justify-between bg-black/20 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-colors touch-manipulation"
            >
              <span>
                {filterType === 'all' && t.transactions.allCategories}
                {filterType === 'income' && t.transactions.income}
                {filterType === 'expense' && t.transactions.expense}
              </span>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showFilterDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowFilterDropdown(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-full bg-[#1a1625] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden animate-fade-in">
                  {[
                    { id: 'all', label: t.transactions.allCategories },
                    { id: 'income', label: t.transactions.income },
                    { id: 'expense', label: t.transactions.expense }
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setFilterType(option.id as 'all' | 'income' | 'expense');
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors touch-manipulation ${
                        filterType === option.id ? 'bg-primary/20 text-primary' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Table / List View */}
      <div className="md:glass-card md:overflow-hidden bg-transparent">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
              <Ghost size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t.dashboard.emptyState.title}</h3>
            <p className="text-gray-400 font-medium">{t.dashboard.emptyState.subtitle}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-white/5">
                    <th className="px-6 py-5">{t.transactions.table.date}</th>
                    <th className="px-6 py-5">{t.transactions.table.desc}</th>
                    <th className="px-6 py-5">{t.transactions.table.category}</th>
                    <th className="px-6 py-5 text-right">{t.transactions.table.amount}</th>
                    <th className="px-6 py-5 text-right">{t.transactions.table.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTransactions.map((tx) => {
                    const styles = getCategoryStyles(tx.category);
                    const Icon = styles.icon;
                    const date = new Date(tx.date);
                    
                    return (
                      <tr key={tx.id} className="group hover:bg-white/5 transition-colors">
                        <td className="px-6 py-5 text-gray-300 whitespace-nowrap">
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
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", styles.bg, styles.text)}>
                              <Icon size={20} />
                            </div>
                            <span className="font-semibold text-white">{tx.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={cn("px-3 py-1 rounded-full text-xs font-medium border", styles.text, styles.bg, styles.border)}>
                            {getTranslatedCategory(tx.category, settings.language)}
                          </span>
                        </td>
                        <td className={cn("px-6 py-5 text-right font-semibold whitespace-nowrap", 
                          tx.type === 'income' ? "text-green-400" : "text-red-400"
                        )}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEdit(tx)}
                              className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm(settings.language === 'id' ? 'Hapus transaksi ini?' : 'Delete this transaction?')) {
                                  deleteTransaction(tx.id);
                                }
                              }}
                              className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View (Modernized) */}
            <div className="md:hidden flex flex-col gap-3">
              {filteredTransactions.map((tx, index) => {
                const styles = getCategoryStyles(tx.category);
                const Icon = styles.icon;
                const date = new Date(tx.date);
                
                return (
                  <div 
                    key={tx.id} 
                    onClick={() => handleEdit(tx)}
                    className="group relative overflow-hidden bg-[#1a1625]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-4 active:scale-[0.98] transition-all duration-300 animate-slide-up-fade"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Background Gradient based on type */}
                    <div className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                      tx.type === 'income' 
                        ? "bg-gradient-to-r from-green-500/5 via-transparent to-transparent" 
                        : "bg-gradient-to-r from-red-500/5 via-transparent to-transparent"
                    )} />

                    <div className="relative z-10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5 overflow-hidden flex-1">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform duration-300 group-hover:scale-110", 
                          styles.bg, 
                          styles.text
                        )}>
                          <Icon size={22} strokeWidth={2} />
                        </div>
                        <div className="flex flex-col overflow-hidden min-w-0 gap-0.5">
                          <span className="font-bold text-white text-[15px] truncate leading-tight group-hover:text-primary transition-colors">
                            {tx.name}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <span className={cn("font-medium", styles.text)}>
                              {getTranslatedCategory(tx.category, settings.language)}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-600" />
                            <span>
                              {date.toLocaleDateString(settings.language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                        <span className={cn("font-bold text-base tracking-tight", 
                          tx.type === 'income' ? "text-green-400" : "text-red-400"
                        )}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                          <Clock size={10} />
                          {date.toLocaleTimeString(settings.language === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}


        {/* Pagination */}
        {transactions.length > 0 && (
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {t.transactions.pagination.showing} <span className="font-medium text-white">1-{filteredTransactions.length}</span> {t.transactions.pagination.of} <span className="font-medium text-white">{transactions.length}</span> {t.transactions.pagination.entries}
            </p>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-black/20 border border-white/5 text-gray-400 hover:text-white disabled:opacity-50">
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 rounded-lg bg-primary text-white font-medium flex items-center justify-center">
                1
              </button>
              <button className="p-2 rounded-lg bg-black/20 border border-white/5 text-gray-400 hover:text-white disabled:opacity-50">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Modal Add Transaction */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6 relative animate-fade-in-up max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-bold mb-6">
              {editingId 
                ? t.dashboard.modal.editTitle 
                : t.dashboard.modal.title}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">{t.dashboard.modal.name}</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/20 border border-white/5 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-primary/50"
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
                    className="w-full bg-black/20 border border-white/5 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-primary/50"
                    placeholder={t.dashboard.modal.amountPlaceholder}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">{t.dashboard.modal.category}</label>
                
                {/* Quick Select Grid */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {availableCategories.slice(0, 6).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setFormData({...formData, category: getTranslatedCategory(cat, settings.language)});
                        setShowCategoryDropdown(false);
                      }}
                      className={`px-2 py-1 rounded-xl text-xs font-medium transition-all border h-10 flex items-center justify-center text-center ${
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
                    onClick={() => {
                      setFormData({...formData, category: ''});
                      setShowCategoryDropdown(true);
                    }}
                    className="px-2 py-1 rounded-xl text-xs font-medium transition-all border bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white h-10 flex items-center justify-center text-center"
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
                      className="w-full bg-black/20 border border-white/5 rounded-xl py-2 px-4 pr-10 text-white focus:outline-none focus:border-primary/50 text-sm"
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
                  className="w-full bg-black/20 border border-white/5 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-primary/50"
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
                  className="w-full bg-black/20 border border-white/5 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-primary/50 [color-scheme:dark]"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white rounded-xl font-semibold transition-opacity shadow-lg shadow-primary/20"
                >
                  {t.dashboard.modal.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
