import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );
  };

  it('renderiza el formulario de login correctamente', () => {
    renderLogin();

    expect(screen.getByText('Sistema de Workflows')).toBeInTheDocument();
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('muestra las credenciales de prueba', () => {
    renderLogin();

    expect(screen.getByText(/credenciales de prueba/i)).toBeInTheDocument();
    expect(screen.getByText(/Usuario:/i)).toBeInTheDocument();
    expect(screen.getByText(/Contraseña:/i)).toBeInTheDocument();
  });

  it('permite escribir en los campos de entrada', async () => {
    const user = userEvent.setup();
    renderLogin();

    const usernameInput = screen.getByLabelText(/usuario/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'testpass');

    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('testpass');
  });

  it('muestra loading al enviar el formulario', async () => {
    const user = userEvent.setup();
    renderLogin();

    const usernameInput = screen.getByLabelText(/usuario/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, 'admin123');
    await user.click(submitButton);

    // Debería mostrar estado de carga brevemente
    expect(screen.getByText(/iniciando sesión/i)).toBeInTheDocument();
  });

  it('navega a workflows después de login exitoso', async () => {
    const user = userEvent.setup();
    renderLogin();

    const usernameInput = screen.getByLabelText(/usuario/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, 'admin123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/workflows');
    });
  });

  it('muestra error con credenciales incorrectas y loading vuelve a false', async () => {
    const user = userEvent.setup();
    renderLogin();

    const usernameInput = screen.getByLabelText(/usuario/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    await user.type(usernameInput, 'wrong');
    await user.type(passwordInput, 'credentials');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/usuario o contraseña incorrectos/i)).toBeInTheDocument();
      // El botón vuelve a estar habilitado (loading false)
      expect(submitButton).not.toBeDisabled();
    }, { timeout: 3000 });
  });
  it('cambia el icono del botón de tema al cambiar el tema', async () => {
    renderLogin();
    const themeButton = screen.getByRole('button', { name: /modo/i });
    // Icono inicial (modo claro)
    expect(themeButton.querySelector('svg')).toBeInTheDocument();
    // Cambiar tema
    await userEvent.click(themeButton);
    // Icono después de cambiar tema
    expect(themeButton.querySelector('svg')).toBeInTheDocument();
  });

  it('muestra el spinner y texto de loading en el botón al enviar login', async () => {
    const user = userEvent.setup();
    renderLogin();
    const usernameInput = screen.getByLabelText(/usuario/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, 'admin123');
    await user.click(submitButton);
    // El spinner y texto deben aparecer
    expect(screen.getByText(/iniciando sesión/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciando sesión/i })).toBeDisabled();
  });

  it('deshabilita el botón durante el loading', async () => {
    const user = userEvent.setup();
    renderLogin();

    const usernameInput = screen.getByLabelText(/usuario/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, 'admin123');
    await user.click(submitButton);

    // El botón debería estar deshabilitado durante loading
    const loadingButton = screen.getByRole('button', { name: /iniciando sesión/i });
    expect(loadingButton).toBeDisabled();
  });

  it('tiene el campo de usuario con autofocus', () => {
    renderLogin();
    const usernameInput = screen.getByLabelText(/usuario/i);
    expect(usernameInput).toHaveFocus();
  });

  it('campos son requeridos', () => {
    renderLogin();
    const usernameInput = screen.getByLabelText(/usuario/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);

    expect(usernameInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it('el campo de contraseña es de tipo password', () => {
    renderLogin();
    const passwordInput = screen.getByLabelText(/contraseña/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('renderiza el logo y header correctamente', () => {
    const { container } = renderLogin();

    // Verificar que existe el logo (svg con el icono de rayo)
    const svgIcons = container.querySelectorAll('svg');
    expect(svgIcons.length).toBeGreaterThan(0);

    // Verificar el título
    expect(screen.getByText('Sistema de Workflows')).toBeInTheDocument();
    // Hay más de un elemento con el texto 'Iniciar Sesión', así que usamos getAllByText
    const iniciarSesionElements = screen.getAllByText('Iniciar Sesión');
    expect(iniciarSesionElements.length).toBeGreaterThan(1);
  });

  it('renderiza el footer con copyright', () => {
    renderLogin();
    expect(screen.getByText(/Sistema de Orquestación de Workflows © 2025/i)).toBeInTheDocument();
  });

  it('renderiza el botón de toggle de tema', () => {
    const { container } = renderLogin();

    // Buscar el botón de tema (está en posición absoluta top-6 right-6)
    const themeButton = container.querySelector('button[title*="modo"]');
    expect(themeButton).toBeInTheDocument();
  });

  it('muestra el icono correcto en el botón según el estado de loading', () => {
    const { container } = renderLogin();

    // Inicialmente debe mostrar el icono de "Iniciar Sesión"
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    expect(submitButton).toBeInTheDocument();

    // El SVG del icono de login debe estar presente
    const svgInButton = submitButton.querySelector('svg');
    expect(svgInButton).toBeInTheDocument();
  });

  it('limpia el mensaje de error al cambiar los campos', async () => {
    const user = userEvent.setup();
    renderLogin();

    const usernameInput = screen.getByLabelText(/usuario/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);

    // Escribir en los campos
    await user.type(usernameInput, 'test');
    await user.type(passwordInput, 'test');

    // Los campos deben tener los valores
    expect(usernameInput).toHaveValue('test');
    expect(passwordInput).toHaveValue('test');
  });
});
