import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import ConfirmModal from '../ConfirmModal';

describe('ConfirmModal', () => {
  it('no debería renderizar cuando isOpen es false', () => {
    render(
      <ConfirmModal
        isOpen={false}
        title="Test Title"
        message="Test Message"
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('debería renderizar cuando isOpen es true', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('debería llamar onConfirm y onClose cuando se hace clic en confirmar', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <ConfirmModal
        isOpen={true}
        title="Confirm"
        message="Are you sure?"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    );

    const confirmButton = screen.getByText('Confirmar');
    fireEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('debería llamar onClose cuando se hace clic en cancelar', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <ConfirmModal
        isOpen={true}
        title="Confirm"
        message="Are you sure?"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    );

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('debería llamar onClose cuando se hace clic en el overlay', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <ConfirmModal
        isOpen={true}
        title="Confirm"
        message="Are you sure?"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    );

    const overlay = document.querySelector('.fixed.inset-0.bg-black\\/60');
    if (overlay) {
      fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('debería llamar onClose cuando se presiona la tecla Escape', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <ConfirmModal
        isOpen={true}
        title="Confirm"
        message="Are you sure?"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('debería renderizar con tipo danger', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="Delete"
        message="This is dangerous"
        type="danger"
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const confirmButton = screen.getByText('Confirmar');
    expect(confirmButton).toHaveClass('bg-gradient-to-r', 'from-rose-500');
  });

  it('debería renderizar con tipo warning', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="Warning"
        message="Be careful"
        type="warning"
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const confirmButton = screen.getByText('Confirmar');
    expect(confirmButton).toHaveClass('bg-gradient-to-r', 'from-yellow-500');
  });

  it('debería renderizar con tipo info', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="Info"
        message="Information"
        type="info"
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const confirmButton = screen.getByText('Confirmar');
    expect(confirmButton).toHaveClass('bg-gradient-to-r', 'from-cyan-500');
  });

  it('debería usar texto de confirmación personalizado', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="Custom"
        message="Message"
        confirmText="Delete Now"
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Delete Now')).toBeInTheDocument();
  });

  it('debería usar texto de cancelación personalizado', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="Custom"
        message="Message"
        cancelText="Go Back"
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Go Back')).toBeInTheDocument();
  });
});
