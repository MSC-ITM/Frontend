import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme } from '../types';

// ============================================
// Types & Interfaces
// ============================================

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

interface ThemeProviderProps {
  children: ReactNode;
}

// ============================================
// Context Creation
// ============================================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ============================================
// Hook
// ============================================

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de ThemeProvider');
  }
  return context;
};

// ============================================
// Provider Component
// ============================================

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Inicializar tema desde localStorage o usar 'dark' por defecto
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    // Validar que el tema guardado sea válido
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    return 'dark';
  });

  // Aplicar el tema al documento
  useEffect(() => {
    const root = document.documentElement;

    // Remover ambas clases primero
    root.classList.remove('light-mode', 'dark-mode');

    // Agregar la clase correspondiente
    if (theme === 'light') {
      root.classList.add('light-mode');
    } else {
      root.classList.add('dark-mode');
    }

    // Guardar en localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = (): void => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
