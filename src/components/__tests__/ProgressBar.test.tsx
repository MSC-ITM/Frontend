import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/test-utils';
import ProgressBar from '../ProgressBar';

describe('ProgressBar', () => {
  it('debería renderizar la barra de progreso con el ancho correcto', () => {
    render(<ProgressBar value={50} />);
    const progressFill = document.querySelector('[style*="width: 50%"]');
    expect(progressFill).toBeInTheDocument();
  });

  it('debería renderizar la etiqueta cuando se proporciona', () => {
    render(<ProgressBar value={75} label="75% Complete" />);
    expect(screen.getByText('75% Complete')).toBeInTheDocument();
  });

  it('debería renderizar progreso de 0%', () => {
    render(<ProgressBar value={0} />);
    const progressFill = document.querySelector('[style*="width: 0%"]');
    expect(progressFill).toBeInTheDocument();
  });

  it('debería renderizar progreso de 100%', () => {
    render(<ProgressBar value={100} />);
    const progressFill = document.querySelector('[style*="width: 100%"]');
    expect(progressFill).toBeInTheDocument();
  });

  it('debería aplicar className personalizado', () => {
    const { container } = render(<ProgressBar value={50} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
