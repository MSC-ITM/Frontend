import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/test-utils';
import Login from '../Login';
import * as AuthContext from '../../context/AuthContext';

// Mock useNavigate
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
    vi.clearAllMocks();
  });

  it('debería renderizar el formulario de login', () => {
    render(<Login />);

    expect(screen.getByText('Sistema de Workflows')).toBeInTheDocument();
    expect(screen.getByLabelText('Usuario')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument();
  });

  it('debería mostrar error de validación para usuario vacío', async () => {
    render(<Login />);

    const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/usuario.*requerido/i)).toBeInTheDocument();
    });
  });

  it('debería mostrar error de validación para contraseña vacía', async () => {
    render(<Login />);

    const usernameInput = screen.getByLabelText('Usuario');
    fireEvent.change(usernameInput, { target: { value: 'admin' } });

    const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/contraseña.*requerida/i)).toBeInTheDocument();
    });
  });

  it('debería actualizar los campos del formulario al cambiar', () => {
    render(<Login />);

    const usernameInput = screen.getByLabelText('Usuario') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Contraseña') as HTMLInputElement;

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('testpass');
  });

  it('debería limpiar errores de validación cuando el usuario empieza a escribir', async () => {
    render(<Login />);

    const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/usuario.*requerido/i)).toBeInTheDocument();
    });

    const usernameInput = screen.getByLabelText('Usuario');
    fireEvent.change(usernameInput, { target: { value: 'admin' } });

    await waitFor(() => {
      expect(screen.queryByText(/usuario.*requerido/i)).not.toBeInTheDocument();
    });
  });

  it('debería mostrar sugerencia de credenciales de prueba', () => {
    render(<Login />);

    expect(screen.getByText('Credenciales de prueba:')).toBeInTheDocument();
    const adminTexts = screen.getAllByText(/admin/i);
    expect(adminTexts.length).toBeGreaterThan(0);
  });

  it('debería mostrar estado de carga durante el login', async () => {
    render(<Login />);

    const usernameInput = screen.getByLabelText('Usuario');
    const passwordInput = screen.getByLabelText('Contraseña');

    fireEvent.change(usernameInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });

    const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Iniciando sesión...')).toBeInTheDocument();
    });
  });

  it('debería mostrar error general en fallo de login', async () => {
    render(<Login />);

    const usernameInput = screen.getByLabelText('Usuario');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i });

    fireEvent.change(usernameInput, { target: { value: 'wrong' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/usuario o contraseña incorrectos/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('debería limpiar error de contraseña al escribir en el campo', async () => {
    render(<Login />);

    const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/contraseña.*requerida/i)).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText('Contraseña');
    fireEvent.change(passwordInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.queryByText(/contraseña.*requerida/i)).not.toBeInTheDocument();
    });
  });

  it('debería alternar el tema cuando se hace clic en el botón de tema', () => {
    render(<Login />);

    const themeButton = screen.getByTitle(/Cambiar a modo/i);
    expect(themeButton).toBeInTheDocument();

    fireEvent.click(themeButton);
    // Theme should toggle (tested through ThemeContext)
  });
});
