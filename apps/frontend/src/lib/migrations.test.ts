import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { migrateDebts, migrateCategories, performV4Migration } from './migrations';
import { Settings, CategoryItem, Transaction } from '../context/AppContext';

describe('migrations', () => {
  const originalCrypto = globalThis.crypto;

  beforeEach(() => {
    // Mock crypto.randomUUID
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2, 9)
      },
      writable: true
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'crypto', {
      value: originalCrypto,
      writable: true
    });
    vi.restoreAllMocks();
  });

  describe('migrateDebts', () => {
    it('returns empty array for null input', () => {
      expect(migrateDebts(null)).toEqual([]);
    });

    it('migrates valid debts with defaults', () => {
      const input = JSON.stringify([
        { id: '1', name: 'Debt 1', amount: 1000 }
      ]);
      const result = migrateDebts(input);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: '1',
        name: 'Debt 1',
        amount: 1000,
        paidAmount: 0,
        payments: []
      });
    });

    it('preserves existing fields', () => {
      const input = JSON.stringify([
        { id: '1', name: 'Debt 1', amount: 1000, paidAmount: 500, payments: [{ amount: 500 }] }
      ]);
      const result = migrateDebts(input);
      expect(result[0].paidAmount).toBe(500);
      expect(result[0].payments).toHaveLength(1);
    });

    it('handles invalid JSON gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(migrateDebts('invalid-json')).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('migrateCategories', () => {
    it('returns saved V2 categories if present', () => {
      const v2 = JSON.stringify([{ id: '1', name: 'Cat 1', type: 'expense' }]);
      expect(migrateCategories(v2, null)).toEqual([{ id: '1', name: 'Cat 1', type: 'expense' }]);
    });

    it('migrates old categories if V2 missing', () => {
      const old = JSON.stringify(['Old Cat']);
      const result = migrateCategories(null, old);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        name: 'Old Cat',
        type: 'expense'
      });
      expect(result[0].id).toBeDefined();
    });

    it('returns defaults if nothing saved', () => {
      const result = migrateCategories(null, null);
      expect(result.length).toBeGreaterThan(0);
      expect(result.find(c => c.name === 'Gaji')).toBeDefined();
      expect(result.find(c => c.type === 'income')).toBeDefined();
    });
  });

  describe('performV4Migration', () => {
    const mockSettings: Settings = {
      currency: 'IDR',
      language: 'id',
      monthlyBudget: 1000000
    };

    it('ensures basic expenses exist in budgets', () => {
      const result = performV4Migration(
        mockSettings,
        [], // Empty budgets
        [], // Empty custom categories
        []  // Empty transactions
      );

      // Should add basic expenses like Makanan, Transportasi, etc.
      const categories = result.updatedBudgets.map(b => b.category);
      expect(categories).toContain('Makanan');
      expect(categories).toContain('Transportasi');
    });

    it('removes unused custom categories that are not basic', () => {
      const customCats: CategoryItem[] = [
        { id: '1', name: 'Unused Custom', type: 'expense' },
        { id: '2', name: 'Used Custom', type: 'expense' }
      ];
      
      const transactions: Transaction[] = [
        { 
          id: '1', 
          name: 'Tx 1', 
          desc: 'Desc 1', 
          amount: 100, 
          category: 'Used Custom', 
          date: '2023-01-01', 
          type: 'expense' 
        }
      ];

      const result = performV4Migration(
        mockSettings,
        [],
        customCats,
        transactions
      );

      // 'Unused Custom' should be removed because it's not basic and not used
      expect(result.updatedCategories.find(c => c.name === 'Unused Custom')).toBeUndefined();
      // 'Used Custom' should be kept
      expect(result.updatedCategories.find(c => c.name === 'Used Custom')).toBeDefined();
    });

    it('respects language settings for basic expenses', () => {
      const enSettings = { ...mockSettings, language: 'en' as const };
      const result = performV4Migration(
        enSettings,
        [],
        [],
        []
      );

      const categories = result.updatedBudgets.map(b => b.category);
      expect(categories).toContain('Food');
      expect(categories).not.toContain('Makanan');
    });
  });
});
