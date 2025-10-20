import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Inicializar tema desde localStorage o usar 'dark' por defecto
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'dark';
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

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
