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

    try {
      // Llamar al Backend API para login
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          success: false,
          message: errorData.detail || 'Usuario o contraseña incorrectos',
        } as LoginError;
      }

      const data = await response.json();

      // Crear objeto User desde la respuesta del backend
      const userData: User = {
        id: data.user.id,
        username: username,
        name: data.user.name,
        email: `${username}@workflow.com`,
        role: 'admin',
        initials: username.substring(0, 2).toUpperCase(),
      };

      // Guardar token y usuario
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      if ((error as LoginError).success === false) {
        throw error;
      }
      throw {
        success: false,
        message: 'Error de conexión con el servidor',
      } as LoginError;
    }
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
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
