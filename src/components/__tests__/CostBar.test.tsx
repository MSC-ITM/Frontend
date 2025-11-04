import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CostBar from '../CostBar';

describe('CostBar', () => {
  it('debe renderizar con nivel bajo', () => {
    render(<CostBar level="bajo" />);

    expect(screen.getByText('Nivel de Costo')).toBeInTheDocument();
    const bajoElements = screen.getAllByText('Bajo');
    expect(bajoElements.length).toBeGreaterThan(0);
  });

  it('debe renderizar con nivel medio', () => {
    render(<CostBar level="medio" />);

    const medioElements = screen.getAllByText('Medio');
    expect(medioElements.length).toBeGreaterThan(0);
  });

  it('debe renderizar con nivel alto', () => {
    render(<CostBar level="alto" />);

    const altoElements = screen.getAllByText('Alto');
    expect(altoElements.length).toBeGreaterThan(0);
  });

  it('debe usar label personalizado', () => {
    render(<CostBar level="bajo" label="Costo Estimado" />);

    expect(screen.getByText('Costo Estimado')).toBeInTheDocument();
  });

  it('debe mostrar todos los niveles en la barra', () => {
    render(<CostBar level="medio" />);

    const bajoLabels = screen.getAllByText('Bajo');
    const medioLabels = screen.getAllByText('Medio');
    const altoLabels = screen.getAllByText('Alto');

    expect(bajoLabels.length).toBeGreaterThan(0);
    expect(medioLabels.length).toBeGreaterThan(0);
    expect(altoLabels.length).toBeGreaterThan(0);
  });

  it('debe renderizar iconos SVG', () => {
    const { container } = render(<CostBar level="bajo" />);

    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('debe aplicar clases correctas para nivel bajo', () => {
    const { container } = render(<CostBar level="bajo" />);

    const emeraldElements = container.querySelectorAll('[class*="emerald"]');
    expect(emeraldElements.length).toBeGreaterThan(0);
  });

  it('debe aplicar clases correctas para nivel medio', () => {
    const { container } = render(<CostBar level="medio" />);

    const yellowElements = container.querySelectorAll('[class*="yellow"]');
    expect(yellowElements.length).toBeGreaterThan(0);
  });

  it('debe aplicar clases correctas para nivel alto', () => {
    const { container } = render(<CostBar level="alto" />);

    const roseElements = container.querySelectorAll('[class*="rose"]');
    expect(roseElements.length).toBeGreaterThan(0);
  });
});
