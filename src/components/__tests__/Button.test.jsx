import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../Button';

describe('Button', () => {
  it('renderiza el texto del botón correctamente', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('maneja eventos onClick', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button');

    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renderiza con variante primary por defecto', () => {
    const { container } = render(<Button>Primary</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-blue-600');
  });

  it('renderiza con variante secondary', () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-gray-200');
    expect(button).toHaveClass('text-gray-900');
  });

  it('renderiza con variante danger', () => {
    const { container } = render(<Button variant="danger">Danger</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-red-600');
  });

  it('renderiza con variante ghost', () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-transparent');
  });

  it('renderiza con tamaño small', () => {
    const { container } = render(<Button size="sm">Small</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('px-3');
    expect(button).toHaveClass('py-1.5');
  });

  it('renderiza con tamaño medium por defecto', () => {
    const { container } = render(<Button>Medium</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('px-4');
    expect(button).toHaveClass('py-2');
  });

  it('renderiza con tamaño large', () => {
    const { container } = render(<Button size="lg">Large</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('px-6');
    expect(button).toHaveClass('py-3');
  });

  it('se deshabilita correctamente', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50');
    expect(button).toHaveClass('cursor-not-allowed');
  });

  it('no ejecuta onClick cuando está deshabilitado', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick} disabled>Disabled</Button>);
    const button = screen.getByRole('button');

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('acepta className adicional', () => {
    const { container } = render(<Button className="extra-class">Button</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('extra-class');
  });

  it('acepta tipo de botón personalizado', () => {
    render(<Button type="submit">Submit</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });
});
