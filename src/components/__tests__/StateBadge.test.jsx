import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StateBadge from '../StateBadge';

describe('StateBadge', () => {
  it('renderiza correctamente con estado Pending', () => {
    render(<StateBadge state="Pending" />);
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('renderiza correctamente con estado Running', () => {
    render(<StateBadge state="Running" />);
    expect(screen.getByText('Ejecutando')).toBeInTheDocument();
  });

  it('renderiza correctamente con estado Succeeded', () => {
    render(<StateBadge state="Succeeded" />);
    expect(screen.getByText('Exitoso')).toBeInTheDocument();
  });

  it('renderiza correctamente con estado Failed', () => {
    render(<StateBadge state="Failed" />);
    expect(screen.getByText('Fallido')).toBeInTheDocument();
  });

  it('renderiza correctamente con estado Canceled', () => {
    render(<StateBadge state="Canceled" />);
    expect(screen.getByText('Cancelado')).toBeInTheDocument();
  });

  it('renderiza correctamente con estado Retry', () => {
    render(<StateBadge state="Retry" />);
    expect(screen.getByText('Reintentando')).toBeInTheDocument();
  });

  it('aplica estilos correctos para estado Running', () => {
    const { container } = render(<StateBadge state="Running" />);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('bg-cyan-500/20');
    expect(badge).toHaveClass('text-cyan-300');
  });

  it('aplica estilos correctos para estado Failed', () => {
    const { container } = render(<StateBadge state="Failed" />);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('bg-rose-500/20');
    expect(badge).toHaveClass('text-rose-300');
  });

  it('acepta className adicional', () => {
    const { container } = render(<StateBadge state="Pending" className="extra-class" />);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('extra-class');
  });

  it('maneja estado desconocido usando estilos de Pending', () => {
    render(<StateBadge state="Unknown" />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });
});
