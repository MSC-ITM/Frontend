import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { AuthProvider } from '../../context/AuthContext';

// Mock del contexto de autenticación
vi.mock('../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

import { useAuth } from '../../context/AuthContext';

describe('ProtectedRoute', () => {
  it('muestra loading mientras se verifica autenticación', () => {
    useAuth.mockReturnValue({
      isAuthenticated: () => false,
      loading: true,
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Verificando autenticación...')).toBeInTheDocument();
  });

  it('renderiza children cuando el usuario está autenticado', () => {
    useAuth.mockReturnValue({
      isAuthenticated: () => true,
      loading: false,
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirige a login cuando el usuario no está autenticado', () => {
    useAuth.mockReturnValue({
      isAuthenticated: () => false,
      loading: false,
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    // El contenido protegido no debería renderizarse
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
