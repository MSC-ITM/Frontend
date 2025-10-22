import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ReactElement, ReactNode } from 'react';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withRouter?: boolean;
  withAuth?: boolean;
  withTheme?: boolean;
}

/**
 * Custom render function that includes common providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    withRouter = true,
    withAuth = true,
    withTheme = true,
    ...renderOptions
  } = options;

  let Wrapper = ({ children }: { children: ReactNode }) => <>{children}</>;

  if (withAuth && withRouter && withTheme) {
    Wrapper = ({ children }: { children: ReactNode }) => (
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );
  } else if (withAuth && withRouter) {
    Wrapper = ({ children }: { children: ReactNode }) => (
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    );
  } else if (withRouter && withTheme) {
    Wrapper = ({ children }: { children: ReactNode }) => (
      <BrowserRouter>
        <ThemeProvider>{children}</ThemeProvider>
      </BrowserRouter>
    );
  } else if (withAuth && withTheme) {
    Wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    );
  } else if (withRouter) {
    Wrapper = ({ children }: { children: ReactNode }) => (
      <BrowserRouter>{children}</BrowserRouter>
    );
  } else if (withAuth) {
    Wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
  } else if (withTheme) {
    Wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export * from '@testing-library/react';
export { renderWithProviders as render };
