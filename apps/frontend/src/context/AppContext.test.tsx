import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
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

describe('AppContext', () => {
  it('should provide undo/redo functionality', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    );

    const { result } = renderHook(() => useApp(), { wrapper });

    expect(result.current.history).toBeDefined();
    expect(Array.isArray(result.current.history)).toBe(true);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    expect(typeof result.current.undo).toBe('function');
    expect(typeof result.current.redo).toBe('function');
  });
});
