import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/test-utils';
import StateBadge from '../StateBadge';
import { TaskState } from '../../types';

describe('StateBadge', () => {
  it('debería renderizar estado Pending', () => {
    render(<StateBadge state="Pending" />);
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('debería renderizar estado Running', () => {
    render(<StateBadge state="Running" />);
    expect(screen.getByText('Ejecutando')).toBeInTheDocument();
  });

  it('debería renderizar estado Succeeded', () => {
    render(<StateBadge state="Succeeded" />);
    expect(screen.getByText('Exitoso')).toBeInTheDocument();
  });

  it('debería renderizar estado Failed', () => {
    render(<StateBadge state="Failed" />);
    expect(screen.getByText('Fallido')).toBeInTheDocument();
  });

  it('debería renderizar estado Retry', () => {
    render(<StateBadge state="Retry" />);
    expect(screen.getByText('Reintentando')).toBeInTheDocument();
  });

  it('debería tener estilos correctos para estado Pending', () => {
    render(<StateBadge state="Pending" />);
    const badge = screen.getByText('Pendiente');
    expect(badge).toHaveClass('bg-gray-500/20', 'text-gray-300');
  });

  it('debería tener estilos correctos para estado Running', () => {
    render(<StateBadge state="Running" />);
    const badge = screen.getByText('Ejecutando');
    expect(badge).toHaveClass('bg-cyan-500/20', 'text-cyan-300');
  });

  it('debería tener estilos correctos para estado Succeeded', () => {
    render(<StateBadge state="Succeeded" />);
    const badge = screen.getByText('Exitoso');
    expect(badge).toHaveClass('bg-emerald-500/20', 'text-emerald-300');
  });

  it('debería tener estilos correctos para estado Failed', () => {
    render(<StateBadge state="Failed" />);
    const badge = screen.getByText('Fallido');
    expect(badge).toHaveClass('bg-rose-500/20', 'text-rose-300');
  });

  it('debería tener estilos correctos para estado Retry', () => {
    render(<StateBadge state="Retry" />);
    const badge = screen.getByText('Reintentando');
    expect(badge).toHaveClass('bg-orange-500/20', 'text-orange-300');
  });

  it('debería aplicar className personalizado', () => {
    render(<StateBadge state="Pending" className="custom-class" />);
    const badge = screen.getByText('Pendiente');
    expect(badge).toHaveClass('custom-class');
  });

  it('debería tener clases por defecto para todos los estados', () => {
    render(<StateBadge state="Succeeded" />);
    const badge = screen.getByText('Exitoso');
    expect(badge).toHaveClass('inline-flex', 'items-center', 'px-3', 'py-1', 'rounded-full', 'text-xs', 'font-medium', 'border', 'shadow-sm');
  });
});
