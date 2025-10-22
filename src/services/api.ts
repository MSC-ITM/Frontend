import axios, { AxiosInstance } from 'axios';
import {
  TaskType,
  Workflow,
  Run,
  LogEntry,
  WorkflowDetailDTO,
  RunDetailDTO,
  CreateWorkflowDTO,
  taskTypeSchema,
  workflowSchema,
  runSchema,
  logEntrySchema,
  workflowDetailDTOSchema,
  runDetailDTOSchema,
  validateOrThrow,
} from '../types/index';

// Import mock APIs
import * as mockApis from './mockApi';

// Configure base URL - update this when backend is deployed
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || true; // Set to true to use mock data

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Options for getLogs
interface GetLogsOptions {
  task?: string;
  page?: number;
  limit?: number;
}

// Task Types API Interface
interface TaskTypesApi {
  getAll: () => Promise<TaskType[]>;
}

// Workflows API Interface
interface WorkflowsApi {
  getAll: () => Promise<Workflow[]>;
  getById: (id: string) => Promise<WorkflowDetailDTO>;
  create: (data: CreateWorkflowDTO) => Promise<Workflow>;
  update: (id: string, data: Partial<CreateWorkflowDTO>) => Promise<Workflow>;
  delete: (id: string) => Promise<void>;
  runNow: (id: string) => Promise<Run>;
}

// Runs API Interface
interface RunsApi {
  getByWorkflow: (workflowId: string) => Promise<Run[]>;
  getById: (runId: string) => Promise<RunDetailDTO>;
  getLogs: (runId: string, options?: GetLogsOptions) => Promise<LogEntry[]>;
  cancel: (runId: string) => Promise<Run>;
}

// Real API implementations (when not using mock)
const realTaskTypesApi: TaskTypesApi = {
  getAll: async () => {
    const response = await apiClient.get<TaskType[]>('/task-types');
    // Validate response data
    return response.data.map((item) => validateOrThrow(taskTypeSchema, item));
  },
};

const realWorkflowsApi: WorkflowsApi = {
  getAll: async () => {
    const response = await apiClient.get<Workflow[]>('/workflows');
    // Validate response data
    return response.data.map((item) => validateOrThrow(workflowSchema, item));
  },

  getById: async (id: string) => {
    const response = await apiClient.get<WorkflowDetailDTO>(`/workflows/${id}`);
    // Validate response data
    return validateOrThrow(workflowDetailDTOSchema, response.data);
  },

  create: async (data: CreateWorkflowDTO) => {
    const response = await apiClient.post<Workflow>('/workflows', data);
    // Validate response data
    return validateOrThrow(workflowSchema, response.data);
  },

  update: async (id: string, data: Partial<CreateWorkflowDTO>) => {
    const response = await apiClient.put<Workflow>(`/workflows/${id}`, data);
    // Validate response data
    return validateOrThrow(workflowSchema, response.data);
  },

  delete: async (id: string) => {
    await apiClient.delete(`/workflows/${id}`);
  },

  runNow: async (id: string) => {
    const response = await apiClient.post<Run>(`/workflows/${id}/runs`);
    // Validate response data
    return validateOrThrow(runSchema, response.data);
  },
};

const realRunsApi: RunsApi = {
  getByWorkflow: async (workflowId: string) => {
    const response = await apiClient.get<Run[]>(`/workflows/${workflowId}/runs`);
    // Validate response data
    return response.data.map((item) => validateOrThrow(runSchema, item));
  },

  getById: async (runId: string) => {
    const response = await apiClient.get<RunDetailDTO>(`/runs/${runId}`);
    // Validate response data
    return validateOrThrow(runDetailDTOSchema, response.data);
  },

  getLogs: async (runId: string, options: GetLogsOptions = {}) => {
    const params = new URLSearchParams();
    if (options.task) params.append('task', options.task);
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());

    const queryString = params.toString();
    const url = `/runs/${runId}/logs${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get<LogEntry[]>(url);
    // Validate response data
    return response.data.map((item) => validateOrThrow(logEntrySchema, item));
  },

  cancel: async (runId: string) => {
    const response = await apiClient.post<Run>(`/runs/${runId}/cancel`);
    // Validate response data
    return validateOrThrow(runSchema, response.data);
  },
};

// Export APIs based on USE_MOCK flag
export const taskTypesApi: TaskTypesApi = USE_MOCK ? mockApis.taskTypesApi : realTaskTypesApi;
export const workflowsApi: WorkflowsApi = USE_MOCK ? mockApis.workflowsApi : realWorkflowsApi;
export const runsApi: RunsApi = USE_MOCK ? mockApis.runsApi : realRunsApi;

export default apiClient;
