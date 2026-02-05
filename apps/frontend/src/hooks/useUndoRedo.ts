import { useState, useCallback, useEffect } from 'react';

export interface Command {
  id: string;
  name: string;
  timestamp: number;
  undo: () => void;
  redo: () => void;
}

interface UseUndoRedoOptions {
  maxHistory?: number;
  enableShortcuts?: boolean;
}

export function useUndoRedo({ maxHistory = 20, enableShortcuts = true }: UseUndoRedoOptions = {}) {
  const [past, setPast] = useState<Command[]>([]);
  const [future, setFuture] = useState<Command[]>([]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const addCommand = useCallback((command: Omit<Command, 'id' | 'timestamp'>) => {
    const newCommand: Command = {
      ...command,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    setPast((prev) => {
      const newPast = [...prev, newCommand];
      if (newPast.length > maxHistory) {
        return newPast.slice(newPast.length - maxHistory);
      }
      return newPast;
    });
    setFuture([]); // Clear future on new action
  }, [maxHistory]);

  const undo = useCallback(() => {
    setPast((prev) => {
      if (prev.length === 0) return prev;

      const newPast = [...prev];
      const command = newPast.pop();
      
      if (command) {
        try {
            console.log(`Undoing: ${command.name}`);
            command.undo();
            setFuture((prevFuture) => [command, ...prevFuture]);
        } catch (error) {
            console.error(`Error undoing command ${command.name}:`, error);
            // Optionally handle error state here, e.g., show a toast
        }
      }

      return newPast;
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((prev) => {
      if (prev.length === 0) return prev;

      const newFuture = [...prev];
      const command = newFuture.shift();

      if (command) {
        try {
            console.log(`Redoing: ${command.name}`);
            command.redo();
            setPast((prevPast) => [...prevPast, command]);
        } catch (error) {
            console.error(`Error redoing command ${command.name}:`, error);
        }
      }

      return newFuture;
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (!enableShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          undo();
        } else if (e.key === 'y') {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, enableShortcuts]);

  return {
    addCommand,
    undo,
    redo,
    canUndo,
    canRedo,
    history: past,
    future
  };
}
