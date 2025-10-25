import { z } from 'zod';

// ============================================
// Base Schemas
// ============================================

// Run State
export const runStateSchema = z.enum(['Pending', 'Running', 'Succeeded', 'Failed', 'Canceled']);
export type RunState = z.infer<typeof runStateSchema>;

// Task State
export const taskStateSchema = z.enum(['Pending', 'Running', 'Succeeded', 'Failed', 'Retry']);
export type TaskState = z.infer<typeof taskStateSchema>;

// Log Level
export const logLevelSchema = z.enum(['INFO', 'WARNING', 'ERROR', 'DEBUG']);
export type LogLevel = z.infer<typeof logLevelSchema>;

// Task Result Status
export const taskResultStatusSchema = z.enum(['SUCCESS', 'FAILED', 'RETRY']);
export type TaskResultStatus = z.infer<typeof taskResultStatusSchema>;

// ============================================
// Workflow Schemas
// ============================================

export const workflowSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'El nombre es requerido').max(200),
  description: z.string().max(1000),
  schedule_cron: z.string().nullable(),
  active: z.boolean(),
  created_at: z.string(),
});
export type Workflow = z.infer<typeof workflowSchema>;

export const stepSchema = z.object({
  id: z.string().min(1),
  workflow_id: z.string().min(1),
  node_key: z.string().min(1),
  type: z.string().min(1),
  params: z.record(z.string(), z.unknown()), // JSON params - flexible object
});
export type Step = z.infer<typeof stepSchema>;

export const edgeSchema = z.object({
  id: z.string().min(1),
  workflow_id: z.string().min(1),
  from_node_key: z.string().min(1),
  to_node_key: z.string().min(1),
});
export type Edge = z.infer<typeof edgeSchema>;

// ============================================
// Run Schemas
// ============================================

export const runSchema = z.object({
  id: z.string().min(1),
  workflow_id: z.string().min(1),
  state: runStateSchema,
  started_at: z.string().nullable(),
  finished_at: z.string().nullable(),
});
export type Run = z.infer<typeof runSchema>;

export const taskInstanceSchema = z.object({
  id: z.string().min(1),
  run_id: z.string().min(1),
  node_key: z.string().min(1),
  type: z.string().min(1),
  state: taskStateSchema,
  try_count: z.number().int().min(0),
  max_retries: z.number().int().min(0),
  started_at: z.string().nullable(),
  finished_at: z.string().nullable(),
  error: z.string().nullable(),
});
export type TaskInstance = z.infer<typeof taskInstanceSchema>;

// ============================================
// Log Schemas
// ============================================

export const logEntrySchema = z.object({
  id: z.string().min(1),
  run_id: z.string().min(1),
  task_instance_id: z.string().min(1).nullable(),
  level: logLevelSchema,
  message: z.string(),
  ts: z.string(),
});
export type LogEntry = z.infer<typeof logEntrySchema>;

// ============================================
// Task Type (Catalog) Schemas
// ============================================

export const taskTypeSchema = z.object({
  type: z.string().min(1),
  params_schema: z.record(z.string(), z.unknown()), // JSON Schema - flexible object
  display_name: z.string().min(1),
  version: z.string(),
});
export type TaskType = z.infer<typeof taskTypeSchema>;

// ============================================
// Task Command & Result Schemas
// ============================================

export const taskCommandSchema = z.object({
  run_id: z.string().uuid(),
  node_key: z.string().min(1),
  type: z.string().min(1),
  params: z.record(z.string(), z.unknown()),
});
export type TaskCommand = z.infer<typeof taskCommandSchema>;

export const taskResultSchema = z.object({
  status: taskResultStatusSchema,
  output: z.record(z.string(), z.unknown()).nullable(),
  error: z.string().nullable(),
});
export type TaskResult = z.infer<typeof taskResultSchema>;

// ============================================
// DTOs for API
// ============================================

export const createWorkflowDTOSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  description: z.string().max(1000).default(''),
  steps: z.array(stepSchema.omit({ id: true, workflow_id: true })),
  edges: z.array(edgeSchema.omit({ id: true, workflow_id: true })),
  schedule_cron: z.string().nullable().optional(),
});
export type CreateWorkflowDTO = z.infer<typeof createWorkflowDTOSchema>;

export const workflowDetailDTOSchema = z.object({
  workflow: workflowSchema,
  steps: z.array(stepSchema),
  edges: z.array(edgeSchema),
});
export type WorkflowDetailDTO = z.infer<typeof workflowDetailDTOSchema>;

export const runDetailDTOSchema = z.object({
  run: runSchema,
  tasks: z.array(taskInstanceSchema),
});
export type RunDetailDTO = z.infer<typeof runDetailDTOSchema>;

// ============================================
// Auth Schemas
// ============================================

export const loginCredentialsSchema = z.object({
  username: z.string().min(1, 'El usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});
export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;

export const userSchema = z.object({
  id: z.string().min(1),
  username: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  initials: z.string().optional(),
});
export type User = z.infer<typeof userSchema>;

export const authResponseSchema = z.object({
  token: z.string(),
  user: userSchema,
});
export type AuthResponse = z.infer<typeof authResponseSchema>;

// ============================================
// Theme Types (no need validation, just types)
// ============================================

export type Theme = 'light' | 'dark';

// ============================================
// AI Module Types
// ============================================

export const aiActionTypeSchema = z.enum(['optimize', 'repair', 'predict']);
export type AIActionType = z.infer<typeof aiActionTypeSchema>;

export const aiOptimizationResultSchema = z.object({
  canOptimize: z.boolean(),
  message: z.string(),
  optimizedSteps: z.array(stepSchema).optional(),
  optimizedEdges: z.array(edgeSchema).optional(),
  suggestions: z.array(z.string()).optional(),
});
export type AIOptimizationResult = z.infer<typeof aiOptimizationResultSchema>;

export const aiRepairResultSchema = z.object({
  canRepair: z.boolean(),
  message: z.string(),
  repairedSteps: z.array(stepSchema).optional(),
  repairedEdges: z.array(edgeSchema).optional(),
  fixedIssues: z.array(z.string()).optional(),
});
export type AIRepairResult = z.infer<typeof aiRepairResultSchema>;

export const aiPredictionResultSchema = z.object({
  estimatedDuration: z.number(), // en segundos
  estimatedSuccessRate: z.number(), // 0-100
  costLevel: z.enum(['bajo', 'medio', 'alto']),
  potentialIssues: z.array(z.string()),
  recommendations: z.array(z.string()),
});
export type AIPredictionResult = z.infer<typeof aiPredictionResultSchema>;

// ============================================
// Validation Helper Functions
// ============================================

/**
 * Validates data against a Zod schema and returns validated data or throws
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Validates data and returns success/error result
 */
export function validateSafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * Gets user-friendly error messages from Zod validation errors
 */
export function getValidationErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  error.issues.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  return errors;
}
