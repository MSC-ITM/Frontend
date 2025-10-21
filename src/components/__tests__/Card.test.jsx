import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from '../Card';

describe('Card', () => {
  it('renderiza children correctamente', () => {
    render(
      <Card>
        <p>Test content</p>
      </Card>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renderiza con título cuando se proporciona', () => {
    render(
      <Card title="Test Title">
        <p>Content</p>
      </Card>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('no renderiza título cuando no se proporciona', () => {
    const { container } = render(
      <Card>
        <p>Content</p>
      </Card>
    );

    const titleElement = container.querySelector('h3');
    expect(titleElement).toBeNull();
  });

  it('aplica className personalizado correctamente', () => {
    const { container } = render(
      <Card className="custom-class">
        <p>Content</p>
      </Card>
    );

    const cardElement = container.firstChild;
    expect(cardElement).toHaveClass('custom-class');
  });

  it('tiene las clases base correctas', () => {
    const { container } = render(
      <Card>
        <p>Content</p>
      </Card>
    );

    const cardElement = container.firstChild;
    expect(cardElement).toHaveClass('bg-white');
    expect(cardElement).toHaveClass('rounded-lg');
    expect(cardElement).toHaveClass('border');
    expect(cardElement).toHaveClass('shadow-sm');
  });

  it('renderiza múltiples children', () => {
    render(
      <Card>
        <p>First child</p>
        <span>Second child</span>
        <div>Third child</div>
      </Card>
    );

    expect(screen.getByText('First child')).toBeInTheDocument();
    expect(screen.getByText('Second child')).toBeInTheDocument();
    expect(screen.getByText('Third child')).toBeInTheDocument();
  });
});
