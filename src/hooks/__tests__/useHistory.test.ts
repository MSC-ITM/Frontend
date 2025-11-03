import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHistory } from '../useHistory';

describe('useHistory Hook', () => {
  interface TestState {
    count: number;
    name: string;
  }

  const initialState: TestState = { count: 0, name: 'test' };

  it('debe inicializar con el estado inicial', () => {
    const { result } = renderHook(() => useHistory(initialState));

    expect(result.current.state).toEqual(initialState);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('debe permitir actualizar el estado', () => {
    const { result } = renderHook(() => useHistory(initialState));

    act(() => {
      result.current.setState({ count: 1, name: 'updated' });
    });

    expect(result.current.state).toEqual({ count: 1, name: 'updated' });
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it('debe permitir deshacer cambios', () => {
    const { result } = renderHook(() => useHistory(initialState));

    // Hacer un cambio
    act(() => {
      result.current.setState({ count: 1, name: 'updated' });
    });

    expect(result.current.state).toEqual({ count: 1, name: 'updated' });

    // Deshacer
    act(() => {
      result.current.undo();
    });

    expect(result.current.state).toEqual(initialState);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it('debe permitir rehacer cambios', () => {
    const { result } = renderHook(() => useHistory(initialState));

    // Hacer un cambio
    act(() => {
      result.current.setState({ count: 1, name: 'updated' });
    });

    // Deshacer
    act(() => {
      result.current.undo();
    });

    // Rehacer
    act(() => {
      result.current.redo();
    });

    expect(result.current.state).toEqual({ count: 1, name: 'updated' });
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it('debe mantener historial de múltiples cambios', () => {
    const { result } = renderHook(() => useHistory(initialState));

    // Hacer varios cambios
    act(() => {
      result.current.setState({ count: 1, name: 'first' });
    });

    act(() => {
      result.current.setState({ count: 2, name: 'second' });
    });

    act(() => {
      result.current.setState({ count: 3, name: 'third' });
    });

    expect(result.current.state).toEqual({ count: 3, name: 'third' });
    expect(result.current.canUndo).toBe(true);

    // Deshacer varias veces
    act(() => {
      result.current.undo();
    });
    expect(result.current.state).toEqual({ count: 2, name: 'second' });

    act(() => {
      result.current.undo();
    });
    expect(result.current.state).toEqual({ count: 1, name: 'first' });

    act(() => {
      result.current.undo();
    });
    expect(result.current.state).toEqual(initialState);
    expect(result.current.canUndo).toBe(false);
  });

  it('debe limpiar el historial de redo al hacer un nuevo cambio', () => {
    const { result } = renderHook(() => useHistory(initialState));

    // Hacer cambio
    act(() => {
      result.current.setState({ count: 1, name: 'first' });
    });

    // Deshacer
    act(() => {
      result.current.undo();
    });

    expect(result.current.canRedo).toBe(true);

    // Hacer nuevo cambio (debe limpiar redo)
    act(() => {
      result.current.setState({ count: 2, name: 'second' });
    });

    expect(result.current.canRedo).toBe(false);
  });

  it('debe permitir resetear el historial', () => {
    const { result } = renderHook(() => useHistory(initialState));

    // Hacer varios cambios
    act(() => {
      result.current.setState({ count: 1, name: 'first' });
    });

    act(() => {
      result.current.setState({ count: 2, name: 'second' });
    });

    // Reset con nuevo estado
    const newInitialState = { count: 100, name: 'reset' };
    act(() => {
      result.current.reset(newInitialState);
    });

    expect(result.current.state).toEqual(newInitialState);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('no debe permitir deshacer cuando no hay historial', () => {
    const { result } = renderHook(() => useHistory(initialState));

    const stateBefore = result.current.state;

    act(() => {
      result.current.undo();
    });

    expect(result.current.state).toEqual(stateBefore);
    expect(result.current.canUndo).toBe(false);
  });

  it('no debe permitir rehacer cuando no hay futuro', () => {
    const { result } = renderHook(() => useHistory(initialState));

    act(() => {
      result.current.setState({ count: 1, name: 'updated' });
    });

    const stateBefore = result.current.state;

    act(() => {
      result.current.redo();
    });

    expect(result.current.state).toEqual(stateBefore);
    expect(result.current.canRedo).toBe(false);
  });

  it('debe manejar el flag overwrite para no agregar al historial', () => {
    const { result } = renderHook(() => useHistory(initialState));

    // Cambio normal (agrega al historial)
    act(() => {
      result.current.setState({ count: 1, name: 'first' }, false);
    });

    expect(result.current.canUndo).toBe(true);

    // Cambio con overwrite (reemplaza el estado actual sin agregar historial)
    act(() => {
      result.current.setState({ count: 2, name: 'second' }, true);
    });

    // Deshacer debe volver al estado inicial, no a 'first'
    act(() => {
      result.current.undo();
    });

    expect(result.current.state).toEqual(initialState);
  });

  it('debe manejar estados complejos con arrays', () => {
    interface ComplexState {
      items: string[];
      metadata: { version: number };
    }

    const complexInitial: ComplexState = {
      items: ['a', 'b'],
      metadata: { version: 1 }
    };

    const { result } = renderHook(() => useHistory(complexInitial));

    act(() => {
      result.current.setState({
        items: ['a', 'b', 'c'],
        metadata: { version: 2 }
      });
    });

    expect(result.current.state.items).toHaveLength(3);
    expect(result.current.state.metadata.version).toBe(2);

    act(() => {
      result.current.undo();
    });

    expect(result.current.state.items).toHaveLength(2);
    expect(result.current.state.metadata.version).toBe(1);
  });
});
