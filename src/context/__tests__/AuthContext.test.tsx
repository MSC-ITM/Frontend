import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { act } from 'react';

// Componente de prueba que usa el contexto
const TestComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      {isAuthenticated() ? (
        <>
          <div>User: {user?.name}</div>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <div>Not authenticated</div>
          <button onClick={() => login('admin', 'admin123')}>Login</button>
          <button onClick={() => login('wrong', 'wrong')}>Login Wrong</button>
        </>
      )}
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('no debería estar autenticado por defecto', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Not authenticated')).toBeInTheDocument();
  });

  it('debería restaurar usuario desde localStorage', () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin',
    };

    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'test-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('User: Test User')).toBeInTheDocument();
  });

  it('debería hacer login exitosamente con credenciales correctas', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Not authenticated')).toBeInTheDocument();

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/User:/)).toBeInTheDocument();
    }, { timeout: 2000 });

    // User should be authenticated now
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('debería fallar login con credenciales incorrectas', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginWrongButton = screen.getByText('Login Wrong');

    await act(async () => {
      try {
        fireEvent.click(loginWrongButton);
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        // Expected to throw
      }
    });

    // Should still be not authenticated
    await waitFor(() => {
      expect(screen.getByText('Not authenticated')).toBeInTheDocument();
    });
  });

  it('debería hacer logout exitosamente', async () => {
    // First set up an authenticated state
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin',
    };

    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'test-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('User: Test User')).toBeInTheDocument();

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByText('Not authenticated')).toBeInTheDocument();
    });

    // User should see login buttons again
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('debería manejar datos de usuario inválidos en localStorage', () => {
    localStorage.setItem('user', 'invalid-json');
    localStorage.setItem('token', 'test-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Should not be authenticated with invalid data
    expect(screen.getByText('Not authenticated')).toBeInTheDocument();
  });
});
