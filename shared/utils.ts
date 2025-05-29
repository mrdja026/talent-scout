/**
 * Utility functions for working with workflow data
 */
import { Node, Connection, Workflow } from "./schema";
import { WorkflowExecutionState, NodeExecutionState } from "./workflowExecution";
import { Template } from "./workflowTemplate";

/**
 * Serializes workflow data for storage or transmission
 * @param workflow The workflow to serialize
 * @returns Serialized workflow data
 */
export function serializeWorkflow(workflow: Workflow): string {
  return JSON.stringify(workflow);
}

/**
 * Deserializes workflow data from storage or transmission
 * @param serialized The serialized workflow data
 * @returns Deserialized workflow
 */
export function deserializeWorkflow(serialized: string): Workflow {
  return JSON.parse(serialized);
}

/**
 * Clone a workflow object
 * @param workflow The workflow to clone
 * @returns A deep clone of the workflow
 */
export function cloneWorkflow(workflow: Workflow): Workflow {
  return JSON.parse(JSON.stringify(workflow));
}

/**
 * Creates a new workflow with default values
 * @param name Optional name for the workflow
 * @returns A new workflow object
 */
export function createEmptyWorkflow(name: string = "Untitled Workflow"): Workflow {
  return {
    id: Date.now(),
    name,
    description: "",
    nodes: [],
    connections: [],
    createdBy: 1, // Default user ID
    status: "draft",
    version: "1.0",
    lastSaved: new Date().toISOString()
  };
}

/**
 * Validates workflow connections
 * @param workflow The workflow to validate
 * @returns Array of error messages, empty if valid
 */
export function validateWorkflowConnections(workflow: Workflow): string[] {
  const errors: string[] = [];
  const nodeIds = new Set(workflow.nodes.map(node => node.id));
  
  // Check that connections reference valid nodes
  workflow.connections.forEach(connection => {
    if (!nodeIds.has(connection.source)) {
      errors.push(`Connection ${connection.id} references non-existent source node ${connection.source}`);
    }
    
    if (!nodeIds.has(connection.target)) {
      errors.push(`Connection ${connection.id} references non-existent target node ${connection.target}`);
    }
  });
  
  return errors;
}

/**
 * Extracts a subgraph from a workflow
 * @param workflow Source workflow
 * @param nodeIds IDs of nodes to include in the subgraph
 * @returns Workflow containing only the specified nodes and their connections
 */
export function extractSubgraph(workflow: Workflow, nodeIds: string[]): Workflow {
  const nodeIdSet = new Set(nodeIds);
  
  // Extract nodes
  const nodes = workflow.nodes.filter(node => nodeIdSet.has(node.id));
  
  // Extract connections
  const connections = workflow.connections.filter(
    conn => nodeIdSet.has(conn.source) && nodeIdSet.has(conn.target)
  );
  
  return {
    ...workflow,
    nodes,
    connections,
  };
}

/**
 * Find node by ID in a workflow
 * @param workflow The workflow to search
 * @param nodeId The ID of the node to find
 * @returns The node object or undefined if not found
 */
export function findNodeById(workflow: Workflow, nodeId: string): Node | undefined {
  return workflow.nodes.find(node => node.id === nodeId);
}

/**
 * Find connection by ID in a workflow
 * @param workflow The workflow to search
 * @param connectionId The ID of the connection to find
 * @returns The connection object or undefined if not found
 */
export function findConnectionById(workflow: Workflow, connectionId: string): Connection | undefined {
  return workflow.connections.find(conn => conn.id === connectionId);
}

/**
 * Find all connections for a node
 * @param workflow The workflow to search
 * @param nodeId The ID of the node
 * @param direction 'incoming', 'outgoing', or 'both'
 * @returns Array of connections
 */
export function findNodeConnections(
  workflow: Workflow, 
  nodeId: string, 
  direction: 'incoming' | 'outgoing' | 'both' = 'both'
): Connection[] {
  if (direction === 'incoming') {
    return workflow.connections.filter(conn => conn.target === nodeId);
  }
  
  if (direction === 'outgoing') {
    return workflow.connections.filter(conn => conn.source === nodeId);
  }
  
  return workflow.connections.filter(conn => conn.source === nodeId || conn.target === nodeId);
}

/**
 * Get the execution status of a node
 * @param executionState Current workflow execution state
 * @param nodeId ID of the node to check
 * @returns Node execution status or 'idle' if not found
 */
export function getNodeExecutionStatus(
  executionState: WorkflowExecutionState | undefined, 
  nodeId: string
): NodeExecutionState['status'] {
  if (!executionState || !executionState.nodes[nodeId]) {
    return 'idle';
  }
  
  return executionState.nodes[nodeId].status;
}

/**
 * Count nodes of a specific type in a workflow
 * @param workflow The workflow to analyze
 * @param nodeType The type of node to count
 * @returns Number of nodes of the specified type
 */
export function countNodesByType(workflow: Workflow, nodeType: string): number {
  return workflow.nodes.filter(node => node.type === nodeType).length;
}

/**
 * Get the predecessor nodes for a given node
 * @param workflow The workflow to analyze
 * @param nodeId ID of the node
 * @returns Array of predecessor node IDs
 */
export function getPredecessorNodes(workflow: Workflow, nodeId: string): string[] {
  const incomingConnections = workflow.connections.filter(conn => conn.target === nodeId);
  return [...new Set(incomingConnections.map(conn => conn.source))];
}

/**
 * Get the successor nodes for a given node
 * @param workflow The workflow to analyze
 * @param nodeId ID of the node
 * @returns Array of successor node IDs
 */
export function getSuccessorNodes(workflow: Workflow, nodeId: string): string[] {
  const outgoingConnections = workflow.connections.filter(conn => conn.source === nodeId);
  return [...new Set(outgoingConnections.map(conn => conn.target))];
}

/**
 * Creates a template from a workflow
 * @param workflow Source workflow
 * @param templateName Name for the new template
 * @param description Description for the template
 * @returns Template object
 */
export function createTemplateFromWorkflow(
  workflow: Workflow,
  templateName: string,
  description?: string
): Template {
  return {
    id: `template-${Date.now()}`,
    name: templateName,
    description: description || workflow.description || '',
    category: 'custom',
    tags: [],
    nodes: workflow.nodes,
    connections: workflow.connections,
    creator: workflow.createdBy,
    createdAt: new Date().toISOString(),
    version: workflow.version,
    isPublic: false,
    usageCount: 0
  };
}