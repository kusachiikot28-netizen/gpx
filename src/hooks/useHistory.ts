import { useState, useCallback } from 'react';

interface HistoryState<T> {
  history: T[];
  pointer: number;
}

export function useHistory<T>(initialState: T) {
  const [state, setState] = useState<HistoryState<T>>({
    history: [initialState],
    pointer: 0
  });

  const set = useCallback((nextState: T | ((prev: T) => T)) => {
    setState(prev => {
      const current = prev.history[prev.pointer];
      const next = typeof nextState === 'function' ? (nextState as any)(current) : nextState;
      
      const newHistory = prev.history.slice(0, prev.pointer + 1);
      newHistory.push(next);
      
      if (newHistory.length > 50) {
        newHistory.shift();
        return {
          history: newHistory,
          pointer: newHistory.length - 1
        };
      }
      
      return {
        history: newHistory,
        pointer: newHistory.length - 1
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState(prev => {
      if (prev.pointer > 0) {
        return { ...prev, pointer: prev.pointer - 1 };
      }
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.pointer < prev.history.length - 1) {
        return { ...prev, pointer: prev.pointer + 1 };
      }
      return prev;
    });
  }, []);

  return {
    state: state.history[state.pointer],
    set,
    undo,
    redo,
    canUndo: state.pointer > 0,
    canRedo: state.pointer < state.history.length - 1
  };
}
