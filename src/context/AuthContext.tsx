import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, loginCredentialsSchema, validateSafe } from '../types';

// ============================================
// Types & Interfaces
// ============================================

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: true; user: User }>;
  logout: () => void;
  isAuthenticated: () => boolean;
  loading: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface LoginError {
  success: false;
  message: string;
}

// ============================================
// Context Creation
// ============================================

const AuthContext = createContext<AuthContextType | null>(null);

// ============================================
// Hook
// ============================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// ============================================
// Provider Component
// ============================================

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<{ success: true; user: User }> => {
    // Validar credenciales con Zod
    const validationResult = validateSafe(loginCredentialsSchema, {
      username,
      password,
    });

    if (!validationResult.success) {
      const firstError = validationResult.errors.issues[0];
      throw {
        success: false,
        message: firstError?.message || 'Credenciales inválidas',
      } as LoginError;
    }

    // Mock de autenticación - en producción esto llamaría al backend
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Usuario mock - admin/admin123
        if (username === 'admin' && password === 'admin123') {
          const userData: User = {
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
          reject({
            success: false,
            message: 'Usuario o contraseña incorrectos',
          } as LoginError);
        }
      }, 800); // Simular delay de red
    });
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAuthenticated = (): boolean => {
    return user !== null;
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
