import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';

// Mock de localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

global.localStorage = localStorageMock;

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('light-mode', 'dark-mode');
  });

  it('proporciona el tema dark por defecto', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current.theme).toBe('dark');
  });

  it('carga tema desde localStorage si existe', () => {
    localStorage.setItem('theme', 'light');

    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current.theme).toBe('light');
  });

  it('toggleTheme cambia de dark a light', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current.theme).toBe('dark');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
  });

  it('toggleTheme cambia de light a dark', () => {
    localStorage.setItem('theme', 'light');

    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current.theme).toBe('light');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
  });

  it('persiste el tema en localStorage', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    act(() => {
      result.current.toggleTheme();
    });

    expect(localStorage.getItem('theme')).toBe('light');

    act(() => {
      result.current.toggleTheme();
    });

    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('aplica clase dark-mode al documento en modo dark', () => {
    renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
    expect(document.documentElement.classList.contains('light-mode')).toBe(false);
  });

  it('aplica clase light-mode al documento en modo light', () => {
    localStorage.setItem('theme', 'light');

    renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(document.documentElement.classList.contains('light-mode')).toBe(true);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(false);
  });

  it('cambia las clases del documento al hacer toggle', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    // Inicialmente dark
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);

    act(() => {
      result.current.toggleTheme();
    });

    // Después del toggle, light
    expect(document.documentElement.classList.contains('light-mode')).toBe(true);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(false);

    act(() => {
      result.current.toggleTheme();
    });

    // Después de otro toggle, dark de nuevo
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
    expect(document.documentElement.classList.contains('light-mode')).toBe(false);
  });

  it('lanza error si useTheme se usa fuera de ThemeProvider', () => {
    const originalError = console.error;
    console.error = vi.fn();

    try {
      renderHook(() => useTheme());
      expect(true).toBe(false); // No debería llegar aquí
    } catch (error) {
      expect(error.message).toContain('useTheme debe ser usado dentro de ThemeProvider');
    } finally {
      console.error = originalError;
    }
  });

  it('proporciona función toggleTheme', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(typeof result.current.toggleTheme).toBe('function');
  });
});
