import { useState, useMemo } from 'react';
import { 
  Plus, 
  Calendar, 
  Search, 
  Landmark, 
  CreditCard, 
  PiggyBank, 
  AlertTriangle,
  Trash,
  X,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Check,
  RotateCcw
} from 'lucide-react';
import { cn, getTranslatedCategory, getCategoryStyles } from '../lib/utils';
import { useApp, Transaction, type Budget as BudgetType } from '../context/AppContext';
import { translations } from '../lib/translations';
import { format, addMonths, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';

export default function Budget() {
  const { budgets, transactions, addBudget, updateBudget, deleteBudget, formatCurrency, settings, updateSettings } = useApp();
  const t = translations[settings.language];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Total Budget Edit State
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [tempTotalBudget, setTempTotalBudget] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newBudget, setNewBudget] = useState({
    category: '',
    limit: ''
  });

  const handlePrevMonth = () => setSelectedDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setSelectedDate(prev => addMonths(prev, 1));

  // Get available categories for suggestions
  const availableCategories = useMemo(() => {
    const defaults: string[] = t.categories.default || [];
    // Filter out categories that already have a budget
    const existingBudgetNames = budgets.map(b => getTranslatedCategory(b.category, settings.language).toLowerCase());
    return defaults.filter(c => !existingBudgetNames.includes(c.toLowerCase()) && c !== 'Lainnya' && c !== 'Other');
  }, [budgets, t, settings.language]);

  // Calculate stats
  const sumOfCategories = budgets.reduce((acc: number, curr) => acc + curr.limit, 0);
  const totalBudget = settings.monthlyBudget && settings.monthlyBudget > 0 
    ? settings.monthlyBudget 
    : sumOfCategories;

  const handleSaveTotalBudget = () => {
    const val = parseInt(tempTotalBudget.replace(/\D/g, ''));
    if (!isNaN(val)) {
        updateSettings({ monthlyBudget: val });
    }
    setIsEditingTotal(false);
  };
  
  // Calculate used amount for each budget based on selected month's transactions
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  
  const currentMonthTransactions = transactions.filter((t: Transaction) => {
    const tDate = new Date(t.date);
    return tDate.getMonth() === currentMonth && 
           tDate.getFullYear() === currentYear &&
           t.type === 'expense';
  });

  const totalSpent = currentMonthTransactions.reduce((acc: number, curr) => acc + curr.amount, 0);
  const remaining = totalBudget - totalSpent;
  
  // Prepare budget data with usage
  const budgetsWithUsage = budgets.map(budget => {
    const used = currentMonthTransactions
      .filter((t: Transaction) => t.category.toLowerCase() === budget.category.toLowerCase())
      .reduce((acc: number, curr) => acc + curr.amount, 0);
      
    let percentage = 0;
    if (budget.limit > 0) {
      percentage = Math.min((used / budget.limit) * 100, 100);
    }
      
    return {
      ...budget,
      used,
      percentage,
      isOverbudget: budget.limit > 0 && used > budget.limit
    };
  }).filter(b => 
    getTranslatedCategory(b.category, settings.language).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = () => {
    setNewBudget({ category: '', limit: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEditBudget = (budget: BudgetType) => {
    setNewBudget({ 
      category: budget.category, 
      limit: budget.limit.toString() 
    });
    setEditingId(budget.id);
    setIsModalOpen(true);
  };

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudget.category || !newBudget.limit) return;
    
    // Check if budget for this category already exists
    if (budgets.some(b => b.category.toLowerCase() === newBudget.category.toLowerCase() && b.id !== editingId)) {
      alert(t.budget.modal.existsAlert);
      return;
    }
    
    const limit = parseInt(newBudget.limit.replace(/\D/g, ''));
    if (isNaN(limit)) {
      alert(t.budget.modal.invalidAlert);
      return;
    }

    if (editingId) {
      updateBudget(editingId, { category: newBudget.category, limit });
    } else {
      addBudget({ category: newBudget.category, limit });
    }
    setIsModalOpen(false);
  };

  const handleDeleteBudget = (id: string, categoryName: string) => {
    if (confirm(t.budget.deleteConfirm.replace('{category}', categoryName))) {
      deleteBudget(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 md:pb-10 relative">
      {/* Overbudget Alert */}
      {totalSpent > totalBudget && (
        <div className="w-full">
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center gap-4 shadow-lg">
            <div className="p-2 bg-red-500/20 rounded-full shrink-0">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-red-500 text-lg">{t.budget.alert.overbudgetTitle}</h4>
              <p className="text-sm text-red-400/90">
                {t.budget.alert.overbudgetDesc} <span className="font-bold underline">{formatCurrency(totalSpent - totalBudget)}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">{t.budget.title}</h2>
            <p className="text-gray-400 mt-1">{t.budget.subtitle}</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                    type="text" 
                    placeholder={t.transactions.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/20 border border-white/5 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
                />
            </div>
        </div>
      </div>

      {/* Date & Add Button */}
      <div className="flex flex-col sm:flex-row justify-end gap-4">
        {/* Month Selector */}
        <div className="flex items-center justify-between sm:justify-start bg-white/5 border border-white/5 rounded-lg p-1">
            <button 
                onClick={handlePrevMonth} 
                className="p-3 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
            >
                <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-2 px-3 text-sm font-medium min-w-[140px] justify-center">
                <Calendar size={16} className="text-gray-400" />
                {format(selectedDate, 'MMMM yyyy', { locale: settings.language === 'id' ? id : undefined })}
            </div>
            <button 
                onClick={handleNextMonth} 
                className="p-3 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
            >
                <ChevronRight size={16} />
            </button>
        </div>

        <button 
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20"
        >
            <Plus size={16} />
            {t.budget.addBudget}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Total Budget */}
        <div className="glass-card p-4 md:p-6 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
                <p className="text-gray-400 text-sm">{t.budget.totalBudget}</p>
                <div className="flex gap-2">
                    {!isEditingTotal && (
                        <button 
                            onClick={() => {
                                setTempTotalBudget(totalBudget.toString());
                                setIsEditingTotal(true);
                            }}
                            className="text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Pencil size={16} />
                        </button>
                    )}
                    <Landmark className="text-gray-500" size={24} />
                </div>
            </div>

            {isEditingTotal ? (
                <div className="flex items-center gap-2 mb-2">
                    <input 
                        type="text" 
                        autoFocus
                        value={tempTotalBudget}
                        onChange={(e) => {
                             const val = e.target.value.replace(/\D/g, '');
                             setTempTotalBudget(val ? parseInt(val).toLocaleString('id-ID') : '');
                        }}
                        className="w-full bg-white/10 border border-white/10 rounded px-2 py-1 text-lg font-bold focus:outline-none focus:border-primary"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveTotalBudget();
                            if (e.key === 'Escape') setIsEditingTotal(false);
                        }}
                    />
                    <button onClick={handleSaveTotalBudget} className="text-green-400 hover:text-green-300">
                        <Check size={20} />
                    </button>
                    <button onClick={() => setIsEditingTotal(false)} className="text-red-400 hover:text-red-300">
                        <X size={20} />
                    </button>
                </div>
            ) : (
                <h3 className="text-2xl font-bold mb-2">{formatCurrency(totalBudget)}</h3>
            )}
            
            <div className="flex justify-between items-center">
                <p className="text-green-400 text-xs font-medium flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-green-400"></span>
                    {t.budget.monthlyTarget}
                </p>
                {settings.monthlyBudget && settings.monthlyBudget > 0 && (
                     <button 
                        onClick={() => updateSettings({ monthlyBudget: 0 })}
                        className="text-[10px] text-gray-500 hover:text-primary flex items-center gap-1"
                        title={t.budget.resetTooltip}
                     >
                        <RotateCcw size={10} /> {t.budget.resetButton}
                     </button>
                )}
            </div>
        </div>

        {/* Total Spent */}
        <div className={cn("glass-card p-4 md:p-6 relative overflow-hidden transition-all", totalSpent > totalBudget && "border-red-500/50 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.2)]")}>
            <div className="flex justify-between items-start mb-4">
                <p className="text-gray-400 text-sm">{t.budget.spending}</p>
                <CreditCard className="text-gray-500" size={24} />
            </div>
            <div className="flex items-baseline gap-2 mb-4">
                <h3 className="text-2xl font-bold">{formatCurrency(totalSpent)}</h3>
                {totalSpent > totalBudget && (
                    <span className="text-xs text-red-400 font-medium animate-pulse">
                        +{formatCurrency(totalSpent - totalBudget)}
                    </span>
                )}
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full", totalSpent > totalBudget ? "bg-red-500" : "bg-primary")} 
                  style={{ width: `${Math.min((totalSpent / (totalBudget || 1)) * 100, 100)}%` }}
                />
            </div>
        </div>

        {/* Remaining */}
        <div className="glass-card p-4 md:p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
                <p className="text-gray-400 text-sm">{t.budget.remaining}</p>
                <PiggyBank className="text-gray-500" size={24} />
            </div>
            <h3 className={cn("text-2xl font-bold mb-2", remaining < 0 ? "text-red-400" : "text-white")}>
              {formatCurrency(remaining)}
            </h3>
            <p className="text-gray-400 text-xs">
              {remaining < 0 ? t.budget.status.overbudget : t.budget.status.safe}
            </p>
        </div>
      </div>

      {/* Separator */}
      <div className="flex items-center gap-4 py-4">
        <h3 className="text-lg font-semibold text-white whitespace-nowrap">{t.budget.categoryDetails}</h3>
        <div className="h-px bg-gradient-to-r from-white/10 to-transparent w-full" />
      </div>

      {/* Budget Cards Grid */}
      {budgetsWithUsage.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
            <PiggyBank size={48} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{t.budget.emptyState.title}</h3>
          <p className="text-gray-400 font-medium">{t.budget.emptyState.subtitle}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-fade-in-up">
          {budgetsWithUsage.map((budget) => {
              const styles = getCategoryStyles(budget.category);
              const Icon = styles.icon;
              
              return (
                  <div key={budget.id} className={cn("glass-card p-4 md:p-6 relative group border border-white/5 transition-all hover:border-primary/20", budget.isOverbudget && "border-red-500/50 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.2)]")}>
                      <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 text-primary", budget.isOverbudget && "bg-red-500/10 text-red-400", styles.color, styles.bg)}>
                                  <Icon size={20} />
                              </div>
                              <div>
                                  <h4 className="font-semibold">{getTranslatedCategory(budget.category, settings.language)}</h4>
                                  <p className="text-xs text-gray-400">{budget.isOverbudget ? t.budget.status.overbudgetExcl : t.budget.status.onTrack}</p>
                              </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEditBudget(budget)}
                              className="text-gray-500 hover:text-primary transition-colors p-2 hover:bg-white/5 rounded-lg"
                            >
                                <Pencil size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeleteBudget(budget.id, getTranslatedCategory(budget.category, settings.language))}
                              className="text-gray-500 hover:text-red-400 transition-colors p-2 hover:bg-white/5 rounded-lg"
                            >
                                <Trash size={18} />
                            </button>
                          </div>
                      </div>

                      <div className="mb-2 flex justify-between items-end">
                          <div className="flex items-baseline gap-1">
                              <span className={cn("text-2xl font-bold", budget.isOverbudget ? "text-red-400" : "text-white")}>
                                  {Math.round(budget.percentage)}%
                              </span>
                              <span className="text-sm text-gray-400">{t.budget.spending}</span>
                          </div>
                          <div className="text-xs px-2 py-1 rounded bg-white/5 border border-white/5 text-gray-400 font-mono">
                              {formatCurrency(budget.limit)}
                          </div>
                      </div>
                      
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full transition-all duration-500", budget.isOverbudget ? "bg-red-500" : "bg-primary")}
                          style={{ width: `${budget.percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-end items-center gap-2 mt-2">
                        {budget.isOverbudget && (
                          <span className="text-xs text-red-400 font-medium animate-pulse">
                            +{formatCurrency(budget.used - budget.limit)}
                          </span>
                        )}
                        <p className="text-xs text-gray-500 text-right">
                          {t.budget.spending}: {formatCurrency(budget.used)}
                        </p>
                      </div>
                  </div>
              );
          })}
        </div>
      )}
      {/* Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6 relative animate-fade-in-up max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-bold mb-6">
              {editingId ? t.budget.editBudget : t.budget.addBudget}
            </h3>
            
            <form onSubmit={handleAddBudget} className="space-y-6">
              {/* Category Input */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">{t.dashboard.modal.category}</label>
                
                {/* Suggestions - Only show when NOT editing */}
                {!editingId && availableCategories.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">{t.budget.modal.categoryPrompt}</p>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                      {availableCategories.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNewBudget({...newBudget, category: cat})}
                          className={`px-3 py-2.5 rounded-lg text-xs font-medium border transition-all touch-manipulation ${
                            newBudget.category === cat
                              ? 'bg-primary/20 border-primary/50 text-primary'
                              : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <input 
                    type="text"  
                    value={newBudget.category}
                    onChange={e => setNewBudget({...newBudget, category: e.target.value})}
                    className="w-full bg-black/20 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50"
                    placeholder="cth. Makanan"
                    required
                    disabled={!!editingId} // Disable category edit when updating
                />
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">{t.dashboard.modal.amount}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                    {settings.currency === 'IDR' ? 'Rp' : '$'}
                  </span>
                  <input 
                    type="text" 
                    required
                    value={newBudget.limit}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setNewBudget({...newBudget, limit: val ? parseInt(val).toLocaleString('id-ID') : ''});
                    }}
                    className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="0"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity rounded-xl font-bold shadow-lg shadow-primary/20"
              >
                {editingId ? 'Simpan Perubahan' : t.budget.addBudget}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}