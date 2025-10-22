import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/test-utils';
import Card from '../Card';

describe('Card', () => {
  it('debería renderizar children', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('debería renderizar con título', () => {
    render(<Card title="Card Title">Card Content</Card>);
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('no debería renderizar header del título cuando no se proporciona', () => {
    const { container } = render(<Card>Card Content</Card>);
    const titleElement = container.querySelector('h3');
    expect(titleElement).toBeNull();
  });

  it('debería aplicar className personalizado', () => {
    render(<Card className="custom-class">Content</Card>);
    const card = screen.getByText('Content').parentElement;
    expect(card).toHaveClass('custom-class');
  });

  it('debería tener clases de estilo por defecto', () => {
    render(<Card>Content</Card>);
    const card = screen.getByText('Content').parentElement;
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'border');
  });
});
