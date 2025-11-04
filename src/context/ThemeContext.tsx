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
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    return 'dark';
  });


  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove('light-mode', 'dark-mode');

    if (theme === 'light') {
      root.classList.add('light-mode');
    } else {
      root.classList.add('dark-mode');
    }

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
