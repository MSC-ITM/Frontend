import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressBar from '../ProgressBar';

describe('ProgressBar', () => {
  it('renderiza con valor correcto', () => {
    const { container } = render(<ProgressBar value={50} />);
    const progressBar = container.querySelector('[style*="width: 50%"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('limita el valor máximo a 100', () => {
    const { container } = render(<ProgressBar value={150} />);
    const progressBar = container.querySelector('[style*="width: 100%"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('limita el valor mínimo a 0', () => {
    const { container } = render(<ProgressBar value={-50} />);
    const progressBar = container.querySelector('[style*="width: 0%"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('renderiza con label cuando se proporciona', () => {
    render(<ProgressBar value={75} label="Progreso General" />);
    expect(screen.getByText('Progreso General')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('no renderiza label si no se proporciona', () => {
    const { container } = render(<ProgressBar value={50} />);
    const label = container.querySelector('span');
    expect(label).not.toBeInTheDocument();
  });

  it('muestra porcentaje redondeado', () => {
    render(<ProgressBar value={33.7} label="Test" />);
    expect(screen.getByText('34%')).toBeInTheDocument();
  });

  it('acepta className adicional', () => {
    const { container } = render(<ProgressBar value={50} className="extra-class" />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('extra-class');
  });

  it('tiene clases de estilo correctas', () => {
    const { container } = render(<ProgressBar value={50} />);
    const progressBar = container.querySelector('.bg-gradient-to-r');
    expect(progressBar).toHaveClass('from-cyan-500');
    expect(progressBar).toHaveClass('to-blue-500');
  });
});
