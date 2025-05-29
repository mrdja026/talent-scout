/**
 * Definitions for workflow execution state and tracking
 */
import { z } from "zod";

/**
 * Node execution status
 */
export const NodeExecutionStatus = z.enum([
  "idle",      // Not yet started
  "pending",   // Waiting for upstream nodes
  "running",   // Currently executing
  "waiting",   // Waiting for manual input
  "succeeded", // Successfully completed
  "failed",    // Failed to execute
  "skipped"    // Skipped due to conditional branch
]);

export type NodeExecutionStatus = z.infer<typeof NodeExecutionStatus>;

/**
 * Workflow execution status
 */
export const WorkflowExecutionStatus = z.enum([
  "created",   // Execution created but not started
  "running",   // Workflow is currently executing
  "paused",    // Execution is paused
  "waiting",   // Waiting for manual input
  "succeeded", // Successfully completed
  "failed",    // Failed to execute
  "canceled"   // Canceled by user
]);

export type WorkflowExecutionStatus = z.infer<typeof WorkflowExecutionStatus>;

/**
 * Node execution state
 */
export const nodeExecutionStateSchema = z.object({
  nodeId: z.string(),
  status: NodeExecutionStatus,
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  duration: z.number().optional(),
  error: z.string().optional(),
  output: z.any().optional(),
  metrics: z.record(z.any()).optional()
});

export type NodeExecutionState = z.infer<typeof nodeExecutionStateSchema>;

/**
 * Connection execution state
 */
export const connectionExecutionStateSchema = z.object({
  connectionId: z.string(),
  status: z.enum(["idle", "active", "completed", "failed"]),
  data: z.any().optional(),
  timestamp: z.string().optional()
});

export type ConnectionExecutionState = z.infer<typeof connectionExecutionStateSchema>;

/**
 * Workflow execution state
 */
export const workflowExecutionStateSchema = z.object({
  executionId: z.string(),
  workflowId: z.string().or(z.number()),
  status: WorkflowExecutionStatus,
  startTime: z.string(),
  endTime: z.string().optional(),
  nodes: z.record(nodeExecutionStateSchema),
  connections: z.record(connectionExecutionStateSchema).optional(),
  currentNodeId: z.string().optional(),
  variables: z.record(z.any()).optional(),
  inputs: z.record(z.any()).optional(),
  outputs: z.record(z.any()).optional(),
  error: z.string().optional(),
  logs: z.array(z.object({
    timestamp: z.string(),
    level: z.enum(["info", "warning", "error", "debug"]),
    message: z.string(),
    nodeId: z.string().optional(),
    data: z.any().optional()
  })).optional()
});

export type WorkflowExecutionState = z.infer<typeof workflowExecutionStateSchema>;

/**
 * Manual input schema
 */
export const manualInputSchema = z.object({
  nodeId: z.string(),
  executionId: z.string(),
  input: z.any(),
  timestamp: z.string(),
  userId: z.string().or(z.number()).optional(),
  comments: z.string().optional()
});

export type ManualInput = z.infer<typeof manualInputSchema>;