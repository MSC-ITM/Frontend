import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor, cleanup } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

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

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('proporciona valores iniciales correctos', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.isAuthenticated).toBe('function');
  });

  it('isAuthenticated devuelve false cuando no hay usuario', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.isAuthenticated()).toBe(false);
  });

  it('login exitoso con credenciales correctas', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.login('admin', 'admin123');
    });

    await waitFor(() => {
      expect(result.current.user).not.toBe(null);
      expect(result.current.user.username).toBe('admin');
      expect(result.current.user.role).toBe('admin');
      expect(result.current.isAuthenticated()).toBe(true);
    });
  });

  it('login falla con credenciales incorrectas', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    let error;
    try {
      await act(async () => {
        await result.current.login('wrong', 'credentials');
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated()).toBe(false);
  });

  it('logout limpia el usuario y localStorage', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.login('admin', 'admin123');
    });

    await waitFor(() => {
      expect(result.current.user).not.toBe(null);
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('user')).toBe(null);
  });

  it('persiste usuario en localStorage después de login', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.login('admin', 'admin123');
    });

    await waitFor(() => {
      const storedUser = localStorage.getItem('user');
      expect(storedUser).not.toBe(null);
      const parsedUser = JSON.parse(storedUser);
      expect(parsedUser.username).toBe('admin');
    });
  });

  it('carga usuario desde localStorage al iniciar', async () => {
    const mockUser = {
      id: '1',
      username: 'admin',
      name: 'Administrador',
      email: 'admin@workflow.com',
      role: 'admin',
      initials: 'AD',
    };

    localStorage.setItem('user', JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.user).not.toBe(null);
      expect(result.current.user.username).toBe('admin');
    });
  });

  it('lanza error si useAuth se usa fuera de AuthProvider', () => {
    const originalError = console.error;
    console.error = vi.fn();

    try {
      renderHook(() => useAuth());
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toContain('useAuth debe ser usado dentro de un AuthProvider');
    } finally {
      console.error = originalError;
    }
  });

  it('elimina usuario corrupto de localStorage y no setea usuario', async () => {
    localStorage.setItem('user', 'no-es-json');
    const spyRemove = vi.spyOn(localStorage, 'removeItem');
    const spyError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.user).toBe(null);
      expect(spyRemove).toHaveBeenCalledWith('user');
      expect(spyError).toHaveBeenCalled();
    });

    spyError.mockRestore();
  });
});
