import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

/**
 * Custom render function that includes common providers
 */
export function renderWithProviders(ui, options = {}) {
  const {
    withRouter = true,
    withAuth = true,
    ...renderOptions
  } = options;

  let Wrapper = ({ children }) => children;

  if (withAuth && withRouter) {
    Wrapper = ({ children }) => (
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    );
  } else if (withRouter) {
    Wrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;
  } else if (withAuth) {
    Wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export * from '@testing-library/react';
export { renderWithProviders as render };
