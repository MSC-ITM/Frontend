import { describe, it, expect } from 'vitest';
import { render } from '../../test/test-utils';
import Loading from '../Loading';

describe('Loading', () => {
  it('debería renderizar el spinner de carga', () => {
    render(<Loading />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('debería renderizar con tamaño md por defecto', () => {
    render(<Loading />);
    const spinner = document.querySelector('.w-10');
    expect(spinner).toBeInTheDocument();
  });

  it('debería renderizar con tamaño sm', () => {
    render(<Loading size="sm" />);
    const spinner = document.querySelector('.w-6');
    expect(spinner).toBeInTheDocument();
  });

  it('debería renderizar con tamaño lg', () => {
    render(<Loading size="lg" />);
    const spinner = document.querySelector('.w-16');
    expect(spinner).toBeInTheDocument();
  });
});
