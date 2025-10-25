import { useState, useCallback } from 'react';

export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export interface UseHistoryReturn<T> {
  state: T;
  setState: (newState: T, overwrite?: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: (newState: T) => void;
}

/**
 * Hook personalizado para manejar undo/redo de estado
 * @param initialState Estado inicial
 * @returns Objeto con estado, funciones de control y banderas de disponibilidad
 */
export function useHistory<T>(initialState: T): UseHistoryReturn<T> {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  /**
   * Actualiza el estado y registra en el historial
   * @param newState Nuevo estado
   * @param overwrite Si es true, reemplaza el estado actual sin agregar al historial
   */
  const setState = useCallback(
    (newState: T, overwrite = false) => {
      if (overwrite) {
        // Reemplazar el estado actual sin modificar el historial
        setHistory((prev) => ({
          ...prev,
          present: newState,
        }));
      } else {
        // Agregar al historial
        setHistory((prev) => {
          // Evitar agregar el mismo estado consecutivamente
          if (JSON.stringify(prev.present) === JSON.stringify(newState)) {
            return prev;
          }

          return {
            past: [...prev.past, prev.present],
            present: newState,
            future: [], // Limpiar el futuro al hacer un cambio nuevo
          };
        });
      }
    },
    []
  );

  /**
   * Deshace la última acción
   */
  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;

      const newPast = [...prev.past];
      const newPresent = newPast.pop()!;

      return {
        past: newPast,
        present: newPresent,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  /**
   * Rehace la última acción deshecha
   */
  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;

      const newFuture = [...prev.future];
      const newPresent = newFuture.shift()!;

      return {
        past: [...prev.past, prev.present],
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  /**
   * Reinicia el historial con un nuevo estado
   */
  const reset = useCallback((newState: T) => {
    setHistory({
      past: [],
      present: newState,
      future: [],
    });
  }, []);

  return {
    state: history.present,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  };
}
