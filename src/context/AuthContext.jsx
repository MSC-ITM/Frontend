import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    // Mock de autenticación - en producción esto llamaría al backend
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Usuario mock - admin/admin123
        if (username === 'admin' && password === 'admin123') {
          const userData = {
            id: '1',
            username: 'admin',
            name: 'Administrador',
            email: 'admin@workflow.com',
            role: 'admin',
            initials: 'AD',
          };

          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          resolve({ success: true, user: userData });
        } else {
          reject({ success: false, message: 'Usuario o contraseña incorrectos' });
        }
      }, 800); // Simular delay de red
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
