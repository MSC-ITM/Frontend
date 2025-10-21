import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loading from '../Loading';

describe('Loading', () => {
  it('renderiza el spinner correctamente', () => {
    const { container } = render(<Loading />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('renderiza con mensaje personalizado', () => {
    render(<Loading message="Cargando datos..." />);
    expect(screen.getByText('Cargando datos...')).toBeInTheDocument();
  });

  it('no renderiza mensaje si no se proporciona', () => {
    const { container } = render(<Loading />);
    const paragraph = container.querySelector('p');
    expect(paragraph).not.toBeInTheDocument();
  });

  it('renderiza con tamaño small', () => {
    const { container } = render(<Loading size="sm" />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('w-6');
    expect(spinner).toHaveClass('h-6');
  });

  it('renderiza con tamaño medium por defecto', () => {
    const { container } = render(<Loading />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('w-10');
    expect(spinner).toHaveClass('h-10');
  });

  it('renderiza con tamaño large', () => {
    const { container } = render(<Loading size="lg" />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('w-16');
    expect(spinner).toHaveClass('h-16');
  });

  it('tiene clases de estilo correctas', () => {
    const { container } = render(<Loading />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('border-4');
    expect(spinner).toHaveClass('rounded-full');
  });
});
