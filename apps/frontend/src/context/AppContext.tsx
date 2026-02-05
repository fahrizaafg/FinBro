import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useUndoRedo, Command } from '../hooks/useUndoRedo';
import { migrateDebts, migrateCategories, performV4Migration } from '../lib/migrations';

// Types
export interface Transaction {
  id: string;
  name: string;
  desc: string;
  category: string;
  date: string; // ISO string
  amount: number;
  type: 'income' | 'expense';
}

export interface DebtPayment {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Debt {
  id: string;
  personName: string;
  description: string;
  amount: number;
  paidAmount: number;
  payments: DebtPayment[];
  dueDate?: string;
  type: 'debt' | 'receivable'; // Hutang (saya berhutang) | Piutang (orang berhutang)
  status: 'unpaid' | 'paid';
  transactionId?: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
}

export interface User {
  name: string;
  avatar?: string;
}

export interface Settings {
  currency: 'IDR' | 'USD';
  language: 'id' | 'en';
  monthlyBudget?: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  type: 'income' | 'expense';
  isDefault?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface AppContextType {
  user: User | null;
  settings: Settings;
  transactions: Transaction[];
  debts: Debt[];
  budgets: Budget[];
  customCategories: CategoryItem[];
  notifications: Notification[];
  login: (username: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addDebt: (debt: Omit<Debt, 'id' | 'paidAmount' | 'payments' | 'status'> & { date?: string }) => void;
  payDebt: (id: string, amount: number, note?: string) => void;
  updateDebt: (id: string, updates: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, updates: { category?: string; limit?: number }) => void;
  deleteBudget: (id: string) => void;
  addCustomCategory: (category: string, type?: 'income' | 'expense') => void;
  
  // Notification Methods
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;

  formatCurrency: (amount: number) => string;
  importData: (data: { transactions?: Transaction[]; debts?: Debt[]; budgets?: Budget[]; settings?: Settings; customCategories?: CategoryItem[] }) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  history: Command[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // State
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('finbro_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('finbro_settings');
    const defaultSettings: Settings = { currency: 'IDR', language: 'id', monthlyBudget: 0 };
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finbro_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem('finbro_debts');
    return migrateDebts(saved);
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('finbro_budgets');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse budgets', e);
      return [];
    }
  });

  const [customCategories, setCustomCategories] = useState<CategoryItem[]>(() => {
    const savedV2 = localStorage.getItem('finbro_categories_v2');
    const savedOld = localStorage.getItem('finbro_custom_categories');
    return migrateCategories(savedV2, savedOld);
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('finbro_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Effects for Persistence
  useEffect(() => localStorage.setItem('finbro_user', JSON.stringify(user)), [user]);
  useEffect(() => localStorage.setItem('finbro_settings', JSON.stringify(settings)), [settings]);
  useEffect(() => localStorage.setItem('finbro_transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('finbro_debts', JSON.stringify(debts)), [debts]);
  useEffect(() => localStorage.setItem('finbro_budgets', JSON.stringify(budgets)), [budgets]);
  useEffect(() => localStorage.setItem('finbro_categories_v2', JSON.stringify(customCategories)), [customCategories]);
  useEffect(() => localStorage.setItem('finbro_notifications', JSON.stringify(notifications)), [notifications]);

  // Welcome Notification
  useEffect(() => {
    const hasWelcomeNotification = localStorage.getItem('finbro_welcome_notification_shown');
    if (!hasWelcomeNotification) {
      const welcomeNotification: Notification = {
        id: crypto.randomUUID(),
        title: 'Selamat Datang di FinBro! 👋',
        message: 'Mulai kelola keuangan Anda dengan mudah. Catat transaksi, atur anggaran, dan pantau hutang piutang Anda.',
        type: 'info',
        date: new Date().toISOString(),
        isRead: false
      };
      
      setNotifications(prev => {
        if (prev.length === 0) return [welcomeNotification];
        return [welcomeNotification, ...prev];
      });
      
      localStorage.setItem('finbro_welcome_notification_shown', 'true');
    }
  }, []);

  // One-time migration (v4)
  useEffect(() => {
    const v4MigrationDone = localStorage.getItem('finbro_defaults_v4_done');
    if (!v4MigrationDone) {
      const { updatedBudgets, updatedCategories } = performV4Migration(settings, budgets, customCategories, transactions);
      
      setBudgets(updatedBudgets);
      setCustomCategories(updatedCategories);
      
      localStorage.setItem('finbro_defaults_v4_done', 'true');
      localStorage.setItem('finbro_defaults_v3_done', 'true');
      localStorage.setItem('finbro_defaults_v2_done', 'true');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount. Dependencies omitted intentionally for one-off migration check.

  // Undo/Redo Hook
  const { addCommand, undo, redo, canUndo, canRedo, history } = useUndoRedo();

  // Actions wrapped in useCallback
  const login = useCallback((name: string) => setUser({ name }), []);
  const logout = useCallback(() => setUser(null), []);
  
  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id'>) => {
    if (tx.amount < 0) {
      console.error('Amount must be positive');
      return;
    }

    const newTx = { ...tx, id: crypto.randomUUID() };
    
    const doAdd = () => setTransactions(prev => [newTx, ...prev]);
    const doRemove = () => setTransactions(prev => prev.filter(t => t.id !== newTx.id));

    doAdd();
    addCommand({
        name: `Tambah Transaksi: ${tx.name}`,
        undo: doRemove,
        redo: doAdd
    });
  }, [addCommand]);
  
  const updateTransactionAction = useCallback((id: string, updates: Partial<Transaction>) => {
    if (updates.amount !== undefined && updates.amount < 0) return;

    const tx = transactions.find(t => t.id === id);
    if (!tx) return;
    const oldTx = { ...tx };

    const doUpdate = () => setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    const doRevert = () => setTransactions(prev => prev.map(t => t.id === id ? oldTx : t));

    doUpdate();
    addCommand({ name: `Update Transaksi: ${tx.name}`, undo: doRevert, redo: doUpdate });
  }, [transactions, addCommand]);

  const addCustomCategory = useCallback((category: string, type: 'income' | 'expense' = 'expense') => {
    const id = crypto.randomUUID();
    const newCategory = { id, name: category, type };

    const doAdd = () => setCustomCategories(prev => {
      if (prev.some(c => c.name.toLowerCase() === category.toLowerCase() && c.type === type)) return prev;
      return [...prev, newCategory];
    });
    const doRemove = () => setCustomCategories(prev => prev.filter(c => c.id !== id));

    doAdd();
    addCommand({ name: `Tambah Kategori: ${category}`, undo: doRemove, redo: doAdd });
  }, [addCommand]);

  const addDebt = useCallback((debt: Omit<Debt, 'id' | 'paidAmount' | 'payments' | 'status'> & { date?: string }) => {
    if (debt.amount < 0) return;

    const debtId = crypto.randomUUID();
    const transactionId = crypto.randomUUID();
    const date = debt.date || new Date().toISOString();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { date: _date, ...debtData } = debt;

    const newDebt: Debt = { 
      ...debtData, id: debtId, paidAmount: 0, payments: [], status: 'unpaid', transactionId 
    };
    
    const isDebt = debt.type === 'debt';
    const txType = isDebt ? 'income' : 'expense';
    const txCategory = isDebt ? 'Pinjaman' : 'Piutang';
    
    const newTx: Transaction = {
      id: transactionId, name: debt.personName, desc: debt.description || (isDebt ? 'Terima Hutang' : 'Beri Pinjaman'),
      category: txCategory, date: date, amount: debt.amount, type: txType
    };
    
    const doAdd = () => {
        setDebts(prev => [newDebt, ...prev]);
        setTransactions(prev => [newTx, ...prev]);
    };
    const doRemove = () => {
        setDebts(prev => prev.filter(d => d.id !== debtId));
        setTransactions(prev => prev.filter(t => t.id !== transactionId));
    };

    doAdd();
    addCommand({ name: `Tambah ${isDebt ? 'Hutang' : 'Piutang'}: ${debt.personName}`, undo: doRemove, redo: doAdd });
  }, [addCommand]);

  const payDebt = useCallback((id: string, amount: number, note?: string) => {
    const debt = debts.find(d => d.id === id);
    if (!debt) return;
    
    const oldDebt = { ...debt };
    const paymentId = crypto.randomUUID();
    const transactionId = crypto.randomUUID();
    const dateNow = new Date().toISOString();

    const doPay = () => {
        setDebts(prev => prev.map(d => {
            if (d.id !== id) return d;
            if (d.payments.some(p => p.id === paymentId)) return d;
            const newPaid = d.paidAmount + amount;
            const isPaid = newPaid >= d.amount;
            const payment: DebtPayment = { id: paymentId, amount, date: dateNow, note };
            return { ...d, paidAmount: newPaid, status: isPaid ? 'paid' : 'unpaid', payments: [payment, ...d.payments] };
        }));

        const isDebt = debt.type === 'debt';
        const txType = isDebt ? 'expense' : 'income';
        const txCategory = isDebt ? 'Bayar Hutang' : 'Terima Piutang';
        
        const newTx: Transaction = {
          id: transactionId, name: `Bayar: ${debt.personName}`, desc: note || `Pembayaran ${isDebt ? 'Hutang' : 'Piutang'}`,
          category: txCategory, date: dateNow, amount: amount, type: txType
        };
        
        setTransactions(prev => {
            if (prev.some(t => t.id === transactionId)) return prev;
            return [newTx, ...prev];
        });
    };

    const doUnpay = () => {
        setDebts(prev => prev.map(d => d.id === id ? oldDebt : d));
        setTransactions(prev => prev.filter(t => t.id !== transactionId));
    };

    doPay();
    addCommand({ name: `Bayar Hutang: ${debt.personName}`, undo: doUnpay, redo: doPay });
  }, [debts, addCommand]);

  const updateDebt = useCallback((id: string, updates: Partial<Debt>) => {
    const debt = debts.find(d => d.id === id);
    if (!debt) return;
    const oldDebt = { ...debt };

    const doUpdate = () => setDebts(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    const doRevert = () => setDebts(prev => prev.map(d => d.id === id ? oldDebt : d));

    doUpdate();
    addCommand({ name: `Update Hutang: ${debt.personName}`, undo: doRevert, redo: doUpdate });
  }, [debts, addCommand]);

  const deleteTransaction = useCallback((id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    const doRemove = () => setTransactions(prev => prev.filter(t => t.id !== id));
    const doRestore = () => setTransactions(prev => [tx, ...prev]);

    doRemove();
    addCommand({ name: `Hapus Transaksi: ${tx.name}`, undo: doRestore, redo: doRemove });
  }, [transactions, addCommand]);

  const deleteDebt = useCallback((id: string) => {
    const debt = debts.find(d => d.id === id);
    if (!debt) return;
    
    const doRemove = () => setDebts(prev => prev.filter(d => d.id !== id));
    const doRestore = () => setDebts(prev => [debt, ...prev]);

    doRemove();
    addCommand({ name: `Hapus Hutang: ${debt.personName}`, undo: doRestore, redo: doRemove });
  }, [debts, addCommand]);

  const addBudget = useCallback((budget: Omit<Budget, 'id'>) => {
    const newBudget = { ...budget, id: crypto.randomUUID() };
    const doAdd = () => setBudgets(prev => [newBudget, ...prev]);
    const doRemove = () => setBudgets(prev => prev.filter(b => b.id !== newBudget.id));
    doAdd();
    addCommand({ name: `Tambah Budget: ${budget.category}`, undo: doRemove, redo: doAdd });
  }, [addCommand]);

  const updateBudget = useCallback((id: string, updates: { category?: string; limit?: number }) => {
    const budget = budgets.find(b => b.id === id);
    if (!budget) return;
    const oldBudget = { ...budget };
    const doUpdate = () => setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    const doRevert = () => setBudgets(prev => prev.map(b => b.id === id ? oldBudget : b));
    doUpdate();
    addCommand({ name: `Update Budget: ${budget.category}`, undo: doRevert, redo: doUpdate });
  }, [budgets, addCommand]);

  const deleteBudget = useCallback((id: string) => {
    const budget = budgets.find(b => b.id === id);
    if (!budget) return;
    const doRemove = () => setBudgets(prev => prev.filter(b => b.id !== id));
    const doRestore = () => setBudgets(prev => [budget, ...prev]);
    doRemove();
    addCommand({ name: `Hapus Budget: ${budget.category}`, undo: doRestore, redo: doRemove });
  }, [budgets, addCommand]);
  
  const importData = useCallback((data: { transactions?: Transaction[]; debts?: Debt[]; budgets?: Budget[]; settings?: Settings; customCategories?: CategoryItem[] }) => {
    if (data.transactions) setTransactions(data.transactions);
    if (data.debts) setDebts(data.debts);
    if (data.budgets) setBudgets(data.budgets);
    if (data.settings) setSettings(data.settings);
    if (data.customCategories) setCustomCategories(data.customCategories);
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'date' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification, id: crypto.randomUUID(), date: new Date().toISOString(), isRead: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n)), []);
  const markAllAsRead = useCallback(() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))), []);
  const deleteNotification = useCallback((id: string) => setNotifications(prev => prev.filter(n => n.id !== id)), []);
  const clearAllNotifications = useCallback(() => setNotifications([]), []);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat(settings.language === 'id' ? 'id-ID' : 'en-US', {
      style: 'currency', currency: settings.currency, minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount);
  }, [settings.language, settings.currency]);

  // Memoize the context value
  const value = useMemo(() => ({
      user, settings, transactions, debts, budgets, customCategories, notifications,
      login, logout, updateUser, updateSettings,
      addTransaction, updateTransaction: updateTransactionAction, deleteTransaction,
      addDebt, payDebt, updateDebt, deleteDebt,
      addBudget, updateBudget, deleteBudget,
      addCustomCategory,
      addNotification, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications,
      formatCurrency, importData,
      undo, redo, canUndo, canRedo, history
  }), [
    user, settings, transactions, debts, budgets, customCategories, notifications,
    canUndo, canRedo, history, 
    login, logout, updateUser, updateSettings,
    addTransaction, deleteTransaction,
     addDebt, payDebt, updateDebt, deleteDebt,
     addBudget, updateBudget, deleteBudget,
     addCustomCategory,
     addNotification, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications,
     formatCurrency, importData, 
     undo, redo,
     updateTransactionAction
   ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
