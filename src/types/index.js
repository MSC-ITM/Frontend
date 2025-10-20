// Workflow Types
/**
 * @typedef {Object} Workflow
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string | null} schedule_cron
 * @property {boolean} active
 * @property {string} created_at
 */

/**
 * @typedef {Object} Step
 * @property {string} id
 * @property {string} workflow_id
 * @property {string} node_key
 * @property {string} type
 * @property {Object} params - JSON params
 */

/**
 * @typedef {Object} Edge
 * @property {string} id
 * @property {string} workflow_id
 * @property {string} from_node_key
 * @property {string} to_node_key
 */

// Run Types
/**
 * @typedef {'Pending' | 'Running' | 'Succeeded' | 'Failed' | 'Canceled'} RunState
 */

/**
 * @typedef {Object} Run
 * @property {string} id
 * @property {string} workflow_id
 * @property {RunState} state
 * @property {string | null} started_at
 * @property {string | null} finished_at
 */

/**
 * @typedef {'Pending' | 'Running' | 'Succeeded' | 'Failed' | 'Retry'} TaskState
 */

/**
 * @typedef {Object} TaskInstance
 * @property {string} id
 * @property {string} run_id
 * @property {string} node_key
 * @property {string} type
 * @property {TaskState} state
 * @property {number} try_count
 * @property {number} max_retries
 * @property {string | null} started_at
 * @property {string | null} finished_at
 * @property {string | null} error
 */

// Log Types
/**
 * @typedef {'INFO' | 'WARNING' | 'ERROR' | 'DEBUG'} LogLevel
 */

/**
 * @typedef {Object} LogEntry
 * @property {string} id
 * @property {string} run_id
 * @property {string | null} task_instance_id
 * @property {LogLevel} level
 * @property {string} message
 * @property {string} ts
 */

// Task Type (Catalog)
/**
 * @typedef {Object} TaskType
 * @property {string} type
 * @property {Object} params_schema - JSON Schema
 * @property {string} display_name
 * @property {string} version
 */

// Task Command (for Queue)
/**
 * @typedef {Object} TaskCommand
 * @property {string} run_id
 * @property {string} node_key
 * @property {string} type
 * @property {Object} params
 */

// Task Result
/**
 * @typedef {'SUCCESS' | 'FAILED' | 'RETRY'} TaskResultStatus
 */

/**
 * @typedef {Object} TaskResult
 * @property {TaskResultStatus} status
 * @property {Object | null} output
 * @property {string | null} error
 */

// DTOs for API
/**
 * @typedef {Object} CreateWorkflowDTO
 * @property {string} name
 * @property {string} description
 * @property {Step[]} steps
 * @property {Edge[]} edges
 * @property {string | null} schedule_cron
 */

/**
 * @typedef {Object} WorkflowDetailDTO
 * @property {Workflow} workflow
 * @property {Step[]} steps
 * @property {Edge[]} edges
 */

/**
 * @typedef {Object} RunDetailDTO
 * @property {Run} run
 * @property {TaskInstance[]} tasks
 */

export {};
