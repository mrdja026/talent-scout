import { Node, Connection } from "@shared/schema";

/**
 * Generate a unique ID for nodes and connections
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Check if two nodes can be connected
 */
export function canConnect(sourceNode: Node, targetNode: Node): boolean {
  // Prevent connecting to self
  if (sourceNode.id === targetNode.id) {
    return false;
  }
  
  // Prevent source nodes from having inputs
  if (targetNode.type === 'dataSource') {
    return false;
  }
  
  // Prevent output nodes from having outputs
  if (sourceNode.type === 'output') {
    return false;
  }
  
  return true;
}

/**
 * Find a node in a workflow
 */
export function findNode(nodes: Node[], id: string): Node | undefined {
  return nodes.find(node => node.id === id);
}

/**
 * Find connections for a node
 */
export function findNodeConnections(connections: Connection[], nodeId: string): Connection[] {
  return connections.filter(conn => conn.source === nodeId || conn.target === nodeId);
}

/**
 * Get source nodes connecting to a target node
 */
export function getSourceNodes(nodes: Node[], connections: Connection[], targetId: string): Node[] {
  const sourceIds = connections
    .filter(conn => conn.target === targetId)
    .map(conn => conn.source);
  
  return nodes.filter(node => sourceIds.includes(node.id));
}

/**
 * Get target nodes connected from a source node
 */
export function getTargetNodes(nodes: Node[], connections: Connection[], sourceId: string): Node[] {
  const targetIds = connections
    .filter(conn => conn.source === sourceId)
    .map(conn => conn.target);
  
  return nodes.filter(node => targetIds.includes(node.id));
}

/**
 * Get a nodes that have no incoming connections (start nodes)
 */
export function getStartNodes(nodes: Node[], connections: Connection[]): Node[] {
  const nodesWithIncomingConnections = new Set(
    connections.map(conn => conn.target)
  );
  
  return nodes.filter(node => !nodesWithIncomingConnections.has(node.id));
}

/**
 * Get nodes that have no outgoing connections (end nodes)
 */
export function getEndNodes(nodes: Node[], connections: Connection[]): Node[] {
  const nodesWithOutgoingConnections = new Set(
    connections.map(conn => conn.source)
  );
  
  return nodes.filter(node => !nodesWithOutgoingConnections.has(node.id));
}

/**
 * Calculate the execution order of nodes
 */
export function calculateExecutionOrder(nodes: Node[], connections: Connection[]): Node[] {
  const ordered: Node[] = [];
  const visited = new Set<string>();
  
  function visit(node: Node) {
    if (visited.has(node.id)) {
      return;
    }
    
    visited.add(node.id);
    
    // First visit all source nodes
    const sourceNodes = getSourceNodes(nodes, connections, node.id);
    sourceNodes.forEach(visit);
    
    ordered.push(node);
  }
  
  // Start with nodes that have no incoming connections
  getStartNodes(nodes, connections).forEach(visit);
  
  // Handle any disconnected nodes
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      ordered.push(node);
    }
  });
  
  return ordered;
}
