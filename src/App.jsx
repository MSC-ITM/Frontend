import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { WorkflowsList, WorkflowEditor, RunDetail, Login } from './pages';
import { ProtectedRoute } from './components';

// Header Component con botón de usuario
const AppHeader = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();

  // No mostrar header en la página de login
  if (location.pathname === '/login') {
    return null;
  }

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <header className="bg-[#1a1a1a] border-b border-cyan-500/20 sticky top-0 z-50 backdrop-blur-sm shadow-lg shadow-cyan-500/5">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo y Título */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
              Sistema de Orquestación de Workflows
            </h1>
          </div>

          {/* Theme Toggle & User Menu */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 bg-[#2a2a2a] border border-cyan-500/20 rounded-xl hover:bg-[#3a3a3a] hover:border-cyan-400/40 transition-all shadow-sm group"
              title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 hover:border-cyan-400/40 transition-all group"
              >
              {/* Avatar con iniciales */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 transition-shadow">
                <span className="text-white font-bold text-sm">{user?.initials || 'AD'}</span>
              </div>

              {/* Info del usuario */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-cyan-100">{user?.name || 'Administrador'}</p>
                <p className="text-xs text-cyan-400/60">{user?.role || 'Admin'}</p>
              </div>

              {/* Chevron */}
              <svg
                className={`w-4 h-4 text-cyan-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
              <>
                {/* Overlay para cerrar el dropdown */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                ></div>

                {/* Menu */}
                <div className="absolute right-0 mt-2 w-64 bg-[#1a1a1a] border border-cyan-500/20 rounded-xl shadow-2xl shadow-cyan-500/10 overflow-hidden z-20">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-cyan-500/10 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
                    <p className="text-sm font-medium text-cyan-100">{user?.name}</p>
                    <p className="text-xs text-cyan-400/60">{user?.email}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        logout();
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// Layout Component
const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AppHeader />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppLayout>
            <Routes>
            {/* Ruta pública */}
            <Route path="/login" element={<Login />} />

            {/* Rutas protegidas */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Navigate to="/workflows" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workflows"
              element={
                <ProtectedRoute>
                  <WorkflowsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workflows/new"
              element={
                <ProtectedRoute>
                  <WorkflowEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workflows/:id"
              element={
                <ProtectedRoute>
                  <WorkflowEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workflows/:id/edit"
              element={
                <ProtectedRoute>
                  <WorkflowEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/runs/:runId"
              element={
                <ProtectedRoute>
                  <RunDetail />
                </ProtectedRoute>
              }
            />

            {/* Redirect a login si no coincide ninguna ruta */}
            <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </AppLayout>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
