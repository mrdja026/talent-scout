/**
 * Service for interacting with workflow API endpoints
 */
import { apiRequest } from './api';

/**
 * Get all workflows
 * @returns List of workflows
 */
export async function getWorkflows() {
  return apiRequest('/workflows');
}

/**
 * Get a specific workflow
 * @param workflowId ID of the workflow
 * @returns Workflow data
 */
export async function getWorkflow(workflowId: string | number) {
  return apiRequest(`/workflows/${workflowId}`);
}

/**
 * Create a new workflow
 * @param workflowData Workflow data
 * @returns Created workflow
 */
export async function createWorkflow(workflowData: any) {
  return apiRequest('/workflows', {
    method: 'POST',
    body: JSON.stringify(workflowData),
  });
}

/**
 * Update a workflow
 * @param workflowId ID of the workflow
 * @param workflowData Updated workflow data
 * @returns Updated workflow
 */
export async function updateWorkflow(workflowId: string | number, workflowData: any) {
  return apiRequest(`/workflows/${workflowId}`, {
    method: 'PUT',
    body: JSON.stringify(workflowData),
  });
}

/**
 * Delete a workflow
 * @param workflowId ID of the workflow
 * @returns Deletion status
 */
export async function deleteWorkflow(workflowId: string | number) {
  return apiRequest(`/workflows/${workflowId}`, {
    method: 'DELETE',
  });
}

/**
 * Execute a workflow
 * @param workflowId ID of the workflow
 * @param executionData Optional execution parameters
 * @returns Execution status
 */
export async function executeWorkflow(workflowId: string | number, executionData?: any) {
  return apiRequest(`/workflows/${workflowId}/execute`, {
    method: 'POST',
    body: executionData ? JSON.stringify(executionData) : undefined,
  });
}

/**
 * Add a connection between nodes in a workflow
 * @param workflowId ID of the workflow
 * @param connectionData Connection data
 * @returns Created connection
 */
export async function addConnection(workflowId: string | number, connectionData: any) {
  return apiRequest(`/workflows/${workflowId}/connections`, {
    method: 'POST',
    body: JSON.stringify(connectionData),
  });
}

/**
 * Remove a connection between nodes in a workflow
 * @param workflowId ID of the workflow
 * @param connectionId ID of the connection
 * @returns Deletion status
 */
export async function removeConnection(workflowId: string | number, connectionId: string) {
  return apiRequest(`/workflows/${workflowId}/connections/${connectionId}`, {
    method: 'DELETE',
  });
}