/**
 * Mock API service - simulates backend calls with local data
 */

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
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Clone data to avoid mutations
const clone = (data) => JSON.parse(JSON.stringify(data));

// In-memory storage
let workflows = clone(mockWorkflows);
let steps = clone(mockSteps);
let edges = clone(mockEdges);
let runs = clone(mockRuns);
let taskInstances = clone(mockTaskInstances);
let logs = clone(mockLogs);

// Task Types API
export const taskTypesApi = {
  getAll: async () => {
    await delay(300);
    return clone(mockTaskTypes);
  },
};

// Workflows API
export const workflowsApi = {
  getAll: async () => {
    await delay(400);
    return clone(workflows);
  },

  getById: async (id) => {
    await delay(400);
    const workflow = workflows.find((w) => w.id === id);
    if (!workflow) {
      throw new Error('Workflow not found');
    }
    return {
      workflow: clone(workflow),
      steps: clone(steps[id] || []),
      edges: clone(edges[id] || []),
    };
  },

  create: async (data) => {
    await delay(600);
    const id = generateId('wf');
    const now = new Date().toISOString();

    const newWorkflow = {
      id,
      name: data.name,
      description: data.description,
      schedule_cron: data.schedule_cron,
      active: data.active !== undefined ? data.active : true,
      created_at: now,
    };

    workflows.push(newWorkflow);

    // Store steps and edges
    if (data.steps) {
      steps[id] = data.steps.map((step) => ({
        ...step,
        id: step.id || generateId('step'),
        workflow_id: id,
      }));
    }

    if (data.edges) {
      edges[id] = data.edges.map((edge) => ({
        ...edge,
        id: edge.id || generateId('edge'),
        workflow_id: id,
      }));
    }

    return clone(newWorkflow);
  },

  update: async (id, data) => {
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
      active: data.active !== undefined ? data.active : workflows[index].active,
    };

    // Update steps and edges
    if (data.steps) {
      steps[id] = data.steps.map((step) => ({
        ...step,
        id: step.id || generateId('step'),
        workflow_id: id,
      }));
    }

    if (data.edges) {
      edges[id] = data.edges.map((edge) => ({
        ...edge,
        id: edge.id || generateId('edge'),
        workflow_id: id,
      }));
    }

    return clone(workflows[index]);
  },

  delete: async (id) => {
    await delay(400);
    workflows = workflows.filter((w) => w.id !== id);
    delete steps[id];
    delete edges[id];
    // Also delete associated runs
    runs = runs.filter((r) => r.workflow_id !== id);
  },

  runNow: async (id) => {
    await delay(500);
    const workflow = workflows.find((w) => w.id === id);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const runId = generateId('run');
    const now = new Date().toISOString();

    const newRun = {
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
      state: index === 0 ? 'Running' : 'Pending',
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
        message: `Workflow execution started`,
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

    return clone(newRun);
  },
};

// Runs API
export const runsApi = {
  getByWorkflow: async (workflowId) => {
    await delay(400);
    const workflowRuns = runs.filter((r) => r.workflow_id === workflowId);
    return clone(workflowRuns);
  },

  getById: async (runId) => {
    await delay(400);
    const run = runs.find((r) => r.id === runId);
    if (!run) {
      throw new Error('Run not found');
    }

    return {
      run: clone(run),
      tasks: clone(taskInstances[runId] || []),
    };
  },

  getLogs: async (runId, options = {}) => {
    await delay(300);
    let runLogs = clone(logs[runId] || []);

    // Filter by task if specified
    if (options.task) {
      runLogs = runLogs.filter((log) => {
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

  cancel: async (runId) => {
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
            state: 'Canceled',
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

    return clone(runs[index]);
  },
};

// Reset mock data (useful for testing)
export const resetMockData = () => {
  workflows = clone(mockWorkflows);
  steps = clone(mockSteps);
  edges = clone(mockEdges);
  runs = clone(mockRuns);
  taskInstances = clone(mockTaskInstances);
  logs = clone(mockLogs);
};
