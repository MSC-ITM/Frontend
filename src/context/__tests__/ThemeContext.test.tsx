import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';

const TestComponent = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <div>Theme: {theme}</div>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('debería tener tema oscuro por defecto', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByText('Theme: dark')).toBeInTheDocument();
  });

  it('debería alternar el tema', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByText('Theme: dark')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Toggle'));

    expect(screen.getByText('Theme: light')).toBeInTheDocument();
  });

  it('debería guardar el tema en localStorage', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText('Toggle'));

    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('debería restaurar el tema desde localStorage', () => {
    localStorage.setItem('theme', 'light');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByText('Theme: light')).toBeInTheDocument();
  });
});
