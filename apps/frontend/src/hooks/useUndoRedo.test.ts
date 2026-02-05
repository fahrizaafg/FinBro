import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useUndoRedo } from '../hooks/useUndoRedo';

describe('useUndoRedo', () => {
  it('should initialize with empty history', () => {
    const { result } = renderHook(() => useUndoRedo());
    expect(result.current.history).toHaveLength(0);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('should add command to history', () => {
    const { result } = renderHook(() => useUndoRedo());
    const command = {
      name: 'Test Command',
      undo: vi.fn(),
      redo: vi.fn(),
    };

    act(() => {
      result.current.addCommand(command);
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.history[0].name).toBe('Test Command');
  });

  it('should undo command', () => {
    const { result } = renderHook(() => useUndoRedo());
    const undoMock = vi.fn();
    const command = {
      name: 'Test Command',
      undo: undoMock,
      redo: vi.fn(),
    };

    act(() => {
      result.current.addCommand(command);
    });

    act(() => {
      result.current.undo();
    });

    expect(undoMock).toHaveBeenCalled();
    expect(result.current.history).toHaveLength(0);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it('should redo command', () => {
    const { result } = renderHook(() => useUndoRedo());
    const redoMock = vi.fn();
    const command = {
      name: 'Test Command',
      undo: vi.fn(),
      redo: redoMock,
    };

    act(() => {
      result.current.addCommand(command);
      result.current.undo();
    });

    act(() => {
      result.current.redo();
    });

    expect(redoMock).toHaveBeenCalled();
    expect(result.current.history).toHaveLength(1);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it('should limit history size', () => {
    const { result } = renderHook(() => useUndoRedo({ maxHistory: 2 }));
    
    act(() => {
      result.current.addCommand({ name: '1', undo: vi.fn(), redo: vi.fn() });
      result.current.addCommand({ name: '2', undo: vi.fn(), redo: vi.fn() });
      result.current.addCommand({ name: '3', undo: vi.fn(), redo: vi.fn() });
    });

    expect(result.current.history).toHaveLength(2);
    expect(result.current.history[0].name).toBe('2');
    expect(result.current.history[1].name).toBe('3');
  });

  it('should clear future on new command', () => {
    const { result } = renderHook(() => useUndoRedo());
    
    act(() => {
      result.current.addCommand({ name: '1', undo: vi.fn(), redo: vi.fn() });
      result.current.undo();
    });

    expect(result.current.canRedo).toBe(true);

    act(() => {
      result.current.addCommand({ name: '2', undo: vi.fn(), redo: vi.fn() });
    });

    expect(result.current.canRedo).toBe(false);
    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].name).toBe('2');
  });
});
