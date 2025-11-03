import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  optimizeWorkflow,
  repairWorkflow,
  predictWorkflowOutcome,
} from '../aiService';
import { Step, Edge } from '../../types';
import apiClient from '../api';

// Mock del apiClient
vi.mock('../api', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('AI Service', () => {
  const mockSteps: Step[] = [
    {
      id: 'step1-id',
      workflow_id: 'test-workflow',
      node_key: 'step1',
      type: 'http_get',
      params: { url: 'https://api.example.com/data' },
    },
    {
      id: 'step2-id',
      workflow_id: 'test-workflow',
      node_key: 'step2',
      type: 'validate_csv',
      params: {},
    },
  ];

  const mockEdges: Edge[] = [
    {
      id: 'edge1-id',
      workflow_id: 'test-workflow',
      from_node_key: 'step1',
      to_node_key: 'step2',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('optimizeWorkflow', () => {
    it('debe optimizar workflow cuando hay sugerencias de la IA', async () => {
      // Mock de respuesta del backend con sugerencias
      const mockResponse = {
        data: {
          rationale: 'Se detectaron mejoras en los parámetros',
          suggestions: [
            {
              kind: 'parameter_set',
              path: 'steps[0].params',
              detail: {
                timeout: 5000,
                retries: 3
              },
              message: 'Agregar timeout y reintentos al nodo HTTP'
            }
          ]
        }
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const result = await optimizeWorkflow('test-workflow', mockSteps, mockEdges);

      expect(result.canOptimize).toBe(true);
      expect(result.optimizedSteps).toBeDefined();
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions!.length).toBeGreaterThan(0);
      expect(apiClient.post).toHaveBeenCalledWith('/ia/suggestion', expect.any(Object));
    });

    it('debe indicar que no se puede optimizar cuando no hay sugerencias', async () => {
      // Mock de respuesta sin sugerencias
      const mockResponse = {
        data: {
          rationale: 'El workflow ya está optimizado',
          suggestions: []
        }
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const result = await optimizeWorkflow('test-workflow', mockSteps, mockEdges);

      expect(result.canOptimize).toBe(false);
      expect(result.message).toContain('optimizado');
    });

    it('debe manejar errores de red y devolver mensaje apropiado', async () => {
      // Suprimir console.error para este test
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock de error de red
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Network Error'));

      const result = await optimizeWorkflow('test-workflow', mockSteps, mockEdges);

      expect(result.canOptimize).toBe(false);
      expect(result.message).toContain('No se pudo conectar');
      expect(result.suggestions).toBeDefined();

      // Restaurar console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe('repairWorkflow', () => {
    it('debe reparar un nodo con errores', async () => {
      // Mock de respuesta del backend con definición reparada
      const mockResponse = {
        data: {
          rationale: 'Se corrigieron los parámetros del nodo',
          patched_definition: {
            nodes: [
              {
                id: 'step1',
                type: 'http_get',
                params: {
                  url: 'https://api.example.com/data',
                  timeout: 10000,
                  retries: 5
                },
                depends_on: []
              },
              {
                id: 'step2',
                type: 'validate_csv',
                params: {},
                depends_on: ['step1']
              }
            ]
          },
          issues: ['Falta timeout en http_get', 'Falta manejo de errores']
        }
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const result = await repairWorkflow(
        'test-workflow',
        mockSteps,
        mockEdges,
        'step1',
        ['Error en step1']
      );

      expect(result.canRepair).toBe(true);
      expect(result.repairedSteps).toBeDefined();
      expect(result.fixedIssues).toBeDefined();
      expect(apiClient.post).toHaveBeenCalledWith('/ia/fix', expect.any(Object));
    });

    it('debe manejar errores cuando el backend no puede reparar', async () => {
      // Suprimir console.error para este test
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock de error del backend
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Backend Error'));

      const result = await repairWorkflow(
        'test-workflow',
        mockSteps,
        mockEdges,
        'step1',
        []
      );

      expect(result.canRepair).toBe(false);
      expect(result.message).toContain('No se pudo conectar');

      // Restaurar console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe('predictWorkflowOutcome', () => {
    it('debe predecir resultados del workflow', async () => {
      // Mock de respuesta del backend con predicciones
      const mockResponse = {
        data: {
          estimated_time_seconds: 45,  // Campo correcto según el código
          estimated_cost_usd: 0.002,
          complexity_score: 0.5,
          breakdown: [
            { type: 'http_get', time: 5, cost: 0.001 },
            { type: 'validate_csv', time: 10, cost: 0.0005 }
          ],
          assumptions: [
            'API externa responde en tiempo promedio',
            'Datos CSV son válidos'
          ]
        }
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const result = await predictWorkflowOutcome('test-workflow', mockSteps, mockEdges);

      expect(result.estimatedDuration).toBeGreaterThan(0);
      expect(result.estimatedSuccessRate).toBeGreaterThan(0);
      expect(result.estimatedSuccessRate).toBeLessThanOrEqual(100);
      expect(result.potentialIssues).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(apiClient.post).toHaveBeenCalledWith('/ia/estimate', expect.any(Object));
    });

    it('debe manejar errores del backend en predicción', async () => {
      // Suprimir console.error para este test
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock de error
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Prediction Error'));

      const result = await predictWorkflowOutcome('test-workflow', mockSteps, mockEdges);

      expect(result.estimatedDuration).toBeGreaterThan(0);
      expect(result.estimatedSuccessRate).toBeGreaterThan(0);
      expect(result.potentialIssues).toBeDefined();

      // Restaurar console.error
      consoleErrorSpy.mockRestore();
    });
  });
});
