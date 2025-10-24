import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Alert from '../Alert';

describe('Alert Component', () => {
  it('debe renderizar el componente con tipo error', () => {
    const onClose = vi.fn();
    render(
      <Alert
        type="error"
        title="Error de prueba"
        message="Este es un mensaje de error"
        onClose={onClose}
      />
    );

    expect(screen.getByText('Error de prueba')).toBeDefined();
    expect(screen.getByText('Este es un mensaje de error')).toBeDefined();
  });

  it('debe llamar onClose cuando se hace click en el botón', () => {
    const onClose = vi.fn();
    render(
      <Alert
        type="error"
        title="Error de prueba"
        message="Este es un mensaje de error"
        onClose={onClose}
      />
    );

    const button = screen.getByRole('button', { name: /entendido/i });
    fireEvent.click(button);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('debe renderizar con tipo success', () => {
    const onClose = vi.fn();
    render(
      <Alert
        type="success"
        title="Éxito"
        message="Operación completada exitosamente"
        onClose={onClose}
      />
    );

    expect(screen.getByText('Éxito')).toBeDefined();
    expect(screen.getByText('Operación completada exitosamente')).toBeDefined();
  });

  it('debe renderizar con tipo warning', () => {
    const onClose = vi.fn();
    render(
      <Alert
        type="warning"
        title="Advertencia"
        message="Ten cuidado con esta operación"
        onClose={onClose}
      />
    );

    expect(screen.getByText('Advertencia')).toBeDefined();
    expect(screen.getByText('Ten cuidado con esta operación')).toBeDefined();
  });

  it('debe renderizar con tipo info', () => {
    const onClose = vi.fn();
    render(
      <Alert
        type="info"
        title="Información"
        message="Aquí hay información útil"
        onClose={onClose}
      />
    );

    expect(screen.getByText('Información')).toBeDefined();
    expect(screen.getByText('Aquí hay información útil')).toBeDefined();
  });
});
