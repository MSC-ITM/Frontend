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

// Importar APIs simuladas
import * as mockApis from './mockApi';

// Configurar URL base - actualizar esto cuando el backend esté desplegado
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'; // Leer desde .env

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Agregar interceptor de solicitud para adjuntar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Agregar interceptor de respuesta para manejo de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Opciones para getLogs
interface GetLogsOptions {
  task?: string;
  page?: number;
  limit?: number;
}

// Interfaz de API de Tipos de Tarea
interface TaskTypesApi {
  getAll: () => Promise<TaskType[]>;
}

// Interfaz de API de Workflows
interface WorkflowsApi {
  getAll: () => Promise<Workflow[]>;
  getById: (id: string) => Promise<WorkflowDetailDTO>;
  create: (data: CreateWorkflowDTO) => Promise<Workflow>;
  update: (id: string, data: Partial<CreateWorkflowDTO>) => Promise<Workflow>;
  delete: (id: string) => Promise<void>;
  runNow: (id: string) => Promise<Run>;
}

// Interfaz de API de Ejecuciones
interface RunsApi {
  getByWorkflow: (workflowId: string) => Promise<Run[]>;
  getById: (runId: string) => Promise<RunDetailDTO>;
  getLogs: (runId: string, options?: GetLogsOptions) => Promise<LogEntry[]>;
  cancel: (runId: string) => Promise<Run>;
}

// Implementaciones reales de la API (cuando no se usa mock)
const realTaskTypesApi: TaskTypesApi = {
  getAll: async () => {
    const response = await apiClient.get<TaskType[]>('/task-types');
    // Validar datos de respuesta
    return response.data.map((item) => validateOrThrow(taskTypeSchema, item));
  },
};

const realWorkflowsApi: WorkflowsApi = {
  getAll: async () => {
    const response = await apiClient.get<Workflow[]>('/workflows');
    // Validar datos de respuesta
    return response.data.map((item) => validateOrThrow(workflowSchema, item));
  },

  getById: async (id: string) => {
    const response = await apiClient.get<WorkflowDetailDTO>(`/workflows/${id}`);
    // Validar datos de respuesta
    return validateOrThrow(workflowDetailDTOSchema, response.data);
  },

  create: async (data: CreateWorkflowDTO) => {
    const response = await apiClient.post<WorkflowDetailDTO>('/workflows', data);
    // Validar datos de respuesta - El backend devuelve WorkflowDetailDTO
    const workflowDetail = validateOrThrow(workflowDetailDTOSchema, response.data);
    // Devolver solo el objeto workflow para consistencia con otros métodos de la API
    return workflowDetail.workflow;
  },

  update: async (id: string, data: Partial<CreateWorkflowDTO>) => {
    const response = await apiClient.put<WorkflowDetailDTO>(`/workflows/${id}`, data);
    // Validar datos de respuesta - El backend devuelve WorkflowDetailDTO
    const workflowDetail = validateOrThrow(workflowDetailDTOSchema, response.data);
    // Devolver solo el objeto workflow para consistencia con otros métodos de la API
    return workflowDetail.workflow;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/workflows/${id}`);
  },

  runNow: async (id: string) => {
    const response = await apiClient.post<Run>(`/workflows/${id}/runs`);
    // Validar datos de respuesta
    return validateOrThrow(runSchema, response.data);
  },
};

const realRunsApi: RunsApi = {
  getByWorkflow: async (workflowId: string) => {
    const response = await apiClient.get<Run[]>(`/workflows/${workflowId}/runs`);
    // Validar datos de respuesta
    return response.data.map((item) => validateOrThrow(runSchema, item));
  },

  getById: async (runId: string) => {
    const response = await apiClient.get<RunDetailDTO>(`/runs/${runId}`);
    // Validar datos de respuesta
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
    // Validar datos de respuesta
    return response.data.map((item) => validateOrThrow(logEntrySchema, item));
  },

  cancel: async (runId: string) => {
    const response = await apiClient.post<Run>(`/runs/${runId}/cancel`);
    // Validar datos de respuesta
    return validateOrThrow(runSchema, response.data);
  },
};

// Exportar APIs basándose en la bandera USE_MOCK
export const taskTypesApi: TaskTypesApi = USE_MOCK ? mockApis.taskTypesApi : realTaskTypesApi;
export const workflowsApi: WorkflowsApi = USE_MOCK ? mockApis.workflowsApi : realWorkflowsApi;
export const runsApi: RunsApi = USE_MOCK ? mockApis.runsApi : realRunsApi;

export default apiClient;
