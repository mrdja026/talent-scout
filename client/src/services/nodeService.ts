/**
 * Service for interacting with node API endpoints
 */
import { apiRequest } from './api';

/**
 * Get all available node types
 * @returns List of node types
 */
export async function getNodeTypes() {
  return apiRequest('/node-types');
}

/**
 * Execute a specific node
 * @param nodeId ID of the node
 * @param workflowId ID of the workflow
 * @param nodeData Data for node execution
 * @returns Execution result
 */
export async function executeNode(nodeId: string, workflowId: string | number, nodeData: any) {
  return apiRequest(`/workflows/${workflowId}/nodes/${nodeId}/execute`, {
    method: 'POST',
    body: JSON.stringify(nodeData),
  });
}

/**
 * Get the status of a node
 * @param nodeId ID of the node
 * @param workflowId ID of the workflow
 * @returns Node status
 */
export async function getNodeStatus(nodeId: string, workflowId: string | number) {
  return apiRequest(`/workflows/${workflowId}/nodes/${nodeId}/status`);
}