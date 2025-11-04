import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import ProtectedRoute from '../ProtectedRoute';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debería redirigir a login cuando no está autenticado', () => {
    window.history.pushState({}, 'Test page', '/protected');

    render(
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('debería mostrar estado de carga mientras verifica la autenticación', async () => {
    window.history.pushState({}, 'Test page', '/protected');

    render(
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    );
  });

  it('debería renderizar contenido protegido cuando está autenticado', async () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin',
    };
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'test-token');

    window.history.pushState({}, 'Test page', '/protected');

    render(
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });
});
