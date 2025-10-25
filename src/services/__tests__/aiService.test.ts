import { describe, it, expect, beforeEach } from 'vitest';
import {
  optimizeWorkflow,
  repairWorkflow,
  predictWorkflowOutcome,
  resetOptimizationCount,
} from '../aiService';
import { Step, Edge } from '../../types';

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
    resetOptimizationCount('test-workflow');
  });

  describe('optimizeWorkflow', () => {
    it('debe optimizar workflow en la primera ejecución', async () => {
      const result = await optimizeWorkflow('test-workflow', mockSteps, mockEdges);

      expect(result.canOptimize).toBe(true);
      expect(result.optimizedSteps).toBeDefined();
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions!.length).toBeGreaterThan(0);
    });

    it('debe optimizar workflow en la segunda ejecución', async () => {
      // Primera optimización
      await optimizeWorkflow('test-workflow', mockSteps, mockEdges);

      // Segunda optimización
      const result = await optimizeWorkflow('test-workflow', mockSteps, mockEdges);

      expect(result.canOptimize).toBe(true);
      expect(result.optimizedSteps).toBeDefined();
    });

    it('debe indicar que no se puede optimizar más después de 2 optimizaciones', async () => {
      // Primera optimización
      await optimizeWorkflow('test-workflow', mockSteps, mockEdges);

      // Segunda optimización
      await optimizeWorkflow('test-workflow', mockSteps, mockEdges);

      // Tercera optimización
      const result = await optimizeWorkflow('test-workflow', mockSteps, mockEdges);

      expect(result.canOptimize).toBe(false);
      expect(result.message).toContain('completamente optimizado');
    });
  });

  describe('repairWorkflow', () => {
    it('debe reparar un nodo HTTP GET fallido', async () => {
      const result = await repairWorkflow(
        'test-workflow',
        mockSteps,
        mockEdges,
        'step1'
      );

      expect(result.canRepair).toBe(true);
      expect(result.repairedSteps).toBeDefined();
      expect(result.fixedIssues).toBeDefined();
      expect(result.fixedIssues!.length).toBeGreaterThan(0);

      // Verificar que se agregaron parámetros de timeout y reintentos
      const repairedStep = result.repairedSteps!.find((s) => s.node_key === 'step1');
      expect(repairedStep?.params.timeout).toBe(10000);
      expect(repairedStep?.params.retries).toBe(5);
    });

    it('debe reparar un nodo de validación CSV fallido', async () => {
      const result = await repairWorkflow(
        'test-workflow',
        mockSteps,
        mockEdges,
        'step2'
      );

      expect(result.canRepair).toBe(true);
      expect(result.repairedSteps).toBeDefined();

      // Verificar que se agregaron parámetros de tolerancia
      const repairedStep = result.repairedSteps!.find((s) => s.node_key === 'step2');
      expect(repairedStep?.params.skipInvalidRows).toBe(true);
      expect(repairedStep?.params.strictMode).toBe(false);
    });

    it('debe retornar error si no se encuentra el nodo', async () => {
      const result = await repairWorkflow(
        'test-workflow',
        mockSteps,
        mockEdges,
        'nonexistent-node'
      );

      expect(result.canRepair).toBe(false);
      expect(result.message).toContain('No se pudo identificar el nodo');
    });
  });

  describe('predictWorkflowOutcome', () => {
    it('debe predecir resultados del workflow', async () => {
      const result = await predictWorkflowOutcome('test-workflow', mockSteps, mockEdges);

      expect(result.estimatedDuration).toBeGreaterThan(0);
      expect(result.estimatedSuccessRate).toBeGreaterThan(0);
      expect(result.estimatedSuccessRate).toBeLessThanOrEqual(100);
      expect(result.potentialIssues).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    it('debe reducir tasa de éxito si no hay validación', async () => {
      const stepsWithoutValidation: Step[] = [
        {
          id: 'step1-id',
          workflow_id: 'test-workflow',
          node_key: 'step1',
          type: 'http_get',
          params: {},
        },
      ];

      const result = await predictWorkflowOutcome(
        'test-workflow',
        stepsWithoutValidation,
        []
      );

      expect(result.estimatedSuccessRate).toBeLessThan(95);
    });
  });
});
