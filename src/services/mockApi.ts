/**
 * Mock API service - simulates backend calls with local data
 */

import {
  TaskType,
  Workflow,
  Run,
  TaskInstance,
  LogEntry,
  WorkflowDetailDTO,
  RunDetailDTO,
  CreateWorkflowDTO,
  taskTypeSchema,
  workflowSchema,
  runSchema,
  workflowDetailDTOSchema,
  runDetailDTOSchema,
  createWorkflowDTOSchema,
  validateOrThrow,
} from '../types/index';
import {
  mockTaskTypes,
  mockWorkflows,
  mockSteps,
  mockEdges,
  mockRuns,
  mockTaskInstances,
  mockLogs,
  generateId,
} from './mockData';

// Simulate network delay
const delay = (ms = 500): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

// Clone data to avoid mutations
const clone = <T>(data: T): T => JSON.parse(JSON.stringify(data));

// In-memory storage
let workflows: Workflow[] = clone(mockWorkflows);
let steps = clone(mockSteps);
let edges = clone(mockEdges);
let runs: Run[] = clone(mockRuns);
let taskInstances = clone(mockTaskInstances);
let logs = clone(mockLogs);

// Log options interface
interface GetLogsOptions {
  task?: string;
  page?: number;
  limit?: number;
}

// Task Types API
export const taskTypesApi = {
  getAll: async (): Promise<TaskType[]> => {
    await delay(300);
    const data = clone(mockTaskTypes);
    // Validate response
    return data.map((item) => validateOrThrow(taskTypeSchema, item));
  },
};

// Workflows API
export const workflowsApi = {
  getAll: async (): Promise<Workflow[]> => {
    await delay(400);
    const data = clone(workflows);
    // Validate response
    return data.map((item) => validateOrThrow(workflowSchema, item));
  },

  getById: async (id: string): Promise<WorkflowDetailDTO> => {
    await delay(400);
    const workflow = workflows.find((w) => w.id === id);
    if (!workflow) {
      throw new Error('Workflow not found');
    }
    const result = {
      workflow: clone(workflow),
      steps: clone(steps[id] || []),
      edges: clone(edges[id] || []),
    };
    // Validate response
    return validateOrThrow(workflowDetailDTOSchema, result);
  },

  create: async (data: CreateWorkflowDTO): Promise<Workflow> => {
    await delay(600);
    // Validate input
    const validatedData = validateOrThrow(createWorkflowDTOSchema, data);

    const id = generateId('wf');
    const now = new Date().toISOString();

    const newWorkflow: Workflow = {
      id,
      name: validatedData.name,
      description: validatedData.description,
      schedule_cron: validatedData.schedule_cron || null,
      active: true,
      created_at: now,
    };

    workflows.push(newWorkflow);

    // Store steps and edges
    if (validatedData.steps) {
      steps[id] = validatedData.steps.map((step) => ({
        ...step,
        id: generateId('step'),
        workflow_id: id,
      }));
    }

    if (validatedData.edges) {
      edges[id] = validatedData.edges.map((edge) => ({
        ...edge,
        id: generateId('edge'),
        workflow_id: id,
      }));
    }

    // Validate response
    return validateOrThrow(workflowSchema, clone(newWorkflow));
  },

  update: async (id: string, data: Partial<CreateWorkflowDTO>): Promise<Workflow> => {
    await delay(600);
    const index = workflows.findIndex((w) => w.id === id);
    if (index === -1) {
      throw new Error('Workflow not found');
    }

    workflows[index] = {
      ...workflows[index],
      name: data.name !== undefined ? data.name : workflows[index].name,
      description: data.description !== undefined ? data.description : workflows[index].description,
      schedule_cron: data.schedule_cron !== undefined ? data.schedule_cron : workflows[index].schedule_cron,
      active: workflows[index].active,
    };

    // Update steps and edges if provided
    if (data.steps) {
      steps[id] = data.steps.map((step) => ({
        ...step,
        id: generateId('step'),
        workflow_id: id,
      }));
    }

    if (data.edges) {
      edges[id] = data.edges.map((edge) => ({
        ...edge,
        id: generateId('edge'),
        workflow_id: id,
      }));
    }

    // Validate response
    return validateOrThrow(workflowSchema, clone(workflows[index]));
  },

  delete: async (id: string): Promise<void> => {
    await delay(400);
    workflows = workflows.filter((w) => w.id !== id);
    delete steps[id];
    delete edges[id];
    // Also delete associated runs
    runs = runs.filter((r) => r.workflow_id !== id);
  },

  runNow: async (id: string): Promise<Run> => {
    await delay(500);
    const workflow = workflows.find((w) => w.id === id);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const runId = generateId('run');
    const now = new Date().toISOString();

    const newRun: Run = {
      id: runId,
      workflow_id: id,
      state: 'Running',
      started_at: now,
      finished_at: null,
    };

    runs.push(newRun);

    // Create task instances for this run
    const workflowSteps = steps[id] || [];
    taskInstances[runId] = workflowSteps.map((step, index) => ({
      id: generateId('task'),
      run_id: runId,
      node_key: step.node_key,
      type: step.type,
      state: index === 0 ? ('Running' as const) : ('Pending' as const),
      try_count: index === 0 ? 1 : 0,
      max_retries: 3,
      started_at: index === 0 ? now : null,
      finished_at: null,
      error: null,
    }));

    // Create initial log
    logs[runId] = [
      {
        id: generateId('log'),
        run_id: runId,
        task_instance_id: null,
        level: 'INFO',
        message: 'Workflow execution started',
        ts: now,
      },
    ];

    if (workflowSteps.length > 0) {
      logs[runId].push({
        id: generateId('log'),
        run_id: runId,
        task_instance_id: taskInstances[runId][0].id,
        level: 'INFO',
        message: `Starting task: ${workflowSteps[0].node_key}`,
        ts: now,
      });
    }

    // Validate response
    return validateOrThrow(runSchema, clone(newRun));
  },
};

// Runs API
export const runsApi = {
  getByWorkflow: async (workflowId: string): Promise<Run[]> => {
    await delay(400);
    const workflowRuns = runs.filter((r) => r.workflow_id === workflowId);
    const data = clone(workflowRuns);
    // Validate response
    return data.map((item) => validateOrThrow(runSchema, item));
  },

  getById: async (runId: string): Promise<RunDetailDTO> => {
    await delay(400);
    const run = runs.find((r) => r.id === runId);
    if (!run) {
      throw new Error('Run not found');
    }

    const result = {
      run: clone(run),
      tasks: clone(taskInstances[runId] || []),
    };

    // Validate response
    return validateOrThrow(runDetailDTOSchema, result);
  },

  getLogs: async (runId: string, options: GetLogsOptions = {}): Promise<LogEntry[]> => {
    await delay(300);
    let runLogs = clone(logs[runId] || []);

    // Filter by task if specified
    if (options.task) {
      runLogs = runLogs.filter((log: LogEntry) => {
        if (!log.task_instance_id) return false;
        const task = taskInstances[runId]?.find((t) => t.id === log.task_instance_id);
        return task?.node_key === options.task;
      });
    }

    // Apply pagination
    const limit = options.limit || 100;
    const page = options.page || 1;
    const start = (page - 1) * limit;
    const end = start + limit;

    return runLogs.slice(start, end);
  },

  cancel: async (runId: string): Promise<Run> => {
    await delay(500);
    const index = runs.findIndex((r) => r.id === runId);
    if (index === -1) {
      throw new Error('Run not found');
    }

    runs[index].state = 'Canceled';
    runs[index].finished_at = new Date().toISOString();

    // Cancel all pending/running tasks
    if (taskInstances[runId]) {
      taskInstances[runId] = taskInstances[runId].map((task) => {
        if (task.state === 'Pending' || task.state === 'Running') {
          return {
            ...task,
            state: 'Pending' as const, // Use Pending since Canceled is not in TaskState
            finished_at: new Date().toISOString(),
          };
        }
        return task;
      });
    }

    // Add cancel log
    if (logs[runId]) {
      logs[runId].push({
        id: generateId('log'),
        run_id: runId,
        task_instance_id: null,
        level: 'WARNING',
        message: 'Run canceled by user',
        ts: new Date().toISOString(),
      });
    }

    // Validate response
    return validateOrThrow(runSchema, clone(runs[index]));
  },
};

// Reset mock data (useful for testing)
export const resetMockData = (): void => {
  workflows = clone(mockWorkflows);
  steps = clone(mockSteps);
  edges = clone(mockEdges);
  runs = clone(mockRuns);
  taskInstances = clone(mockTaskInstances);
  logs = clone(mockLogs);
};
