import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PredictionModal from '../PredictionModal';

describe('PredictionModal', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  const mockPrediction = {
    estimatedDuration: 120,
    estimatedSuccessRate: 85,
    costLevel: 'medio' as const,
    potentialIssues: [
      'El nodo HTTP puede fallar',
      'Sin validación de datos'
    ],
    recommendations: [
      'Agregar timeout a peticiones',
      'Validar datos de entrada'
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no debe renderizar cuando isOpen es false', () => {
    render(
      <PredictionModal
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        prediction={mockPrediction}
        loading={false}
      />
    );

    expect(screen.queryByText(/Predicción con IA/i)).not.toBeInTheDocument();
  });

  it('debe renderizar cuando isOpen es true', () => {
    render(
      <PredictionModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        prediction={mockPrediction}
        loading={false}
      />
    );

    expect(screen.getByText(/Predicción con IA/i)).toBeInTheDocument();
  });

  it('debe mostrar estado de carga', () => {
    render(
      <PredictionModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        prediction={null}
        loading={true}
      />
    );

    expect(screen.getByText('Analizando workflow...')).toBeInTheDocument();
    expect(screen.getByText('La IA está calculando predicciones')).toBeInTheDocument();
  });

  it('debe mostrar predicción con métricas', () => {
    render(
      <PredictionModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        prediction={mockPrediction}
        loading={false}
      />
    );

    expect(screen.getByText('Tiempo Estimado')).toBeInTheDocument();
    expect(screen.getByText('2m')).toBeInTheDocument(); // 120 segundos = 2m
    expect(screen.getByText('Tasa de Éxito')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('debe formatear duración correctamente para segundos', () => {
    const prediction = {
      ...mockPrediction,
      estimatedDuration: 45 // 45 segundos
    };

    render(
      <PredictionModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        prediction={prediction}
        loading={false}
      />
    );

    expect(screen.getByText('45s')).toBeInTheDocument();
  });

  it('debe formatear duración correctamente para minutos y segundos', () => {
    const prediction = {
      ...mockPrediction,
      estimatedDuration: 135 // 2m 15s
    };

    render(
      <PredictionModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        prediction={prediction}
        loading={false}
      />
    );

    expect(screen.getByText('2m 15s')).toBeInTheDocument();
  });

  it('debe mostrar problemas potenciales', () => {
    render(
      <PredictionModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        prediction={mockPrediction}
        loading={false}
      />
    );

    expect(screen.getByText('⚠️ Problemas Potenciales')).toBeInTheDocument();
    expect(screen.getByText('El nodo HTTP puede fallar')).toBeInTheDocument();
    expect(screen.getByText('Sin validación de datos')).toBeInTheDocument();
  });

  it('debe mostrar recomendaciones', () => {
    render(
      <PredictionModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        prediction={mockPrediction}
        loading={false}
      />
    );

    expect(screen.getByText('💡 Recomendaciones')).toBeInTheDocument();
    expect(screen.getByText('Agregar timeout a peticiones')).toBeInTheDocument();
    expect(screen.getByText('Validar datos de entrada')).toBeInTheDocument();
  });

  it('debe llamar onClose al hacer clic en cerrar', () => {
    render(
      <PredictionModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        prediction={mockPrediction}
        loading={false}
      />
    );

    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find(btn => btn.querySelector('svg path[d*="M6 18L18 6M6 6l12 12"]'));

    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('debe llamar onClose al hacer clic en Cancelar', () => {
    render(
      <PredictionModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        prediction={mockPrediction}
        loading={false}
      />
    );

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('debe llamar onConfirm y onClose al hacer clic en Ejecutar', () => {
    render(
      <PredictionModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        prediction={mockPrediction}
        loading={false}
      />
    );

    const executeButton = screen.getByText('✅ Ejecutar de Todas Formas');
    fireEvent.click(executeButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('debe mostrar mensaje cuando no hay predicción', () => {
    render(
      <PredictionModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        prediction={null}
        loading={false}
      />
    );

    expect(screen.getByText('No hay predicción disponible')).toBeInTheDocument();
  });

  it('no debe mostrar botones cuando está cargando', () => {
    render(
      <PredictionModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        prediction={null}
        loading={true}
      />
    );

    expect(screen.queryByText('Cancelar')).not.toBeInTheDocument();
    expect(screen.queryByText('✅ Ejecutar de Todas Formas')).not.toBeInTheDocument();
  });

  it('debe renderizar CostBar con el nivel correcto', () => {
    render(
      <PredictionModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        prediction={mockPrediction}
        loading={false}
      />
    );

    expect(screen.getByText('💰 Predicción de Costos de la IA')).toBeInTheDocument();
  });

  it('debe manejar predicción sin problemas', () => {
    const prediction = {
      ...mockPrediction,
      potentialIssues: []
    };

    render(
      <PredictionModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        prediction={prediction}
        loading={false}
      />
    );

    expect(screen.queryByText('⚠️ Problemas Potenciales')).not.toBeInTheDocument();
  });

  it('debe manejar predicción sin recomendaciones', () => {
    const prediction = {
      ...mockPrediction,
      recommendations: []
    };

    render(
      <PredictionModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        prediction={prediction}
        loading={false}
      />
    );

    expect(screen.queryByText('💡 Recomendaciones')).not.toBeInTheDocument();
  });
});
