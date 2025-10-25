/**
 * Mock data for testing the frontend without a backend
 */

import {
  TaskType,
  Workflow,
  Step,
  Edge,
  Run,
  TaskInstance,
  LogEntry,
  taskTypeSchema,
  workflowSchema,
  stepSchema,
  edgeSchema,
  runSchema,
  taskInstanceSchema,
  logEntrySchema,
  validateOrThrow,
} from '../types/index';

// Task Types Catalog
export const mockTaskTypes: TaskType[] = [
  {
    type: 'http_get',
    display_name: 'Petición HTTP GET',
    version: '1.0.0',
    params_schema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        headers: { type: 'object' },
      },
      required: ['url'],
    },
  },
  {
    type: 'validate_csv',
    display_name: 'Validar Archivo CSV',
    version: '1.0.0',
    params_schema: {
      type: 'object',
      properties: {
        file_path: { type: 'string' },
        columns: { type: 'array' },
        delimiter: { type: 'string' },
      },
      required: ['file_path', 'columns'],
    },
  },
  {
    type: 'transform_simple',
    display_name: 'Transformación Simple',
    version: '1.0.0',
    params_schema: {
      type: 'object',
      properties: {
        operations: { type: 'array' },
      },
      required: ['operations'],
    },
  },
  {
    type: 'save_db',
    display_name: 'Guardar en Base de Datos',
    version: '1.0.0',
    params_schema: {
      type: 'object',
      properties: {
        table: { type: 'string' },
        mode: { type: 'string', enum: ['append', 'replace'] },
      },
      required: ['table'],
    },
  },
  {
    type: 'notify_mock',
    display_name: 'Notificación de Prueba',
    version: '1.0.0',
    params_schema: {
      type: 'object',
      properties: {
        channel: { type: 'string' },
        message: { type: 'string' },
      },
      required: ['channel', 'message'],
    },
  },
];

// Workflows
export const mockWorkflows: Workflow[] = [
  {
    id: 'wf_001',
    name: 'ETL CSV Pipeline',
    description: 'Extract, transform and load CSV data to database',
    schedule_cron: '0 0 * * *',
    active: true,
    created_at: '2025-10-15T10:00:00Z',
  },
  {
    id: 'wf_002',
    name: 'HTTP to Notification',
    description: 'Fetch data from API and send notification',
    schedule_cron: null,
    active: true,
    created_at: '2025-10-16T14:30:00Z',
  },
  {
    id: 'wf_003',
    name: 'Data Validation Pipeline',
    description: 'Validate and process incoming data files',
    schedule_cron: '*/30 * * * *',
    active: false,
    created_at: '2025-10-14T08:15:00Z',
  },
  {
    id: 'wf_004',
    name: '🔴 DEMO: Workflow con Error para Reparar',
    description: '⚠️ Workflow de prueba con ejecución fallida - Click en "Ver Ejecuciones" y selecciona la ejecución FAILED',
    schedule_cron: null,
    active: true,
    created_at: '2025-10-25T02:00:00Z',
  },
];

// Steps for workflows
export const mockSteps: Record<string, Step[]> = {
  wf_001: [
    {
      id: 'step_001',
      workflow_id: 'wf_001',
      node_key: 'fetch_csv',
      type: 'http_get',
      params: {
        url: 'https://example.com/data.csv',
        headers: { 'Accept': 'text/csv' },
      },
    },
    {
      id: 'step_002',
      workflow_id: 'wf_001',
      node_key: 'validate_data',
      type: 'validate_csv',
      params: {
        file_path: '/tmp/data.csv',
        columns: ['id', 'name', 'value'],
        delimiter: ',',
      },
    },
    {
      id: 'step_003',
      workflow_id: 'wf_001',
      node_key: 'transform_data',
      type: 'transform_simple',
      params: {
        operations: ['select id, name', 'filter value > 0'],
      },
    },
    {
      id: 'step_004',
      workflow_id: 'wf_001',
      node_key: 'save_to_db',
      type: 'save_db',
      params: {
        table: 'processed_data',
        mode: 'append',
      },
    },
    {
      id: 'step_005',
      workflow_id: 'wf_001',
      node_key: 'notify_success',
      type: 'notify_mock',
      params: {
        channel: 'slack',
        message: 'ETL pipeline completed successfully',
      },
    },
  ],
  wf_002: [
    {
      id: 'step_006',
      workflow_id: 'wf_002',
      node_key: 'fetch_api',
      type: 'http_get',
      params: {
        url: 'https://api.example.com/status',
        headers: { 'Authorization': 'Bearer token123' },
      },
    },
    {
      id: 'step_007',
      workflow_id: 'wf_002',
      node_key: 'send_notification',
      type: 'notify_mock',
      params: {
        channel: 'email',
        message: 'API status check completed',
      },
    },
  ],
  wf_003: [
    {
      id: 'step_008',
      workflow_id: 'wf_003',
      node_key: 'validate_input',
      type: 'validate_csv',
      params: {
        file_path: '/data/input.csv',
        columns: ['timestamp', 'sensor_id', 'reading'],
        delimiter: ',',
      },
    },
  ],
  wf_004: [
    {
      id: 'step_009',
      workflow_id: 'wf_004',
      node_key: 'fetch_external_api',
      type: 'http_get',
      params: {
        url: 'https://api.slow-endpoint.com/data',
        headers: { 'Content-Type': 'application/json' },
      },
    },
    {
      id: 'step_010',
      workflow_id: 'wf_004',
      node_key: 'validate_csv_file',
      type: 'validate_csv',
      params: {
        file_path: '/uploads/data.csv',
        columns: ['id', 'name', 'email', 'status'],
        delimiter: ',',
      },
    },
    {
      id: 'step_011',
      workflow_id: 'wf_004',
      node_key: 'transform_records',
      type: 'transform_simple',
      params: {
        operations: ['uppercase name', 'validate email'],
      },
    },
    {
      id: 'step_012',
      workflow_id: 'wf_004',
      node_key: 'save_results',
      type: 'save_db',
      params: {
        table: 'integration_results',
        mode: 'overwrite',
      },
    },
  ],
};

// Edges for workflows
export const mockEdges: Record<string, Edge[]> = {
  wf_001: [
    {
      id: 'edge_001',
      workflow_id: 'wf_001',
      from_node_key: 'fetch_csv',
      to_node_key: 'validate_data',
    },
    {
      id: 'edge_002',
      workflow_id: 'wf_001',
      from_node_key: 'validate_data',
      to_node_key: 'transform_data',
    },
    {
      id: 'edge_003',
      workflow_id: 'wf_001',
      from_node_key: 'transform_data',
      to_node_key: 'save_to_db',
    },
    {
      id: 'edge_004',
      workflow_id: 'wf_001',
      from_node_key: 'save_to_db',
      to_node_key: 'notify_success',
    },
  ],
  wf_002: [
    {
      id: 'edge_005',
      workflow_id: 'wf_002',
      from_node_key: 'fetch_api',
      to_node_key: 'send_notification',
    },
  ],
  wf_003: [],
  wf_004: [
    {
      id: 'edge_006',
      workflow_id: 'wf_004',
      from_node_key: 'fetch_external_api',
      to_node_key: 'validate_csv_file',
    },
    {
      id: 'edge_007',
      workflow_id: 'wf_004',
      from_node_key: 'validate_csv_file',
      to_node_key: 'transform_records',
    },
    {
      id: 'edge_008',
      workflow_id: 'wf_004',
      from_node_key: 'transform_records',
      to_node_key: 'save_results',
    },
  ],
};

// Runs
export const mockRuns: Run[] = [
  {
    id: 'run_001',
    workflow_id: 'wf_001',
    state: 'Succeeded',
    started_at: '2025-10-17T10:00:00Z',
    finished_at: '2025-10-17T10:05:23Z',
  },
  {
    id: 'run_002',
    workflow_id: 'wf_001',
    state: 'Running',
    started_at: '2025-10-17T11:00:00Z',
    finished_at: null,
  },
  {
    id: 'run_003',
    workflow_id: 'wf_002',
    state: 'Failed',
    started_at: '2025-10-17T09:30:00Z',
    finished_at: '2025-10-17T09:31:45Z',
  },
  {
    id: 'run_004',
    workflow_id: 'wf_001',
    state: 'Pending',
    started_at: null,
    finished_at: null,
  },
  {
    id: 'run_005',
    workflow_id: 'wf_004',
    state: 'Failed',
    started_at: '2025-10-25T02:00:00Z',
    finished_at: '2025-10-25T02:02:15Z',
  },
];

// Task Instances
export const mockTaskInstances: Record<string, TaskInstance[]> = {
  run_001: [
    {
      id: 'task_001',
      run_id: 'run_001',
      node_key: 'fetch_csv',
      type: 'http_get',
      state: 'Succeeded',
      try_count: 1,
      max_retries: 3,
      started_at: '2025-10-17T10:00:00Z',
      finished_at: '2025-10-17T10:00:45Z',
      error: null,
    },
    {
      id: 'task_002',
      run_id: 'run_001',
      node_key: 'validate_data',
      type: 'validate_csv',
      state: 'Succeeded',
      try_count: 1,
      max_retries: 3,
      started_at: '2025-10-17T10:00:46Z',
      finished_at: '2025-10-17T10:02:10Z',
      error: null,
    },
    {
      id: 'task_003',
      run_id: 'run_001',
      node_key: 'transform_data',
      type: 'transform_simple',
      state: 'Succeeded',
      try_count: 1,
      max_retries: 3,
      started_at: '2025-10-17T10:02:11Z',
      finished_at: '2025-10-17T10:03:30Z',
      error: null,
    },
    {
      id: 'task_004',
      run_id: 'run_001',
      node_key: 'save_to_db',
      type: 'save_db',
      state: 'Succeeded',
      try_count: 1,
      max_retries: 3,
      started_at: '2025-10-17T10:03:31Z',
      finished_at: '2025-10-17T10:05:00Z',
      error: null,
    },
    {
      id: 'task_005',
      run_id: 'run_001',
      node_key: 'notify_success',
      type: 'notify_mock',
      state: 'Succeeded',
      try_count: 1,
      max_retries: 3,
      started_at: '2025-10-17T10:05:01Z',
      finished_at: '2025-10-17T10:05:23Z',
      error: null,
    },
  ],
  run_002: [
    {
      id: 'task_006',
      run_id: 'run_002',
      node_key: 'fetch_csv',
      type: 'http_get',
      state: 'Succeeded',
      try_count: 1,
      max_retries: 3,
      started_at: '2025-10-17T11:00:00Z',
      finished_at: '2025-10-17T11:00:42Z',
      error: null,
    },
    {
      id: 'task_007',
      run_id: 'run_002',
      node_key: 'validate_data',
      type: 'validate_csv',
      state: 'Running',
      try_count: 1,
      max_retries: 3,
      started_at: '2025-10-17T11:00:43Z',
      finished_at: null,
      error: null,
    },
    {
      id: 'task_008',
      run_id: 'run_002',
      node_key: 'transform_data',
      type: 'transform_simple',
      state: 'Pending',
      try_count: 0,
      max_retries: 3,
      started_at: null,
      finished_at: null,
      error: null,
    },
    {
      id: 'task_009',
      run_id: 'run_002',
      node_key: 'save_to_db',
      type: 'save_db',
      state: 'Pending',
      try_count: 0,
      max_retries: 3,
      started_at: null,
      finished_at: null,
      error: null,
    },
    {
      id: 'task_010',
      run_id: 'run_002',
      node_key: 'notify_success',
      type: 'notify_mock',
      state: 'Pending',
      try_count: 0,
      max_retries: 3,
      started_at: null,
      finished_at: null,
      error: null,
    },
  ],
  run_003: [
    {
      id: 'task_011',
      run_id: 'run_003',
      node_key: 'fetch_api',
      type: 'http_get',
      state: 'Failed',
      try_count: 3,
      max_retries: 3,
      started_at: '2025-10-17T09:30:00Z',
      finished_at: '2025-10-17T09:31:45Z',
      error: 'Connection timeout after 3 retries',
    },
    {
      id: 'task_012',
      run_id: 'run_003',
      node_key: 'send_notification',
      type: 'notify_mock',
      state: 'Pending',
      try_count: 0,
      max_retries: 3,
      started_at: null,
      finished_at: null,
      error: null,
    },
  ],
  run_004: [],
  run_005: [
    {
      id: 'task_013',
      run_id: 'run_005',
      node_key: 'fetch_external_api',
      type: 'http_get',
      state: 'Succeeded',
      try_count: 1,
      max_retries: 3,
      started_at: '2025-10-25T02:00:00Z',
      finished_at: '2025-10-25T02:00:45Z',
      error: null,
    },
    {
      id: 'task_014',
      run_id: 'run_005',
      node_key: 'validate_csv_file',
      type: 'validate_csv',
      state: 'Failed',
      try_count: 2,
      max_retries: 3,
      started_at: '2025-10-25T02:00:46Z',
      finished_at: '2025-10-25T02:01:30Z',
      error: 'CSV validation failed: 15% of rows contain invalid data. Strict mode requires 100% valid rows.',
    },
    {
      id: 'task_015',
      run_id: 'run_005',
      node_key: 'transform_records',
      type: 'transform_simple',
      state: 'Pending',
      try_count: 0,
      max_retries: 3,
      started_at: null,
      finished_at: null,
      error: null,
    },
    {
      id: 'task_016',
      run_id: 'run_005',
      node_key: 'save_results',
      type: 'save_db',
      state: 'Pending',
      try_count: 0,
      max_retries: 3,
      started_at: null,
      finished_at: null,
      error: null,
    },
  ],
};

// Logs
export const mockLogs: Record<string, LogEntry[]> = {
  run_001: [
    {
      id: 'log_001',
      run_id: 'run_001',
      task_instance_id: 'task_001',
      level: 'INFO',
      message: 'Starting HTTP GET request to https://example.com/data.csv',
      ts: '2025-10-17T10:00:00Z',
    },
    {
      id: 'log_002',
      run_id: 'run_001',
      task_instance_id: 'task_001',
      level: 'INFO',
      message: 'Received response with status 200',
      ts: '2025-10-17T10:00:40Z',
    },
    {
      id: 'log_003',
      run_id: 'run_001',
      task_instance_id: 'task_001',
      level: 'INFO',
      message: 'Downloaded 1.2MB of CSV data',
      ts: '2025-10-17T10:00:45Z',
    },
    {
      id: 'log_004',
      run_id: 'run_001',
      task_instance_id: 'task_002',
      level: 'INFO',
      message: 'Starting CSV validation',
      ts: '2025-10-17T10:00:46Z',
    },
    {
      id: 'log_005',
      run_id: 'run_001',
      task_instance_id: 'task_002',
      level: 'INFO',
      message: 'Found 1500 rows in CSV file',
      ts: '2025-10-17T10:01:30Z',
    },
    {
      id: 'log_006',
      run_id: 'run_001',
      task_instance_id: 'task_002',
      level: 'INFO',
      message: 'All columns validated successfully',
      ts: '2025-10-17T10:02:10Z',
    },
    {
      id: 'log_007',
      run_id: 'run_001',
      task_instance_id: 'task_003',
      level: 'INFO',
      message: 'Applying transformations',
      ts: '2025-10-17T10:02:11Z',
    },
    {
      id: 'log_008',
      run_id: 'run_001',
      task_instance_id: 'task_003',
      level: 'INFO',
      message: 'Transformation completed: 1450 rows remaining',
      ts: '2025-10-17T10:03:30Z',
    },
    {
      id: 'log_009',
      run_id: 'run_001',
      task_instance_id: 'task_004',
      level: 'INFO',
      message: 'Connecting to database',
      ts: '2025-10-17T10:03:31Z',
    },
    {
      id: 'log_010',
      run_id: 'run_001',
      task_instance_id: 'task_004',
      level: 'INFO',
      message: 'Inserting 1450 rows into table processed_data',
      ts: '2025-10-17T10:03:45Z',
    },
    {
      id: 'log_011',
      run_id: 'run_001',
      task_instance_id: 'task_004',
      level: 'INFO',
      message: 'Database insert completed successfully',
      ts: '2025-10-17T10:05:00Z',
    },
    {
      id: 'log_012',
      run_id: 'run_001',
      task_instance_id: 'task_005',
      level: 'INFO',
      message: 'Sending notification to slack',
      ts: '2025-10-17T10:05:01Z',
    },
    {
      id: 'log_013',
      run_id: 'run_001',
      task_instance_id: 'task_005',
      level: 'INFO',
      message: 'Notification sent successfully',
      ts: '2025-10-17T10:05:23Z',
    },
    {
      id: 'log_014',
      run_id: 'run_001',
      task_instance_id: null,
      level: 'INFO',
      message: 'Workflow completed successfully',
      ts: '2025-10-17T10:05:23Z',
    },
  ],
  run_002: [
    {
      id: 'log_015',
      run_id: 'run_002',
      task_instance_id: 'task_006',
      level: 'INFO',
      message: 'Starting HTTP GET request',
      ts: '2025-10-17T11:00:00Z',
    },
    {
      id: 'log_016',
      run_id: 'run_002',
      task_instance_id: 'task_006',
      level: 'INFO',
      message: 'Request completed successfully',
      ts: '2025-10-17T11:00:42Z',
    },
    {
      id: 'log_017',
      run_id: 'run_002',
      task_instance_id: 'task_007',
      level: 'INFO',
      message: 'Starting CSV validation',
      ts: '2025-10-17T11:00:43Z',
    },
    {
      id: 'log_018',
      run_id: 'run_002',
      task_instance_id: 'task_007',
      level: 'INFO',
      message: 'Processing rows...',
      ts: '2025-10-17T11:01:15Z',
    },
  ],
  run_003: [
    {
      id: 'log_019',
      run_id: 'run_003',
      task_instance_id: 'task_011',
      level: 'INFO',
      message: 'Attempting to connect to API endpoint',
      ts: '2025-10-17T09:30:00Z',
    },
    {
      id: 'log_020',
      run_id: 'run_003',
      task_instance_id: 'task_011',
      level: 'WARNING',
      message: 'Connection timeout, retrying... (attempt 1/3)',
      ts: '2025-10-17T09:30:30Z',
    },
    {
      id: 'log_021',
      run_id: 'run_003',
      task_instance_id: 'task_011',
      level: 'WARNING',
      message: 'Connection timeout, retrying... (attempt 2/3)',
      ts: '2025-10-17T09:31:00Z',
    },
    {
      id: 'log_022',
      run_id: 'run_003',
      task_instance_id: 'task_011',
      level: 'WARNING',
      message: 'Connection timeout, retrying... (attempt 3/3)',
      ts: '2025-10-17T09:31:30Z',
    },
    {
      id: 'log_023',
      run_id: 'run_003',
      task_instance_id: 'task_011',
      level: 'ERROR',
      message: 'Task failed after 3 retries: Connection timeout',
      ts: '2025-10-17T09:31:45Z',
    },
    {
      id: 'log_024',
      run_id: 'run_003',
      task_instance_id: null,
      level: 'ERROR',
      message: 'Workflow failed due to task failure',
      ts: '2025-10-17T09:31:45Z',
    },
  ],
  run_004: [],
  run_005: [
    {
      id: 'log_025',
      run_id: 'run_005',
      task_instance_id: 'task_013',
      level: 'INFO',
      message: 'Starting HTTP GET request to https://api.slow-endpoint.com/data',
      ts: '2025-10-25T02:00:00Z',
    },
    {
      id: 'log_026',
      run_id: 'run_005',
      task_instance_id: 'task_013',
      level: 'INFO',
      message: 'HTTP request completed successfully (200 OK)',
      ts: '2025-10-25T02:00:45Z',
    },
    {
      id: 'log_027',
      run_id: 'run_005',
      task_instance_id: 'task_014',
      level: 'INFO',
      message: 'Starting CSV validation for file /uploads/data.csv',
      ts: '2025-10-25T02:00:46Z',
    },
    {
      id: 'log_028',
      run_id: 'run_005',
      task_instance_id: 'task_014',
      level: 'INFO',
      message: 'Reading CSV file with delimiter ","',
      ts: '2025-10-25T02:00:48Z',
    },
    {
      id: 'log_029',
      run_id: 'run_005',
      task_instance_id: 'task_014',
      level: 'WARNING',
      message: 'Found 150 invalid rows out of 1000 total rows (15%)',
      ts: '2025-10-25T02:01:10Z',
    },
    {
      id: 'log_030',
      run_id: 'run_005',
      task_instance_id: 'task_014',
      level: 'ERROR',
      message: 'Invalid data detected in columns: email (12%), status (3%)',
      ts: '2025-10-25T02:01:15Z',
    },
    {
      id: 'log_031',
      run_id: 'run_005',
      task_instance_id: 'task_014',
      level: 'WARNING',
      message: 'Retrying validation with relaxed constraints (attempt 2/3)',
      ts: '2025-10-25T02:01:20Z',
    },
    {
      id: 'log_032',
      run_id: 'run_005',
      task_instance_id: 'task_014',
      level: 'ERROR',
      message: 'CSV validation failed: 15% of rows contain invalid data. Strict mode requires 100% valid rows.',
      ts: '2025-10-25T02:01:30Z',
    },
    {
      id: 'log_033',
      run_id: 'run_005',
      task_instance_id: null,
      level: 'ERROR',
      message: 'Workflow failed at node "validate_csv_file": validation errors exceed threshold',
      ts: '2025-10-25T02:02:15Z',
    },
  ],
};

// Helper to generate IDs
let nextWorkflowId = 5;
let nextStepId = 13;
let nextEdgeId = 9;
let nextRunId = 6;
let nextTaskId = 17;
let nextLogId = 34;

type IdPrefix = 'wf' | 'step' | 'edge' | 'run' | 'task' | 'log';

export const generateId = (prefix: IdPrefix): string => {
  if (prefix === 'wf') return `wf_${String(nextWorkflowId++).padStart(3, '0')}`;
  if (prefix === 'step') return `step_${String(nextStepId++).padStart(3, '0')}`;
  if (prefix === 'edge') return `edge_${String(nextEdgeId++).padStart(3, '0')}`;
  if (prefix === 'run') return `run_${String(nextRunId++).padStart(3, '0')}`;
  if (prefix === 'task') return `task_${String(nextTaskId++).padStart(3, '0')}`;
  if (prefix === 'log') return `log_${String(nextLogId++).padStart(3, '0')}`;
  return `${prefix}_${Date.now()}`;
};

// Validate mock data on module load (only in development, not in tests)
// Check if running in Vite environment and not in test mode
if (typeof import.meta.env !== 'undefined' && import.meta.env.DEV && !import.meta.env.VITEST) {
  try {
    // Validate task types
    mockTaskTypes.forEach((taskType, index) => {
      validateOrThrow(taskTypeSchema, taskType);
    });

    // Validate workflows
    mockWorkflows.forEach((workflow) => {
      validateOrThrow(workflowSchema, workflow);
    });

    // Validate steps
    Object.values(mockSteps).flat().forEach((step) => {
      validateOrThrow(stepSchema, step);
    });

    // Validate edges
    Object.values(mockEdges).flat().forEach((edge) => {
      validateOrThrow(edgeSchema, edge);
    });

    // Validate runs
    mockRuns.forEach((run) => {
      validateOrThrow(runSchema, run);
    });

    // Validate task instances
    Object.values(mockTaskInstances).flat().forEach((task) => {
      validateOrThrow(taskInstanceSchema, task);
    });

    // Validate logs
    Object.values(mockLogs).flat().forEach((log) => {
      validateOrThrow(logEntrySchema, log);
    });

    console.log('[mockData] All mock data validated successfully');
  } catch (error) {
    console.error('[mockData] Validation error:', error);
  }
}
