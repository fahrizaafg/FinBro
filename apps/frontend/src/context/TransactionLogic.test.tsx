import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useApp, AppProvider } from './AppContext';
import React from 'react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
        delete store[key];
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock crypto.randomUUID
Object.defineProperty(crypto, 'randomUUID', {
  value: () => 'test-uuid-' + Math.random()
});

describe('Transaction Logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should update transaction amount correctly (decrease)', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    );

    const { result } = renderHook(() => useApp(), { wrapper });

    // 1. Add Transaction
    const txData = {
      name: 'Test Tx',
      desc: 'Test Desc',
      category: 'Food',
      amount: 100000,
      date: new Date().toISOString(),
      type: 'expense' as const
    };

    act(() => {
      result.current.addTransaction(txData);
    });

    const addedTx = result.current.transactions[0];
    expect(addedTx.amount).toBe(100000);

    // 2. Update Transaction (Decrease to 80000)
    act(() => {
      result.current.updateTransaction(addedTx.id, { amount: 80000 });
    });

    const updatedTx = result.current.transactions.find(t => t.id === addedTx.id);
    expect(updatedTx?.amount).toBe(80000);

    // Verify logic: Balance calculation
    const calculateBalance = (txs: typeof result.current.transactions) => {
        return txs.reduce((acc, tx) => tx.type === 'income' ? acc + tx.amount : acc - tx.amount, 0);
    };

    const balance = calculateBalance(result.current.transactions);
    // Expense 80000 -> Balance -80000
    expect(balance).toBe(-80000);
  });

  it('should update transaction amount correctly (increase)', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    );

    const { result } = renderHook(() => useApp(), { wrapper });

    // 1. Add Transaction
    act(() => {
      result.current.addTransaction({
        name: 'Test Tx',
        desc: 'Test Desc',
        category: 'Food',
        amount: 50000,
        date: new Date().toISOString(),
        type: 'income' as const
      });
    });

    const addedTx = result.current.transactions[0];

    // 2. Update Transaction (Increase to 100000)
    act(() => {
      result.current.updateTransaction(addedTx.id, { amount: 100000 });
    });

    const updatedTx = result.current.transactions.find(t => t.id === addedTx.id);
    expect(updatedTx?.amount).toBe(100000);
    
    const calculateBalance = (txs: typeof result.current.transactions) => {
        return txs.reduce((acc, tx) => tx.type === 'income' ? acc + tx.amount : acc - tx.amount, 0);
    };

    expect(calculateBalance(result.current.transactions)).toBe(100000);
  });

  it('should not update transaction if amount is negative', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    );

    const { result } = renderHook(() => useApp(), { wrapper });

    // 1. Add Transaction
    act(() => {
      result.current.addTransaction({
        name: 'Test Tx',
        desc: 'Test Desc',
        category: 'Food',
        amount: 50000,
        date: new Date().toISOString(),
        type: 'income' as const
      });
    });

    const addedTx = result.current.transactions[0];

    // 2. Try Update Transaction with negative amount
    act(() => {
      result.current.updateTransaction(addedTx.id, { amount: -10000 });
    });

    const updatedTx = result.current.transactions.find(t => t.id === addedTx.id);
    // Should remain 50000
    expect(updatedTx?.amount).toBe(50000);
  });

  it('should not add transaction if amount is negative', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    );

    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => {
      result.current.addTransaction({
        name: 'Negative Tx',
        desc: 'Test',
        category: 'Food',
        amount: -500,
        date: new Date().toISOString(),
        type: 'expense' as const
      });
    });

    expect(result.current.transactions).toHaveLength(0);
  });

  it('should not add debt if amount is negative', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    );

    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => {
      result.current.addDebt({
        personName: 'John',
        description: 'Test Debt',
        amount: -1000,
        type: 'debt' as const
      });
    });

    expect(result.current.debts).toHaveLength(0);
  });
});
