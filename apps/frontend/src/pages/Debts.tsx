import { useState, useMemo, useEffect } from 'react';
import { Plus, ArrowUpRight, ArrowDownRight, MoreVertical, Calendar, Check, Clock, Ghost, User, X, Banknote, Search, ChevronDown, ChevronUp, Trash, Pencil } from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp, Debt } from '../context/AppContext';
import { translations } from '../lib/translations';

export default function Debts() {
  const { debts, formatCurrency, addDebt, updateDebt, payDebt, deleteDebt, settings } = useApp();
  const t = translations[settings.language];
  const [activeTab, setActiveTab] = useState<'debts' | 'receivables'>('debts');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payModalData, setPayModalData] = useState<Debt | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  
  // New state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{top: number, right: number} | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Form States
  const [formData, setFormData] = useState({
    personName: '',
    description: '',
    amount: '',
    dueDate: '',
    transactionDate: new Date().toISOString().slice(0, 10),
    type: 'debt' as 'debt' | 'receivable'
  });
  
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isModalOpen && !editingId) {
      setFormData({
        personName: '',
        description: '',
        amount: '',
        dueDate: '',
        transactionDate: new Date().toISOString().slice(0, 10),
        type: activeTab === 'debts' ? 'debt' : 'receivable'
      });
    }
  }, [isModalOpen, activeTab, editingId]);

  // Close menu on scroll or resize
  useEffect(() => {
    const handleScroll = () => {
        if (openActionId) {
            setOpenActionId(null);
            setMenuPosition(null);
        }
    };
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleScroll);
    };
  }, [openActionId]);

  // Reset pay form when pay modal opens
  useEffect(() => {
    if (payModalData) {
      setPayAmount('');
      setPayNote('');
    }
  }, [payModalData]);

  // Filter debts
  const filteredDebts = useMemo(() => {
    return debts.filter(item => {
      const matchesTab = activeTab === 'debts' ? item.type === 'debt' : item.type === 'receivable';
      const matchesSearch = item.personName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    }).sort((a, b) => {
        // Sort by status (unpaid first) then date
        if (a.status !== b.status) return a.status === 'unpaid' ? -1 : 1;
        return new Date(b.dueDate || 0).getTime() - new Date(a.dueDate || 0).getTime();
    });
  }, [debts, activeTab, searchQuery]);

  const totalDebt = debts
    .filter(d => d.type === 'debt' && d.status === 'unpaid')
    .reduce((acc, curr) => acc + (curr.amount - (curr.paidAmount || 0)), 0);

  const totalReceivables = debts
    .filter(d => d.type === 'receivable' && d.status === 'unpaid')
    .reduce((acc, curr) => acc + (curr.amount - (curr.paidAmount || 0)), 0);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    // Remove non-digits
    const value = e.target.value.replace(/\D/g, '');
    // Format for display (optional, but input usually keeps raw value or we format it)
    // Here we just store raw string for simplicity in state, and format on blur or just display formatted
    // But user asked for "auto-formatting ribuan (contoh: 100000 otomatis menjadi 100.000)"
    
    // We can store the formatted string in state, but need to strip it when submitting
    if (value === '') {
        setter('');
        return;
    }
    const num = parseInt(value);
    setter(new Intl.NumberFormat(settings.language === 'id' ? 'id-ID' : 'en-US').format(num));
  };

  const getRawAmount = (formatted: string) => {
    return parseInt(formatted.replace(/\./g, '').replace(/,/g, '')) || 0;
  };

  const handleEdit = (item: Debt) => {
      setEditingId(item.id);
      setFormData({
          personName: item.personName,
          description: item.description,
          amount: new Intl.NumberFormat(settings.language === 'id' ? 'id-ID' : 'en-US').format(item.amount),
          dueDate: item.dueDate ? new Date(item.dueDate).toISOString().slice(0, 10) : '',
          transactionDate: new Date().toISOString().slice(0, 10),
          type: item.type
      });
      setIsModalOpen(true);
      setOpenActionId(null);
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (openActionId === id) {
          setOpenActionId(null);
          setMenuPosition(null);
      } else {
          const rect = e.currentTarget.getBoundingClientRect();
          setMenuPosition({
              top: rect.bottom + window.scrollY + 8,
              right: window.innerWidth - rect.right
          });
          setOpenActionId(id);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.personName || !formData.amount) return;

    if (editingId) {
        updateDebt(editingId, {
            personName: formData.personName,
            description: formData.description,
            amount: getRawAmount(formData.amount),
            dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
            type: formData.type,
        });
    } else {
        addDebt({
            personName: formData.personName,
            description: formData.description,
            amount: getRawAmount(formData.amount),
            dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
            type: formData.type,
            date: formData.transactionDate ? new Date(formData.transactionDate).toISOString() : new Date().toISOString(),
        });
    }
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalData || !payAmount) return;

    const amount = getRawAmount(payAmount);
    if (amount <= 0) return;

    payDebt(payModalData.id, amount, payNote);
    setPayModalData(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          {t.debts.addDebt}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <ArrowDownRight size={100} />
            </div>
            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">{t.debts.totalDebt}</p>
            <div className="flex items-end gap-4">
                <h3 className="text-4xl font-bold text-red-400">{formatCurrency(totalDebt)}</h3>
            </div>
        </div>
        <div className="glass-card p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <ArrowUpRight size={100} />
            </div>
            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">{t.debts.totalReceivables}</p>
            <div className="flex items-end gap-4">
                <h3 className="text-4xl font-bold text-green-400">{formatCurrency(totalReceivables)}</h3>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="glass-card overflow-hidden">
        {/* Tabs & Search */}
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex gap-4 w-full sm:w-auto">
                <button 
                    onClick={() => setActiveTab('debts')}
                    className={cn("px-6 py-2 rounded-lg font-medium transition-colors flex-1 sm:flex-none text-center", activeTab === 'debts' ? "bg-primary text-white" : "text-gray-400 hover:text-white hover:bg-white/5")}
                >
                    {t.debts.tabs.debt}
                </button>
                <button 
                    onClick={() => setActiveTab('receivables')}
                    className={cn("px-6 py-2 rounded-lg font-medium transition-colors flex-1 sm:flex-none text-center", activeTab === 'receivables' ? "bg-primary text-white" : "text-gray-400 hover:text-white hover:bg-white/5")}
                >
                    {t.debts.tabs.receivable}
                </button>
            </div>
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                    type="text" 
                    placeholder={t.debts.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50"
                />
            </div>
        </div>

        {/* Table */}
        {filteredDebts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
              <Ghost size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {activeTab === 'debts' ? t.debts.emptyState.debt.title : t.debts.emptyState.receivable.title}
            </h3>
            <p className="text-gray-400 font-medium">
              {activeTab === 'debts' ? t.debts.emptyState.debt.subtitle : t.debts.emptyState.receivable.subtitle}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-white/5">
                  <th className="px-6 py-5">{t.debts.table.name}</th>
                  <th className="px-6 py-5">{t.debts.table.amount}</th>
                  <th className="px-6 py-5">{t.debts.table.remaining}</th>
                  <th className="px-6 py-5">{t.debts.table.dueDate}</th>
                  <th className="px-6 py-5">{t.debts.table.status}</th>
                  <th className="px-6 py-5 text-right">{t.debts.table.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDebts.map((item) => {
                  const isExpanded = expandedIds.includes(item.id);
                  const paid = item.paidAmount || 0;
                  const progress = Math.min((paid / item.amount) * 100, 100);
                  
                  return (
                    <>
                      <tr key={item.id} className="group hover:bg-white/5 transition-colors cursor-pointer" onClick={() => toggleExpand(item.id)}>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleExpand(item.id); }}
                                className="p-1 rounded-full hover:bg-white/10 text-gray-400 transition-colors"
                            >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white bg-white/10 border border-white/10 shrink-0")}>
                              <User size={20} className="text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-white">{item.personName}</p>
                              <p className="text-xs text-gray-400">{item.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-gray-300">
                          {formatCurrency(item.amount)}
                        </td>
                        <td className="px-6 py-5 font-bold text-white">
                          {formatCurrency(item.amount - paid)}
                        </td>
                        <td className="px-6 py-5 text-gray-300">
                          <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-gray-500" />
                              {item.dueDate ? new Date(item.dueDate).toLocaleDateString(settings.language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={cn(
                              "px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit",
                              item.status === 'paid' ? "text-green-400 bg-green-400/10 border-green-400/20" :
                              "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
                          )}>
                              {item.status === 'paid' ? <Check size={12} /> : <Clock size={12} />}
                              {item.status === 'paid' ? t.debts.table.paid : t.debts.table.unpaid}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                                {item.status === 'unpaid' && (
                                    <button 
                                        onClick={() => setPayModalData(item)}
                                        className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors flex items-center gap-2"
                                        title={t.debts.modal.payTitle}
                                    >
                                        <Banknote size={16} />
                                        <span className="text-xs font-bold">{t.debts.payAction}</span>
                                    </button>
                                )}
                                <div className="relative">
                                    <button 
                                        onClick={(e) => toggleMenu(e, item.id)}
                                        className={cn(
                                            "p-2 rounded-lg transition-colors",
                                            openActionId === item.id ? "bg-white/10 text-white" : "hover:bg-white/5 text-gray-400 hover:text-white"
                                        )}
                                    >
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-white/[0.02]">
                            <td colSpan={6} className="px-6 py-4">
                                <div className="space-y-4">
                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-gray-400">
                                            <span>{t.debts.paymentProgress}</span>
                                            <span>{Math.round(progress)}% ({formatCurrency(paid)} / {formatCurrency(item.amount)})</span>
                                        </div>
                                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div 
                                                className={cn("h-full transition-all duration-500", item.type === 'debt' ? "bg-red-500" : "bg-green-500")} 
                                                style={{ width: `${progress}%` }} 
                                            />
                                        </div>
                                    </div>

                                    {/* Payment History */}
                                    <div className="space-y-3">
                                        <p className="text-xs font-semibold text-gray-400 flex items-center gap-2 mb-4">
                                            <Clock size={12} />
                                            {t.debts.paymentHistory}
                                        </p>
                                        {item.payments && item.payments.length > 0 ? (
                                            <div className="relative pl-4 border-l border-white/10 space-y-6 ml-2">
                                                {item.payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(p => (
                                                    <div key={p.id} className="relative">
                                                        <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] border-2 border-[#1a1b26]" />
                                                        
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-baseline justify-between">
                                                                <span className="text-xs text-gray-400 font-medium">
                                                                    {new Date(p.date).toLocaleDateString(settings.language === 'id' ? 'id-ID' : 'en-US', { 
                                                                        weekday: 'long', 
                                                                        day: 'numeric', 
                                                                        month: 'long', 
                                                                        year: 'numeric' 
                                                                    })}
                                                                    <span className="mx-2 text-gray-600">•</span>
                                                                    {new Date(p.date).toLocaleTimeString(settings.language === 'id' ? 'id-ID' : 'en-US', { 
                                                                        hour: '2-digit', 
                                                                        minute: '2-digit' 
                                                                    })}
                                                                </span>
                                                                <span className="text-green-400 font-bold font-mono text-sm">
                                                                    +{formatCurrency(p.amount)}
                                                                </span>
                                                            </div>
                                                            {p.note && (
                                                                <div className="text-xs text-gray-500 bg-white/5 px-3 py-2 rounded-lg mt-1 border border-white/5 italic w-fit">
                                                                    "{p.note}"
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-8 text-center bg-white/5 rounded-xl border border-white/5 border-dashed">
                                                <Ghost size={24} className="text-gray-600 mb-2" />
                                                <p className="text-xs text-gray-500 italic">{t.debts.noPaymentHistory}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Debt Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1a1b26] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{editingId ? t.debts.modal.editTitle : t.debts.modal.title}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Type Selection */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'debt'})}
                  className={cn(
                    "p-3 rounded-xl border text-sm font-medium transition-all",
                    formData.type === 'debt' 
                      ? "bg-red-500/20 border-red-500 text-red-400" 
                      : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                  )}
                >
                  {t.debts.modal.debtType}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'receivable'})}
                  className={cn(
                    "p-3 rounded-xl border text-sm font-medium transition-all",
                    formData.type === 'receivable' 
                      ? "bg-green-500/20 border-green-500 text-green-400" 
                      : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                  )}
                >
                  {t.debts.modal.receivableType}
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">{t.debts.modal.personLabel}</label>
                <input
                  type="text"
                  required
                  value={formData.personName}
                  onChange={e => setFormData({...formData, personName: e.target.value})}
                  placeholder={t.debts.modal.personPlaceholder}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">{t.debts.modal.amountLabel}</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                    <input
                    type="text"
                    required
                    value={formData.amount}
                    onChange={(e) => handleAmountChange(e, (val) => setFormData({...formData, amount: val}))}
                    placeholder="0"
                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">{t.debts.modal.dateLabel}</label>
                    <input
                    type="date"
                    required
                    value={formData.transactionDate}
                    onChange={e => setFormData({...formData, transactionDate: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">{t.debts.modal.dueDateLabel}</label>
                    <input
                    type="date"
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">{t.debts.modal.descLabel}</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-colors resize-none h-24"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-primary/25 mt-2"
              >
                {t.debts.modal.save}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Pay Debt Modal */}
      {payModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1a1b26] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{t.debts.modal.payTitle}</h3>
              <button onClick={() => setPayModalData(null)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handlePaySubmit} className="p-6 space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-sm text-gray-400">{payModalData.type === 'debt' ? t.debts.modal.totalDebtLabel : t.debts.modal.totalReceivableLabel}</p>
                <p className="text-xl font-bold text-white">{formatCurrency(payModalData.amount)}</p>
                <div className="mt-2 flex justify-between text-xs">
                    <span className="text-gray-500">{t.debts.modal.alreadyPaid}</span>
                    <span className="text-green-400">{formatCurrency(payModalData.paidAmount || 0)}</span>
                </div>
                <div className="mt-1 flex justify-between text-xs font-bold">
                    <span className="text-gray-400">{t.debts.modal.remaining}</span>
                    <span className="text-red-400">{formatCurrency(payModalData.amount - (payModalData.paidAmount || 0))}</span>
                </div>
              </div>

              {/* Payment History */}
              {payModalData.payments && payModalData.payments.length > 0 && (
                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <p className="text-xs font-semibold text-gray-400 mb-3 flex items-center gap-2">
                        <Clock size={12} />
                        {t.debts.paymentHistory}
                    </p>
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar mt-2">
                      {payModalData.payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(p => (
                          <div key={p.id} className="group flex justify-between items-center text-xs bg-white/5 hover:bg-white/10 transition-colors p-3 rounded-xl border border-white/5">
                              <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2 text-gray-400">
                                      <Calendar size={10} />
                                      <span className="font-medium">
                                          {new Date(p.date).toLocaleDateString(settings.language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                      </span>
                                      <span className="w-1 h-1 rounded-full bg-gray-600" />
                                      <span className="text-gray-500">
                                          {new Date(p.date).toLocaleTimeString(settings.language === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                  </div>
                                  {p.note && <span className="text-gray-500 italic pl-4 border-l-2 border-white/10">"{p.note}"</span>}
                              </div>
                              <span className="text-green-400 font-mono font-bold bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20 group-hover:border-green-500/40 transition-colors">
                                  +{formatCurrency(p.amount)}
                              </span>
                          </div>
                      ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">{t.debts.modal.payAmount}</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                    <input
                    type="text"
                    required
                    value={payAmount}
                    onChange={(e) => handleAmountChange(e, setPayAmount)}
                    placeholder="0"
                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">{t.debts.modal.payNote}</label>
                <input
                  type="text"
                  value={payNote}
                  onChange={e => setPayNote(e.target.value)}
                  placeholder="Cicilan ke-1, Pelunasan, dll"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-green-500/25 mt-2"
              >
                {t.debts.modal.payButton}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {openActionId && menuPosition && (
        <div 
            className="fixed z-50 w-48 bg-[#1a1625] border border-white/10 rounded-xl shadow-xl overflow-hidden animate-fade-in"
            style={{ 
                top: menuPosition.top, 
                right: menuPosition.right 
            }}
            onClick={e => e.stopPropagation()}
        >
            <button
                onClick={() => {
                    const item = debts.find(d => d.id === openActionId);
                    if (item) handleEdit(item);
                }}
                className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3"
            >
                <Pencil size={16} />
                Ubah
            </button>
            <button
                onClick={() => {
                    deleteDebt(openActionId);
                    setOpenActionId(null);
                }}
                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/5 flex items-center gap-3"
            >
                <Trash size={16} />
                Hapus
            </button>
        </div>
      )}

      {/* Backdrop for menu */}
      {openActionId && (
        <div className="fixed inset-0 z-40" onClick={() => setOpenActionId(null)} />
      )}
    </div>
  );
}