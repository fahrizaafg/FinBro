import { Transaction, Debt, Budget, Settings, CategoryItem } from '../context/AppContext';

export const migrateDebts = (savedDebts: string | null): Debt[] => {
  if (!savedDebts) return [];
  try {
    const parsed = JSON.parse(savedDebts);
    // Migration: ensure new fields exist
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return parsed.map((d: any) => ({
      ...d,
      paidAmount: d.paidAmount || 0,
      payments: d.payments || []
    }));
  } catch (e) {
    console.error('Failed to parse debts', e);
    return [];
  }
};

export const migrateCategories = (savedV2: string | null, savedOld: string | null): CategoryItem[] => {
  if (savedV2) {
    try {
      return JSON.parse(savedV2);
    } catch (e) {
      console.error('Failed to parse categories v2', e);
      return [];
    }
  }
  
  // Migration from old string array
  if (savedOld) {
    try {
      const oldCategories: string[] = JSON.parse(savedOld);
      return oldCategories.map(name => ({
        id: crypto.randomUUID(),
        name,
        type: 'expense' // Default to expense for migrated categories
      }));
    } catch (e) {
      console.error('Failed to migrate categories', e);
      return [];
    }
  }
  
  // Initialize default income categories
  return [
    'Gaji', 'Bonus', 'Investasi', 'Hasil Usaha', 'Hadiah', 'Pendapatan Lainnya'
  ].map(name => ({
    id: crypto.randomUUID(),
    name,
    type: 'income' as const,
    isDefault: true
  }));
};

export const performV4Migration = (
  currentSettings: Settings,
  currentBudgets: Budget[],
  currentCustomCategories: CategoryItem[],
  transactions: Transaction[]
): { updatedBudgets: Budget[], updatedCategories: CategoryItem[] } => {
  const lang = currentSettings.language;
  
  const basicExpenses = lang === 'id' 
    ? ['Makanan', 'Transportasi', 'Belanja', 'Hiburan', 'Tagihan']
    : ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills'];

  const basicIncomes = [
    'Gaji', 'Bonus', 'Investasi', 'Hasil Usaha', 'Hadiah', 'Pendapatan Lainnya'
  ];
  
  const basicSet = new Set([...basicExpenses, ...basicIncomes].map(c => c.toLowerCase()));
  const usedCategories = new Set(transactions.map(t => t.category.toLowerCase()));

  // 1. Clean Budgets
  const cleanedBudgets = currentBudgets.filter(b => {
    const lowerCat = b.category.toLowerCase();
    if (basicSet.has(lowerCat)) return true;
    if (b.limit > 0) return true;
    if (usedCategories.has(lowerCat)) return true;
    return false;
  });

  // Ensure basic expenses exist in budgets
  const existingCategories = cleanedBudgets.map(b => b.category.toLowerCase());
  const missingBasic = basicExpenses
    .filter(cat => !existingCategories.includes(cat.toLowerCase()))
    .map(cat => ({
      id: crypto.randomUUID(),
      category: cat,
      limit: 0
    }));
    
  const updatedBudgets = [...cleanedBudgets, ...missingBasic];

  // 2. Clean Custom Categories
  const updatedCategories = currentCustomCategories.filter(c => {
    const lowerCat = c.name.toLowerCase();
    if (basicSet.has(lowerCat)) return true;
    if (usedCategories.has(lowerCat)) return true;
    return false;
  });

  return { updatedBudgets, updatedCategories };
};
