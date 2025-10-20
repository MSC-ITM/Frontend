import axios from 'axios';

// Configure base URL - update this when backend is deployed
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || true; // Set to true to use mock data

// Import mock APIs
import * as mockApis from './mockApi';

const apiClient = axios.create({
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

// Task Types API
export const taskTypesApi = USE_MOCK
  ? mockApis.taskTypesApi
  : {
      /**
       * Get all available task types
       * @returns {Promise<import('../types').TaskType[]>}
       */
      getAll: async () => {
        const response = await apiClient.get('/task-types');
        return response.data;
      },
    };

// Workflows API
export const workflowsApi = USE_MOCK
  ? mockApis.workflowsApi
  : {
      /**
       * Get all workflows
       * @returns {Promise<import('../types').Workflow[]>}
       */
      getAll: async () => {
        const response = await apiClient.get('/workflows');
        return response.data;
      },

      /**
       * Get a specific workflow with steps and edges
       * @param {string} id
       * @returns {Promise<import('../types').WorkflowDetailDTO>}
       */
      getById: async (id) => {
        const response = await apiClient.get(`/workflows/${id}`);
        return response.data;
      },

      /**
       * Create a new workflow
       * @param {import('../types').CreateWorkflowDTO} data
       * @returns {Promise<import('../types').Workflow>}
       */
      create: async (data) => {
        const response = await apiClient.post('/workflows', data);
        return response.data;
      },

      /**
       * Update a workflow
       * @param {string} id
       * @param {Partial<import('../types').CreateWorkflowDTO>} data
       * @returns {Promise<import('../types').Workflow>}
       */
      update: async (id, data) => {
        const response = await apiClient.put(`/workflows/${id}`, data);
        return response.data;
      },

      /**
       * Delete a workflow
       * @param {string} id
       * @returns {Promise<void>}
       */
      delete: async (id) => {
        await apiClient.delete(`/workflows/${id}`);
      },

      /**
       * Run a workflow now
       * @param {string} id
       * @returns {Promise<import('../types').Run>}
       */
      runNow: async (id) => {
        const response = await apiClient.post(`/workflows/${id}/runs`);
        return response.data;
      },
    };

// Runs API
export const runsApi = USE_MOCK
  ? mockApis.runsApi
  : {
      /**
       * Get all runs for a workflow
       * @param {string} workflowId
       * @returns {Promise<import('../types').Run[]>}
       */
      getByWorkflow: async (workflowId) => {
        const response = await apiClient.get(`/workflows/${workflowId}/runs`);
        return response.data;
      },

      /**
       * Get run details with tasks
       * @param {string} runId
       * @returns {Promise<import('../types').RunDetailDTO>}
       */
      getById: async (runId) => {
        const response = await apiClient.get(`/runs/${runId}`);
        return response.data;
      },

      /**
       * Get logs for a run
       * @param {string} runId
       * @param {Object} options
       * @param {string} [options.task] - Filter by task node_key
       * @param {number} [options.page] - Page number
       * @param {number} [options.limit] - Items per page
       * @returns {Promise<import('../types').LogEntry[]>}
       */
      getLogs: async (runId, options = {}) => {
        const params = new URLSearchParams();
        if (options.task) params.append('task', options.task);
        if (options.page) params.append('page', options.page.toString());
        if (options.limit) params.append('limit', options.limit.toString());

        const response = await apiClient.get(`/runs/${runId}/logs?${params.toString()}`);
        return response.data;
      },

      /**
       * Cancel a running workflow
       * @param {string} runId
       * @returns {Promise<import('../types').Run>}
       */
      cancel: async (runId) => {
        const response = await apiClient.post(`/runs/${runId}/cancel`);
        return response.data;
      },
    };

export default apiClient;
