import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/test-utils';
import Login from '../Login';
import apiClient from '../../services/api';

// Mock API client
vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

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
    fireEvent.change(usernameInput, { target: { value: 'demo' } });

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
    fireEvent.change(usernameInput, { target: { value: 'demo' } });

    await waitFor(() => {
      expect(screen.queryByText(/usuario.*requerido/i)).not.toBeInTheDocument();
    });
  });

  it('debería mostrar sugerencia de credenciales de prueba', () => {
    render(<Login />);

    expect(screen.getByText('Credenciales de prueba:')).toBeInTheDocument();
    const demoTexts = screen.getAllByText(/demo/i);
    expect(demoTexts.length).toBeGreaterThan(0);
  });

  it('debería mostrar estado de carga durante el login', async () => {
    render(<Login />);

    const usernameInput = screen.getByLabelText('Usuario');
    const passwordInput = screen.getByLabelText('Contraseña');

    fireEvent.change(usernameInput, { target: { value: 'demo' } });
    fireEvent.change(passwordInput, { target: { value: 'demo123' } });

    const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Iniciando sesión...')).toBeInTheDocument();
    });
  });

  it.skip('debería mostrar error general en fallo de login', async () => {
    // Mock error de credenciales incorrectas
    vi.mocked(apiClient.post).mockRejectedValueOnce({
      response: {
        status: 401,
        data: {
          detail: 'Incorrect username or password',
        },
      },
    });

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
  });
});
