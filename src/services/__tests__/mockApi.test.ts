import { describe, it, expect, beforeEach } from 'vitest';
import { taskTypesApi, workflowsApi, runsApi, resetMockData } from '../mockApi';

describe('mockApi', () => {
  beforeEach(() => {
    resetMockData();
  });

  describe('taskTypesApi', () => {
    it('should get all task types', async () => {
      const taskTypes = await taskTypesApi.getAll();
      expect(taskTypes).toBeInstanceOf(Array);
      expect(taskTypes.length).toBeGreaterThan(0);
      expect(taskTypes[0]).toHaveProperty('type');
      expect(taskTypes[0]).toHaveProperty('display_name');
    });
  });

  describe('workflowsApi', () => {
    it('should get all workflows', async () => {
      const workflows = await workflowsApi.getAll();
      expect(workflows).toBeInstanceOf(Array);
      expect(workflows.length).toBeGreaterThan(0);
      expect(workflows[0]).toHaveProperty('id');
      expect(workflows[0]).toHaveProperty('name');
    });

    it('should get workflow by id', async () => {
      const workflows = await workflowsApi.getAll();
      const firstWorkflow = workflows[0];

      const workflowDetail = await workflowsApi.getById(firstWorkflow!.id);
      expect(workflowDetail).toHaveProperty('workflow');
      expect(workflowDetail).toHaveProperty('steps');
      expect(workflowDetail).toHaveProperty('edges');
      expect(workflowDetail.workflow.id).toBe(firstWorkflow!.id);
    });

    it('should create workflow', async () => {
      const newWorkflow = await workflowsApi.create({
        name: 'Test Workflow',
        description: 'Test Description',
        steps: [],
        edges: [],
        schedule_cron: null,
      });

      expect(newWorkflow).toHaveProperty('id');
      expect(newWorkflow.name).toBe('Test Workflow');
      expect(newWorkflow.description).toBe('Test Description');
    });

    it('should delete workflow', async () => {
      const workflows = await workflowsApi.getAll();
      const initialCount = workflows.length;
      const workflowToDelete = workflows[0];

      await workflowsApi.delete(workflowToDelete!.id);

      const updatedWorkflows = await workflowsApi.getAll();
      expect(updatedWorkflows.length).toBe(initialCount - 1);
    });
  });

  describe('runsApi', () => {
    it('should get runs by workflow', async () => {
      const workflows = await workflowsApi.getAll();
      const firstWorkflow = workflows[0];

      const runs = await runsApi.getByWorkflow(firstWorkflow!.id);
      expect(runs).toBeInstanceOf(Array);
    });

    it('should get run by id', async () => {
      const workflows = await workflowsApi.getAll();
      const runs = await runsApi.getByWorkflow(workflows[0]!.id);

      if (runs.length > 0) {
        const runDetail = await runsApi.getById(runs[0]!.id);
        expect(runDetail).toHaveProperty('run');
        expect(runDetail).toHaveProperty('tasks');
      }
    });

    it('should get logs for run', async () => {
      const workflows = await workflowsApi.getAll();
      const runs = await runsApi.getByWorkflow(workflows[0]!.id);

      if (runs.length > 0) {
        const logs = await runsApi.getLogs(runs[0]!.id);
        expect(logs).toBeInstanceOf(Array);
      }
    });
  });
});
