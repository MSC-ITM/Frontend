import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmModal from '../ConfirmModal';

describe('ConfirmModal', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    title: 'Test Title',
    message: 'Test Message',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no renderiza cuando isOpen es false', () => {
    const { container } = render(
      <ConfirmModal {...defaultProps} isOpen={false} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renderiza cuando isOpen es true', () => {
    render(<ConfirmModal {...defaultProps} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('renderiza con textos de botón por defecto', () => {
    render(<ConfirmModal {...defaultProps} />);

    expect(screen.getByText('Confirmar')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('renderiza con textos de botón personalizados', () => {
    render(
      <ConfirmModal
        {...defaultProps}
        confirmText="Eliminar"
        cancelText="No eliminar"
      />
    );

    expect(screen.getByText('Eliminar')).toBeInTheDocument();
    expect(screen.getByText('No eliminar')).toBeInTheDocument();
  });

  it('llama a onClose cuando se hace click en cancelar', async () => {
    const user = userEvent.setup();
    render(<ConfirmModal {...defaultProps} />);

    const cancelButton = screen.getByText('Cancelar');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('llama a onConfirm y onClose cuando se hace click en confirmar', async () => {
    const user = userEvent.setup();
    render(<ConfirmModal {...defaultProps} />);

    const confirmButton = screen.getByText('Confirmar');
    await user.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('llama a onClose cuando se hace click en el overlay', async () => {
    const user = userEvent.setup();
    const { container } = render(<ConfirmModal {...defaultProps} />);

    const overlay = container.querySelector('.fixed.inset-0.bg-black\\/60');
    await user.click(overlay);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('cierra el modal con tecla ESC', () => {
    render(<ConfirmModal {...defaultProps} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('no cierra con ESC cuando isOpen es false', () => {
    render(<ConfirmModal {...defaultProps} isOpen={false} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('renderiza con tipo danger por defecto', () => {
    const { container } = render(<ConfirmModal {...defaultProps} />);

    const iconContainer = container.querySelector('.bg-rose-500\\/20');
    expect(iconContainer).toBeInTheDocument();
  });

  it('renderiza con tipo warning', () => {
    const { container } = render(
      <ConfirmModal {...defaultProps} type="warning" />
    );

    const iconContainer = container.querySelector('.bg-yellow-500\\/20');
    expect(iconContainer).toBeInTheDocument();
  });

  it('renderiza con tipo info', () => {
    const { container } = render(
      <ConfirmModal {...defaultProps} type="info" />
    );

    const iconContainer = container.querySelector('.bg-cyan-500\\/20');
    expect(iconContainer).toBeInTheDocument();
  });

  it('previene scroll del body cuando está abierto', () => {
    render(<ConfirmModal {...defaultProps} />);

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restaura scroll del body cuando se cierra', () => {
    const { rerender } = render(<ConfirmModal {...defaultProps} />);

    expect(document.body.style.overflow).toBe('hidden');

    rerender(<ConfirmModal {...defaultProps} isOpen={false} />);

    expect(document.body.style.overflow).toBe('unset');
  });
});
