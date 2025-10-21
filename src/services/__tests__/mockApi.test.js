import { describe, it, expect, beforeEach } from 'vitest';
import { taskTypesApi, workflowsApi, runsApi, resetMockData } from '../mockApi';

describe('mockApi - Task Types', () => {
  it('getTaskTypes devuelve lista de tipos de tareas', async () => {
    const taskTypes = await taskTypesApi.getAll();
    expect(Array.isArray(taskTypes)).toBe(true);
    expect(taskTypes.length).toBeGreaterThan(0);
    expect(taskTypes[0]).toHaveProperty('type');
    expect(taskTypes[0]).toHaveProperty('display_name');
    expect(taskTypes[0]).toHaveProperty('params_schema');
  });
});

describe('mockApi - Workflows', () => {
  beforeEach(() => {
    resetMockData();
  });

  it('getWorkflows devuelve lista de workflows', async () => {
    const workflows = await workflowsApi.getAll();
    expect(Array.isArray(workflows)).toBe(true);
    expect(workflows.length).toBeGreaterThan(0);
  });

  it('getWorkflowById devuelve workflow específico con steps y edges', async () => {
    const workflows = await workflowsApi.getAll();
    const firstWorkflowId = workflows[0].id;

    const result = await workflowsApi.getById(firstWorkflowId);
    expect(result).toHaveProperty('workflow');
    expect(result).toHaveProperty('steps');
    expect(result).toHaveProperty('edges');
    expect(result.workflow.id).toBe(firstWorkflowId);
  });

  it('getWorkflowById lanza error con ID inexistente', async () => {
    await expect(workflowsApi.getById('nonexistent')).rejects.toThrow(
      'Workflow not found'
    );
  });

  it('createWorkflow crea nuevo workflow', async () => {
    const newWorkflow = {
      name: 'Test Workflow',
      description: 'Test description',
      schedule_cron: '0 0 * * *',
      active: true,
      steps: [
        {
          node_key: 'test_node',
          type: 'http_get',
          params: { url: 'https://test.com' },
        },
      ],
      edges: [],
    };

    const created = await workflowsApi.create(newWorkflow);
    expect(created).toHaveProperty('id');
    expect(created.name).toBe(newWorkflow.name);
    expect(created.description).toBe(newWorkflow.description);

    // Verificar que se agregó a la lista
    const workflows = await workflowsApi.getAll();
    const found = workflows.find((w) => w.id === created.id);
    expect(found).toBeDefined();
  });

  it('updateWorkflow actualiza workflow existente', async () => {
    const workflows = await workflowsApi.getAll();
    const workflowToUpdate = workflows[0];

    const updates = {
      name: 'Updated Name',
      description: 'Updated description',
    };

    const updated = await workflowsApi.update(workflowToUpdate.id, updates);
    expect(updated.name).toBe(updates.name);
    expect(updated.description).toBe(updates.description);
  });

  it('deleteWorkflow elimina workflow', async () => {
    const workflows = await workflowsApi.getAll();
    const workflowToDelete = workflows[workflows.length - 1];

    await workflowsApi.delete(workflowToDelete.id);

    // Verificar que ya no existe
    await expect(workflowsApi.getById(workflowToDelete.id)).rejects.toThrow();
  });
});

describe('mockApi - Runs', () => {
  beforeEach(() => {
    resetMockData();
  });

  it('runWorkflow crea nueva ejecución', async () => {
    const workflows = await workflowsApi.getAll();
    const workflowId = workflows[0].id;

    const run = await workflowsApi.runNow(workflowId);
    expect(run).toHaveProperty('id');
    expect(run.workflow_id).toBe(workflowId);
    expect(run.state).toBe('Running');
  });

  it('getRunById devuelve run con tasks', async () => {
    const workflows = await workflowsApi.getAll();
    const run = await workflowsApi.runNow(workflows[0].id);

    const result = await runsApi.getById(run.id);
    expect(result).toHaveProperty('run');
    expect(result).toHaveProperty('tasks');
    expect(result.run.id).toBe(run.id);
  });

  it('getRunLogs devuelve logs de ejecución', async () => {
    const workflows = await workflowsApi.getAll();
    const run = await workflowsApi.runNow(workflows[0].id);

    const logs = await runsApi.getLogs(run.id, {});
    expect(Array.isArray(logs)).toBe(true);
  });

  it('cancelRun cancela ejecución', async () => {
    const workflows = await workflowsApi.getAll();
    const run = await workflowsApi.runNow(workflows[0].id);

    const canceled = await runsApi.cancel(run.id);
    expect(canceled.state).toBe('Canceled');
  });
});

describe('mockApi - Delays', () => {
  it('simula delays de red', async () => {
    const start = Date.now();
    await workflowsApi.getAll();
    const end = Date.now();
    const duration = end - start;

    // Debería tardar al menos 300ms (delay mínimo)
    expect(duration).toBeGreaterThanOrEqual(250); // 250 para margen de error
  });
});
