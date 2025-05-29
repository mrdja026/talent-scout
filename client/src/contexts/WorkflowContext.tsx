import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Node, Connection } from "@shared/schema";
import { generateId } from "@/lib/workflowUtils";

// Node execution states
export type NodeExecutionState = "idle" | "running" | "complete" | "error" | "waiting" | "processing";

// Interface for tracking node execution status
interface NodeExecution {
  nodeId: string;
  state: NodeExecutionState;
  startTime?: number;
  endTime?: number;
  input?: any;     // Data passed into the node
  output?: any;    // Data produced by the node
  error?: string;
  
  // Additional fields for async operation tracking
  estimatedCompletionTime?: number;   // Estimated timestamp for completion
  processingProgress?: number;        // Progress percentage (0-100)
  processingMessage?: string;         // Status message for display
  dependencies?: string[];            // Node IDs this execution depends on
  processingComplete?: boolean;       // Flag to indicate when processing is complete but before node is marked as completed
  executionId?: string;               // Unique ID for this execution instance
}

// Workflow execution states
export type WorkflowExecutionState = "idle" | "running" | "complete" | "error" | "paused";

interface WorkflowContextProps {
  nodes: Node[];
  connections: Connection[];
  selectedNode: Node | null;
  systemStatus: {
    apiConnected: boolean;
    modelsLoaded: number;
    mockMode: boolean;
  };
  workflowMeta: {
    version: string;
    status: string;
    lastSaved: string | null;
  };
  executionState: {
    workflowState: WorkflowExecutionState;
    nodeStates: Record<string, NodeExecutionState>;
    activeNodes: string[];
    startTime?: number;
    endTime?: number;
    nodeExecutions: NodeExecution[];
    dataFlow: Record<string, any>; // Connection ID -> data flowing through
  };
  addNode: (node: Omit<Node, "id">) => Node;
  updateNode: (id: string, updates: Partial<Node>) => void;
  removeNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  addConnection: (sourceId: string, targetId: string, sourcePort?: string, targetPort?: string, sourcePortIndex?: number, targetPortIndex?: number) => void;
  removeConnection: (id: string) => void;
  loadWorkflow: (nodes: Node[], connections: Connection[]) => void;
  clearWorkflow: () => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  saveWorkflow: () => Promise<void>;
  // Execution control functions
  runWorkflow: () => void;
  stopWorkflow: () => void;
  pauseWorkflow: () => void;
  resumeWorkflow: () => void;
  // Manual node control
  approveManualStep: (nodeId: string, data?: any) => void;
  rejectManualStep: (nodeId: string, reason?: string) => void;
}

// Create a default context with empty implementations
const defaultContext: WorkflowContextProps = {
  nodes: [],
  connections: [],
  selectedNode: null,
  systemStatus: {
    apiConnected: false,
    modelsLoaded: 0,
    mockMode: true,
  },
  workflowMeta: {
    version: "0.1",
    status: "Draft",
    lastSaved: null,
  },
  executionState: {
    workflowState: "idle",
    nodeStates: {},
    activeNodes: [],
    nodeExecutions: [],
    dataFlow: {},
  },
  addNode: () => ({ id: "", type: "", position: { x: 0, y: 0 }, data: {} }),
  updateNode: () => {},
  removeNode: () => {},
  selectNode: () => {},
  addConnection: () => {}, // Implementation comes from the WorkflowProvider
  removeConnection: () => {},
  updateNodePosition: () => {},
  saveWorkflow: () => Promise.resolve(),
  // Workflow template functions
  loadWorkflow: () => {},
  clearWorkflow: () => {},
  // Execution control functions
  runWorkflow: () => {},
  stopWorkflow: () => {},
  pauseWorkflow: () => {},
  resumeWorkflow: () => {},
  // Manual node control
  approveManualStep: () => {},
  rejectManualStep: () => {},
};

const WorkflowContext = createContext<WorkflowContextProps>(defaultContext);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  
  // Execution state for workflow
  const [executionState, setExecutionState] = useState<WorkflowContextProps["executionState"]>({
    workflowState: "idle",
    nodeStates: {},
    activeNodes: [],
    nodeExecutions: [],
    dataFlow: {},
  });
  
  const [systemStatus, setSystemStatus] = useState({
    apiConnected: true,
    modelsLoaded: 3,
    mockMode: true,
  });
  const [workflowMeta, setWorkflowMeta] = useState({
    version: "0.1",
    status: "Draft",
    lastSaved: null as string | null,
  });

  const addNode = useCallback((nodeData: Omit<Node, "id">) => {
    const newNode = {
      id: generateId(),
      ...nodeData,
    };
    setNodes((prev) => [...prev, newNode]);
    return newNode;
  }, []);

  const updateNode = useCallback((id: string, updates: Partial<Node>) => {
    setNodes((prev) => 
      prev.map((node) => (node.id === id ? { ...node, ...updates } : node))
    );
    
    if (selectedNode?.id === id) {
      setSelectedNode((prev) => prev ? { ...prev, ...updates } : null);
    }
  }, [selectedNode]);

  const removeNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== id));
    setConnections((prev) => 
      prev.filter((conn) => conn.source !== id && conn.target !== id)
    );
    
    if (selectedNode?.id === id) {
      setSelectedNode(null);
    }
  }, [selectedNode]);

  const selectNode = useCallback((id: string | null) => {
    if (id === null) {
      setSelectedNode(null);
      return;
    }
    
    const node = nodes.find((n) => n.id === id) || null;
    setSelectedNode(node);
  }, [nodes]);

  const addConnection = useCallback((
    sourceId: string, 
    targetId: string, 
    sourcePort?: string, 
    targetPort?: string, 
    sourcePortIndex: number = 0, 
    targetPortIndex: number = 0
  ) => {
    // Check if these nodes exist
    const sourceNode = nodes.find(n => n.id === sourceId);
    const targetNode = nodes.find(n => n.id === targetId);
    
    if (!sourceNode || !targetNode) {
      console.error("Cannot create connection: nodes not found", { sourceId, targetId });
      return;
    }
    
    // Prevent duplicate connections between the same ports
    const connectionExists = connections.some(
      conn => conn.source === sourceId && 
              conn.target === targetId && 
              conn.sourcePortIndex === sourcePortIndex && 
              conn.targetPortIndex === targetPortIndex
    );
    
    if (connectionExists) {
      console.log("Connection already exists", { sourceId, targetId });
      return;
    }
    
    // Create the new connection with port information
    const newConnection = {
      id: generateId(),
      source: sourceId,
      target: targetId,
      sourcePort: sourcePort || "",
      targetPort: targetPort || "",
      sourcePortIndex: sourcePortIndex,
      targetPortIndex: targetPortIndex
    };
    
    console.log("Creating new connection:", newConnection);
    setConnections((prev) => [...prev, newConnection]);
    
    // Also update the node data to include connection information
    const sourceNodeType = sourceNode.type;
    const targetNodeType = targetNode.type;
    
    // Get port labels from node configurations
    const sourcePortLabel = sourcePort || "output";
    const targetPortLabel = targetPort || "input";
    
    // Convert all values to strings to avoid React rendering issues
    const targetNodeStr = String(targetNode.data?.label || targetNodeType);
    const sourceNodeStr = String(sourceNode.data?.label || sourceNodeType);
    const sourcePortStr = String(sourcePortLabel);
    const targetPortStr = String(targetPortLabel);
    
    // Update source node to include output connection
    const updatedSourceNodeData = {
      ...sourceNode.data,
      connected: true,
      outputConnections: [
        ...(sourceNode.data?.outputConnections || []),
        {
          targetNode: targetNodeStr,
          sourcePort: sourcePortStr,
          targetPort: targetPortStr
        }
      ]
    };
    
    // Update target node to include input connection
    const updatedTargetNodeData = {
      ...targetNode.data,
      connected: true,
      inputConnections: [
        ...(targetNode.data?.inputConnections || []),
        {
          sourceNode: sourceNodeStr,
          sourcePort: sourcePortStr,
          targetPort: targetPortStr
        }
      ]
    };
    
    // Update both nodes with new connection data
    updateNode(sourceId, { data: updatedSourceNodeData });
    updateNode(targetId, { data: updatedTargetNodeData });
    
  }, [nodes, connections, updateNode]);

  const removeConnection = useCallback((id: string) => {
    setConnections((prev) => prev.filter((conn) => conn.id !== id));
  }, []);

  const updateNodePosition = useCallback((id: string, position: { x: number; y: number }) => {
    setNodes((prev) => 
      prev.map((node) => (node.id === id ? { ...node, position } : node))
    );
  }, []);

  const saveWorkflow = useCallback(async () => {
    try {
      // This would call the API to save the workflow
      const now = new Date().toISOString();
      setWorkflowMeta((prev) => ({
        ...prev,
        lastSaved: now,
      }));
      // In a real implementation, we would call the API here
      return Promise.resolve();
    } catch (error) {
      console.error("Failed to save workflow:", error);
      return Promise.reject(error);
    }
  }, [nodes, connections]);
  
  // Find starting nodes that have no incoming connections
  const findStartingNodes = useCallback(() => {
    const nodesWithIncomingConnections = new Set(
      connections.map(conn => conn.target)
    );
    return nodes.filter(node => !nodesWithIncomingConnections.has(node.id));
  }, [nodes, connections]);
  
  // Get all nodes connected to the given node
  const getConnectedNodes = useCallback((nodeId: string) => {
    // Find all connections from this node
    const outConnections = connections.filter(conn => conn.source === nodeId);
    console.log(`Finding connections from node ${nodeId}. Found ${outConnections.length} connections:`, outConnections);
    
    // Get the connected nodes, with better error checking
    const connectedNodes = outConnections.map(conn => {
      const targetNode = nodes.find(n => n.id === conn.target);
      if (!targetNode) {
        console.warn(`Target node ${conn.target} not found for connection ${conn.id}`);
        return null;
      }
      // Log entity information for debugging 
      if (targetNode.data?.entityType || targetNode.type.includes('agent') || targetNode.type.includes('model') || targetNode.type.includes('dataSource')) {
        console.log(`Found entity-based node: ${targetNode.id}, type: ${targetNode.type}, entityType: ${targetNode.data?.entityType}`);
      }
      return targetNode;
    }).filter(Boolean) as Node[];
    
    console.log(`Found ${connectedNodes.length} connected nodes for ${nodeId}:`, connectedNodes);
    return connectedNodes;
  }, [nodes, connections]);
  
  // Check if a node type is asynchronous and takes longer to process
  const isAsyncNodeType = useCallback((nodeType: string): boolean => {
    return nodeType === "agent" || nodeType === "llm" || 
           nodeType.includes("agent") || nodeType.includes("model");
  }, []);
  
  // Get source nodes that feed into a target node
  const getNodeDependencies = useCallback((nodeId: string): string[] => {
    // Find all connections targeting this node
    const incomingConnections = connections.filter(conn => conn.target === nodeId);
    
    // Get the source nodes of these connections
    return incomingConnections.map(conn => conn.source);
  }, [connections]);
  
  // Check if a node has async dependencies that are still processing
  const hasProcessingDependencies = useCallback((nodeId: string): boolean => {
    const dependencies = getNodeDependencies(nodeId);
    
    // Check if any dependency is still in 'processing' state
    return dependencies.some(depId => {
      const state = executionState.nodeStates[depId];
      return state === "processing";
    });
  }, [executionState.nodeStates, getNodeDependencies]);
  
  // Get the list of processing dependencies for a node
  const getProcessingDependencies = useCallback((nodeId: string): string[] => {
    const dependencies = getNodeDependencies(nodeId);
    
    // Filter to only dependencies that are still processing
    return dependencies.filter(depId => {
      const state = executionState.nodeStates[depId];
      return state === "processing";
    });
  }, [executionState.nodeStates, getNodeDependencies]);
  
  // Node execution with enhanced async handling for AI and LLM nodes
  const executeNode = useCallback((nodeId: string, inputData: any = {}) => {
    return new Promise<any>((resolve, reject) => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) {
        reject(new Error(`Node ${nodeId} not found`));
        return;
      }
      
      // Check if this node has inputs from AI agents or LLM models that are still processing
      const incomingConnections = connections.filter(conn => conn.target === nodeId);
      const dependsOnAsyncNodes = incomingConnections.some(conn => {
        const sourceNode = nodes.find(n => n.id === conn.source);
        if (!sourceNode) return false;
        
        // Check if the source node is an AI agent or LLM model
        const isAsyncSource = sourceNode.type === "agent" || 
                            sourceNode.type === "llm" || 
                            sourceNode.type.includes("agent") || 
                            sourceNode.type.includes("model");
                            
        // Check if this async source is still processing
        const sourceState = executionState.nodeStates[conn.source];
        return isAsyncSource && (sourceState === "processing" || sourceState === "running");
      });
      
      // If node depends on async operations that haven't completed, mark as waiting
      if (dependsOnAsyncNodes) {
        console.log(`Node ${nodeId} is waiting for async operations to complete`);
        
        // Update state to waiting
        setExecutionState(prev => ({
          ...prev,
          nodeStates: {
            ...prev.nodeStates,
            [nodeId]: "waiting"
          },
          nodeExecutions: [
            ...prev.nodeExecutions,
            {
              nodeId,
              state: "waiting",
              startTime: Date.now(),
              input: inputData,
              processingMessage: "Waiting for AI/LLM operations to complete"
            }
          ]
        }));
        
        // Node will be executed when its dependencies complete
        return;
      }
      
      // Determine if this is an AI agent or LLM model node (async node)
      const isAsyncNode = node.type === "agent" || 
                         node.type === "llm" || 
                         node.type.includes("agent") || 
                         node.type.includes("model");
      
      // Mark node as running or processing based on type
      setExecutionState(prev => ({
        ...prev,
        nodeStates: {
          ...prev.nodeStates,
          [nodeId]: isAsyncNode ? "processing" : "running"
        },
        activeNodes: [...prev.activeNodes, nodeId]
      }));
      
      // For manual step nodes, we just mark them as waiting
      if (node.type === "manualStep" || node.type === "fileUpload") {
        setExecutionState(prev => ({
          ...prev,
          nodeStates: {
            ...prev.nodeStates,
            [nodeId]: "waiting"
          }
        }));
        
        // Don't resolve yet - will be resolved when user takes action
        return;
      }
      
      // Get execution time based on node type - longer for AI and LLM nodes
      const getExecutionTime = () => {
        if (node.type === "agent" || node.type.includes("agent")) {
          // Return a random time between 5-15 seconds for agent nodes
          return Math.floor(Math.random() * 10000) + 5000;
        } 
        else if (node.type === "llm" || node.type === "modelRunner" || node.type.includes("model")) {
          // Return a random time between 3-12 seconds for LLM/model nodes
          return Math.floor(Math.random() * 9000) + 3000;
        }
        else {
          return 1000; // Default execution time for other nodes
        }
      };
      
      // Get the appropriate execution time
      const executionTime = getExecutionTime();
      
      // For async nodes (AI agents, LLM models), add progress tracking
      if (isAsyncNode) {
        // Record the execution start with estimated completion time
        const startTime = Date.now();
        const estimatedCompletionTime = startTime + executionTime;
        
        setExecutionState(prev => ({
          ...prev,
          nodeExecutions: [
            ...prev.nodeExecutions,
            {
              nodeId,
              state: "processing",
              startTime,
              input: inputData,
              estimatedCompletionTime,
              processingProgress: 0,
              processingMessage: `Starting ${node.type} processing...`
            }
          ]
        }));
        
        // Start progress updates
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 5;
          if (progress >= 95) {
            clearInterval(progressInterval);
            return;
          }
          
          // Update execution state with progress
          setExecutionState(prev => ({
            ...prev,
            nodeExecutions: prev.nodeExecutions.map(exec => 
              exec.nodeId === nodeId
                ? { 
                    ...exec, 
                    processingProgress: progress,
                    processingMessage: `Processing ${node.type} operation: ${progress}% complete`
                  }
                : exec
            )
          }));
        }, executionTime / 20); // Update progress ~ 20 times during execution
      }
      
      setTimeout(() => {
        // Generate some mock output based on node type
        let output: any;
        
        // Check if this is an entity-based node
        const isEntityNode = node.data?.entityType || 
                            node.type.includes('agent') || 
                            node.type.includes('model') || 
                            node.type.includes('dataSource');
        
        if (isEntityNode) {
          console.log(`Executing entity-based node: ${nodeId}, type: ${node.type}, entityData:`, node.data);
          
          // Handle entities based on their type
          if (node.data?.entityType === 'agent' || node.type.includes('agent')) {
            output = {
              response: `Agent response for "${inputData?.query || 'default query'}"`,
              agentId: node.data?.entityId,
              agentName: node.data?.label || 'Unknown Agent',
              reasoning: "I analyzed the input and produced this response based on my capabilities.",
              timestamp: new Date().toISOString()
            };
          } 
          else if (node.data?.entityType === 'model' || node.type.includes('model') || node.type === 'modelRunner') {
            output = { 
              completion: `Model response for input: ${JSON.stringify(inputData).substring(0, 50)}`,
              modelId: node.data?.entityId,
              modelName: node.data?.label || 'Unknown Model',
              tokens: 150,
              timestamp: new Date().toISOString()
            };
          }
          else if (node.data?.entityType === 'connector' || node.type.includes('dataSource')) {
            output = { 
              data: [{ id: 1, name: "Data from connector" }],
              connectorId: node.data?.entityId,
              connectorName: node.data?.label || 'Unknown Connector',
              metadata: { count: 1, source: node.data?.label || "connector" },
              timestamp: new Date().toISOString()
            };
          }
          else {
            // Generic entity handling
            output = {
              result: `Processed by entity ${node.data?.label || node.type}`,
              entityType: node.data?.entityType,
              entityId: node.data?.entityId,
              timestamp: new Date().toISOString()
            };
          }
        } 
        else {
          // Regular node execution
          switch(node.type) {
            case "modelRunner":
              output = { 
                completion: "This is a simulated model response based on the input: " + 
                          JSON.stringify(inputData).substring(0, 50),
                tokens: 150
              };
              break;
            case "dataSource":
              output = { 
                data: [{ id: 1, name: "Sample data item" }],
                metadata: { count: 1, source: "mock" } 
              };
              break;
            case "transform":
              output = { 
                transformedData: { 
                  processed: true, 
                  original: inputData,
                  result: "Transformed data" 
                }
              };
              break;
            default:
              output = { 
                result: `Processed by ${node.type} node`,
                timestamp: new Date().toISOString()
              };
          }
        }
        
        // Mark node as complete with output
        setExecutionState(prev => {
          const nodeExecution: NodeExecution = {
            nodeId,
            state: "complete",
            startTime: Date.now() - executionTime,
            endTime: Date.now(),
            output
          };
          
          return {
            ...prev,
            nodeStates: {
              ...prev.nodeStates,
              [nodeId]: "complete"
            },
            activeNodes: prev.activeNodes.filter(id => id !== nodeId),
            nodeExecutions: [...prev.nodeExecutions, nodeExecution]
          };
        });
        
        resolve(output);
      }, executionTime);
    });
  }, [nodes]);
  
  // Execute a node and all its connected nodes with enhanced dependency management
  const executeNodeAndConnected = useCallback(async (nodeId: string, inputData: any = {}) => {
    try {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) {
        throw new Error(`Node ${nodeId} not found`);
      }
      
      // Check if this node has dependencies on async nodes that are still processing
      const incomingConnections = connections.filter(conn => conn.target === nodeId);
      const processingDependencies = incomingConnections
        .filter(conn => {
          const sourceNode = nodes.find(n => n.id === conn.source);
          if (!sourceNode) return false;
          
          // Check if the source node is an AI agent or LLM model
          const isAsyncSource = sourceNode.type === "agent" || 
                              sourceNode.type === "llm" || 
                              sourceNode.type.includes("agent") || 
                              sourceNode.type.includes("model");
                              
          // Check if this async source is still processing
          const sourceState = executionState.nodeStates[conn.source];
          return isAsyncSource && (sourceState === "processing" || sourceState === "running");
        })
        .map(conn => conn.source);
      
      // If this node has dependencies that are still processing, mark it as waiting
      if (processingDependencies.length > 0) {
        console.log(`Node ${nodeId} is waiting for async dependencies to complete:`, processingDependencies);
        
        // Mark the node as waiting
        setExecutionState(prev => ({
          ...prev,
          nodeStates: {
            ...prev.nodeStates,
            [nodeId]: "waiting"
          },
          nodeExecutions: [
            ...prev.nodeExecutions.filter(ne => ne.nodeId !== nodeId),
            {
              nodeId,
              state: "waiting",
              startTime: Date.now(),
              input: inputData,
              processingMessage: "Waiting for upstream nodes to complete",
              dependencies: processingDependencies
            }
          ]
        }));
        
        // Don't proceed until dependencies are complete
        return;
      }
      
      // Execute the current node
      const output = await executeNode(nodeId, inputData);
      
      // Check if execution was deferred due to waiting
      if (executionState.nodeStates[nodeId] === "waiting") {
        console.log(`Node ${nodeId} execution is deferred - waiting for dependencies or user input`);
        return;
      }
      
      // If this is a manual step, don't proceed yet
      if (node.type === "manualStep" || node.type === "fileUpload") {
        console.log(`Manual step node detected: ${nodeId}. Waiting for user input.`);
        // Store the input data in the nodeExecution so it can be accessed later
        setExecutionState(prev => {
          // Find the execution record for this node
          const existingExecutionIndex = prev.nodeExecutions.findIndex(
            ne => ne.nodeId === nodeId
          );
          
          if (existingExecutionIndex >= 0) {
            // Update the existing execution record with input data
            const updatedExecutions = [...prev.nodeExecutions];
            updatedExecutions[existingExecutionIndex] = {
              ...updatedExecutions[existingExecutionIndex],
              input: inputData
            };
            
            return {
              ...prev,
              nodeExecutions: updatedExecutions
            };
          }
          
          return prev;
        });
        
        // Don't continue execution until user approves
        return;
      }
      
      // If this is an async node (agent, LLM model), it may still be processing
      const isAsyncNode = node.type === "agent" || 
                           node.type === "llm" || 
                           node.type.includes("agent") || 
                           node.type.includes("model");
                           
      if (isAsyncNode && executionState.nodeStates[nodeId] === "processing") {
        console.log(`Async node ${nodeId} is still processing - waiting for completion`);
        return;
      }
      
      // If we made it here, the node is completed or we have output to continue with
      console.log(`Node ${nodeId} execution completed with output:`, output);
      
      // Find connections from this node
      const outgoingConnections = connections.filter(conn => conn.source === nodeId);
      
      // Show data flowing through connections
      outgoingConnections.forEach(conn => {
        setExecutionState(prev => ({
          ...prev,
          dataFlow: {
            ...prev.dataFlow,
            [conn.id]: output
          }
        }));
      });
      
      // Execute all connected nodes
      const connectedNodes = getConnectedNodes(nodeId);
      for (const nextNode of connectedNodes) {
        // Pass the appropriate output to the next node based on the connection
        const connection = connections.find(c => c.source === nodeId && c.target === nextNode.id);
        
        // Don't wait for execution to finish (async execution flow)
        executeNodeAndConnected(nextNode.id, output);
      }
      
    } catch (error) {
      console.error(`Error executing node ${nodeId}:`, error);
      
      // Mark node as error
      setExecutionState(prev => {
        const nodeExecution: NodeExecution = {
          nodeId,
          state: "error",
          startTime: Date.now() - 1000, // Approximate
          endTime: Date.now(),
          error: String(error)
        };
        
        return {
          ...prev,
          nodeStates: {
            ...prev.nodeStates,
            [nodeId]: "error"
          },
          activeNodes: prev.activeNodes.filter(id => id !== nodeId),
          nodeExecutions: [...prev.nodeExecutions, nodeExecution]
        };
      });
    }
  }, [nodes, connections, executeNode, getConnectedNodes, executionState.nodeStates]);
  
  // Run the entire workflow
  const runWorkflow = useCallback(() => {
    // Reset execution state
    setExecutionState({
      workflowState: "running",
      nodeStates: {},
      activeNodes: [],
      nodeExecutions: [],
      dataFlow: {},
      startTime: Date.now()
    });
    
    // Find starting nodes and execute each
    const startingNodes = findStartingNodes();
    if (startingNodes.length === 0) {
      console.warn("No starting nodes found in workflow");
      setExecutionState(prev => ({
        ...prev,
        workflowState: "error"
      }));
      return;
    }
    
    // Execute each starting node (usually there should be just one)
    startingNodes.forEach(node => {
      executeNodeAndConnected(node.id, {});
    });
  }, [findStartingNodes, executeNodeAndConnected]);
  
  // Stop workflow execution
  const stopWorkflow = useCallback(() => {
    setExecutionState(prev => ({
      ...prev,
      workflowState: "idle",
      activeNodes: [],
      endTime: Date.now()
    }));
  }, []);
  
  // Pause workflow execution
  const pauseWorkflow = useCallback(() => {
    setExecutionState(prev => ({
      ...prev,
      workflowState: "paused"
    }));
  }, []);
  
  // Resume workflow execution
  const resumeWorkflow = useCallback(() => {
    setExecutionState(prev => ({
      ...prev,
      workflowState: "running"
    }));
    
    // Resume from paused nodes
    // In a real implementation, we would need to track which nodes were paused
  }, []);
  
  // Manual step approval
  const approveManualStep = useCallback((nodeId: string, data: any = {}) => {
    console.log(`Manual step approved: ${nodeId}`, data);
    
    // Use a Promise to ensure we complete all state updates before continuing execution
    const updateExecutionState = () => {
      return new Promise<void>(resolve => {
        // Mark node as complete
        setExecutionState(prev => {
          const nodeExecution: NodeExecution = {
            nodeId,
            state: "complete",
            startTime: Date.now() - 1000, // Approximate
            endTime: Date.now(),
            output: data
          };
          
          return {
            ...prev,
            nodeStates: {
              ...prev.nodeStates,
              [nodeId]: "complete"
            },
            activeNodes: prev.activeNodes.filter(id => id !== nodeId),
            nodeExecutions: [...prev.nodeExecutions, nodeExecution]
          };
        });
        
        // Use requestAnimationFrame to ensure the state update is processed
        requestAnimationFrame(() => resolve());
      });
    };
    
    const updateDataFlows = () => {
      return new Promise<void>(resolve => {
        // Find all outgoing connections and update their data flow
        const outgoingConnections = connections.filter(conn => conn.source === nodeId);
        console.log(`Outgoing connections for node ${nodeId}:`, outgoingConnections.length, outgoingConnections);
        
        if (outgoingConnections.length === 0) {
          resolve();
          return;
        }
        
        // Update all connections in a single state update to avoid batching issues
        setExecutionState(prev => {
          const newDataFlow = { ...prev.dataFlow };
          
          outgoingConnections.forEach(connection => {
            newDataFlow[connection.id] = data;
          });
          
          return {
            ...prev,
            dataFlow: newDataFlow
          };
        });
        
        // Use requestAnimationFrame to ensure the state update is processed
        requestAnimationFrame(() => resolve());
      });
    };
    
    const continueExecution = () => {
      // Continue execution from this node
      const connectedNodes = getConnectedNodes(nodeId);
      console.log(`Connected nodes for ${nodeId}:`, connectedNodes.length, connectedNodes);
      
      if (connectedNodes.length === 0) {
        console.warn(`No connected nodes found for ${nodeId}`);
        return;
      }
      
      // Execute each connected node with a small delay between them
      connectedNodes.forEach((node, index) => {
        setTimeout(() => {
          console.log(`Continuing execution to node: ${node.id} (${node.type})`);
          
          // Special handling for entity-based nodes
          const isEntityNode = node.data?.entityType || 
                              node.type.includes('agent') || 
                              node.type.includes('model') || 
                              node.type.includes('dataSource');
                              
          if (isEntityNode) {
            console.log(`Executing entity-based node: ${node.id}, type: ${node.type}, entityType: ${node.data?.entityType}`, node);
            
            // Make sure we have the proper entity data in the input
            const enhancedData = {
              ...data,
              // Include entity reference information if not already present
              entityRef: node.data?.entityType ? {
                type: node.data.entityType,
                id: node.data.entityId,
              } : undefined
            };
            
            executeNodeAndConnected(node.id, enhancedData);
          } else {
            // Regular node execution
            executeNodeAndConnected(node.id, data);
          }
        }, index * 50); // stagger execution slightly
      });
    };
    
    // Chain these operations to ensure proper order
    updateExecutionState()
      .then(updateDataFlows)
      .then(() => {
        // Add a small delay before continuing execution to ensure all state updates are processed
        setTimeout(continueExecution, 250);
      })
      .catch(error => {
        console.error("Error during manual step approval:", error);
      });
  }, [connections, getConnectedNodes, executeNodeAndConnected]);
  
  // Manual step rejection
  const rejectManualStep = useCallback((nodeId: string, reason: string = "Rejected by user") => {
    // Mark node as error
    setExecutionState(prev => {
      const nodeExecution: NodeExecution = {
        nodeId,
        state: "error",
        startTime: Date.now() - 1000, // Approximate
        endTime: Date.now(),
        error: reason
      };
      
      return {
        ...prev,
        nodeStates: {
          ...prev.nodeStates,
          [nodeId]: "error"
        },
        activeNodes: prev.activeNodes.filter(id => id !== nodeId),
        nodeExecutions: [...prev.nodeExecutions, nodeExecution],
        workflowState: "error"
      };
    });
  }, []);

  // Load workflow from template or saved state
  const loadWorkflow = useCallback((newNodes: Node[], newConnections: Connection[]) => {
    // First, ensure workflow is not running
    if (executionState.workflowState === "running" || executionState.workflowState === "paused") {
      if (!window.confirm("Loading a workflow will stop the current execution. Continue?")) {
        return;
      }
      // Stop current execution
      stopWorkflow();
    }
    
    // Clear current workflow
    setSelectedNode(null);
    // Load the new workflow
    setNodes(newNodes);
    setConnections(newConnections);
    
    // Update workflow metadata
    setWorkflowMeta(prev => ({
      ...prev,
      lastSaved: new Date().toLocaleString(),
    }));
    
    console.log("Workflow loaded", { nodes: newNodes.length, connections: newConnections.length });
  }, [executionState.workflowState, stopWorkflow]);
  
  // Clear the current workflow
  const clearWorkflow = useCallback(() => {
    if (executionState.workflowState === "running" || executionState.workflowState === "paused") {
      if (!window.confirm("Clearing the workflow will stop the current execution. Continue?")) {
        return;
      }
      // Stop current execution
      stopWorkflow();
    }
    
    // Reset everything
    setSelectedNode(null);
    setNodes([]);
    setConnections([]);
    setExecutionState({
      workflowState: "idle",
      nodeStates: {},
      activeNodes: [],
      nodeExecutions: [],
      dataFlow: {},
    });
    
    console.log("Workflow cleared");
  }, [executionState.workflowState, stopWorkflow]);

  return (
    <WorkflowContext.Provider
      value={{
        nodes,
        connections,
        selectedNode,
        systemStatus,
        workflowMeta,
        executionState,
        addNode,
        updateNode,
        removeNode,
        selectNode,
        addConnection,
        removeConnection,
        updateNodePosition,
        saveWorkflow,
        // Workflow template functions
        loadWorkflow,
        clearWorkflow,
        // Execution control functions
        runWorkflow,
        stopWorkflow,
        pauseWorkflow,
        resumeWorkflow,
        // Manual node control functions
        approveManualStep,
        rejectManualStep,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  return context;
}
