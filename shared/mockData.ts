/**
 * Mock data generators for development and testing
 */
import { Node, Connection } from "./schema";
import { NODE_TYPES } from "./nodeTypes";
import { Template } from "./workflowTemplate";
import { WorkflowExecutionState, NodeExecutionStatus } from "./workflowExecution";
import { AgentConfig, AgentCapability } from "./agentModel";
import { LLMModelConfig, LLMProvider, ModelCapability } from "./llmModel";

/**
 * Generate a random ID
 */
export function generateId(prefix: string = ""): string {
  return `${prefix}${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a random node
 */
export function generateNode(position: { x: number, y: number } = { x: 100, y: 100 }): Node {
  // Select a random node type
  const nodeTypeIndex = Math.floor(Math.random() * NODE_TYPES.length);
  const nodeType = NODE_TYPES[nodeTypeIndex];
  
  // Create a node with the selected type
  return {
    id: generateId("node-"),
    type: nodeType.type,
    position,
    data: {
      ...nodeType.defaultData,
      label: `${nodeType.label} ${Math.floor(Math.random() * 1000)}`
    }
  };
}

/**
 * Generate a set of nodes
 */
export function generateNodes(count: number = 5): Node[] {
  const nodes: Node[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate a random position that doesn't overlap too much
    const position = {
      x: 100 + (i % 3) * 300 + Math.random() * 50,
      y: 100 + Math.floor(i / 3) * 200 + Math.random() * 50
    };
    
    nodes.push(generateNode(position));
  }
  
  return nodes;
}

/**
 * Generate connections between nodes
 */
export function generateConnections(nodes: Node[]): Connection[] {
  const connections: Connection[] = [];
  
  // Skip if we don't have enough nodes
  if (nodes.length < 2) return connections;
  
  // Create some logical connections (avoiding cycles)
  for (let i = 0; i < nodes.length - 1; i++) {
    const source = nodes[i];
    const target = nodes[i + 1];
    
    // Skip if we don't have ports defined
    if (!source.data?.outputPorts?.length || !target.data?.inputPorts?.length) continue;
    
    // Generate a connection
    connections.push({
      id: generateId("conn-"),
      source: source.id,
      target: target.id,
      sourcePort: source.data.outputPorts[0],
      targetPort: target.data.inputPorts[0]
    });
  }
  
  // Add some additional random connections
  if (nodes.length > 3) {
    // Connect a node in the middle to the last node
    const midNodeIndex = Math.floor(nodes.length / 2);
    const source = nodes[midNodeIndex];
    const target = nodes[nodes.length - 1];
    
    // Skip if we don't have ports defined or if connection already exists
    if (source.data?.outputPorts?.length && target.data?.inputPorts?.length &&
        !connections.some(c => c.source === source.id && c.target === target.id)) {
      connections.push({
        id: generateId("conn-"),
        source: source.id,
        target: target.id,
        sourcePort: source.data.outputPorts[0],
        targetPort: target.data.inputPorts[0]
      });
    }
  }
  
  return connections;
}

/**
 * Generate a mock workflow
 */
export function generateWorkflow(nodeCount: number = 5) {
  const nodes = generateNodes(nodeCount);
  const connections = generateConnections(nodes);
  
  return {
    id: generateId("wf-"),
    name: `Workflow ${Math.floor(Math.random() * 1000)}`,
    description: `Generated workflow with ${nodes.length} nodes`,
    nodes,
    connections,
    createdBy: 1,
    status: "draft",
    version: "1.0",
    lastSaved: new Date().toISOString()
  };
}

/**
 * Generate multiple workflows
 */
export function generateWorkflows(count: number = 3) {
  const workflows = [];
  
  for (let i = 0; i < count; i++) {
    const nodeCount = 3 + Math.floor(Math.random() * 5); // 3-7 nodes
    workflows.push(generateWorkflow(nodeCount));
  }
  
  return workflows;
}

/**
 * Generate a mock template
 */
export function generateTemplate(): Template {
  const nodes = generateNodes(3 + Math.floor(Math.random() * 4)); // 3-6 nodes
  const connections = generateConnections(nodes);
  
  return {
    id: generateId("tmpl-"),
    name: `Template ${Math.floor(Math.random() * 1000)}`,
    description: "A sample workflow template",
    category: "custom",
    tags: ["sample", "generated"],
    nodes,
    connections,
    thumbnail: `/static/thumbnails/template_${Math.floor(Math.random() * 5) + 1}.png`,
    creator: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: "1.0",
    metadata: {},
    isPublic: Math.random() > 0.5,
    usageCount: Math.floor(Math.random() * 100)
  };
}

/**
 * Generate multiple templates
 */
export function generateTemplates(count: number = 5) {
  const templates = [];
  
  for (let i = 0; i < count; i++) {
    templates.push(generateTemplate());
  }
  
  return templates;
}

/**
 * Generate a mock workflow execution state
 */
export function generateWorkflowExecutionState(workflowId: string | number, nodes: Node[]): WorkflowExecutionState {
  const executionId = generateId("exec-");
  const startTime = new Date();
  
  // Create node states
  const nodeStates: Record<string, any> = {};
  
  nodes.forEach((node, index) => {
    // Determine node status based on position
    let status: NodeExecutionStatus;
    if (index === 0) {
      status = "succeeded"; // First node is always complete
    } else if (index === 1) {
      status = "running"; // Second node is running
    } else if (index === 2) {
      status = "waiting"; // Third node is waiting for input
    } else {
      status = "pending"; // Rest are pending
    }
    
    // Generate mock timing data for completed nodes
    let startTime, endTime, duration;
    if (status === "succeeded") {
      startTime = new Date(Date.now() - (index + 1) * 2000).toISOString();
      endTime = new Date(Date.now() - index * 1000).toISOString();
      duration = 1000 + Math.random() * 1000;
    } else if (status === "running") {
      startTime = new Date(Date.now() - 500).toISOString();
    }
    
    // Create the node state
    nodeStates[node.id] = {
      nodeId: node.id,
      status,
      startTime,
      endTime,
      duration,
      output: status === "succeeded" ? { result: "Sample output data for " + node.data?.label } : undefined,
      error: undefined
    };
  });
  
  // Create connection states
  const connectionStates: Record<string, any> = {};
  
  // Find which connections should be active based on node states
  const runningNodeIds = Object.keys(nodeStates).filter(nodeId => 
    nodeStates[nodeId].status === "running" || nodeStates[nodeId].status === "succeeded"
  );
  
  return {
    executionId,
    workflowId,
    status: "running",
    startTime: startTime.toISOString(),
    nodes: nodeStates,
    connections: connectionStates,
    currentNodeId: nodes[1]?.id, // Second node is current
    variables: {
      inputData: "Sample input data",
      processingStep: 2
    }
  };
}

/**
 * Generate mock agent configurations
 */
export function generateAgents(count: number = 3): AgentConfig[] {
  const agents: AgentConfig[] = [];
  
  const roleTemplates = [
    {
      name: "Research Assistant",
      role: "Research Assistant",
      goals: ["Find relevant information", "Analyze and summarize data", "Provide insights"],
      domain: "general" as const
    },
    {
      name: "Code Helper",
      role: "Coding Assistant",
      goals: ["Debug code", "Suggest improvements", "Explain technical concepts"],
      domain: "technical" as const
    },
    {
      name: "Content Writer",
      role: "Content Creator",
      goals: ["Generate creative content", "Edit and refine text", "Match specified tone"],
      domain: "creative" as const
    }
  ];
  
  for (let i = 0; i < count; i++) {
    const template = roleTemplates[i % roleTemplates.length];
    
    agents.push({
      id: generateId("agent-"),
      name: `${template.name} ${i + 1}`,
      description: `An AI agent for ${template.role.toLowerCase()} tasks`,
      role: template.role,
      goals: template.goals,
      capabilities: ["text", "reasoning", "memory"] as AgentCapability[],
      knowledgeDomains: [template.domain],
      modelId: `model-${i + 1}`,
      modelConfig: {
        temperature: 0.5 + (i * 0.2),
        maxTokens: 1000 + (i * 500)
      },
      systemPrompt: `You are a helpful ${template.role.toLowerCase()}. Your goals are: ${template.goals.join(", ")}.`,
      createdAt: new Date().toISOString(),
      isActive: true
    });
  }
  
  return agents;
}

/**
 * Generate mock LLM model configurations
 */
export function generateLLMModels(count: number = 4): LLMModelConfig[] {
  const models: LLMModelConfig[] = [];
  
  const modelTemplates = [
    {
      name: "GPT-4",
      provider: "openai" as LLMProvider,
      modelName: "gpt-4",
      contextWindow: 8192,
      capabilities: ["text", "chat", "code"] as ModelCapability[]
    },
    {
      name: "GPT-3.5 Turbo",
      provider: "openai" as LLMProvider,
      modelName: "gpt-3.5-turbo",
      contextWindow: 4096,
      capabilities: ["text", "chat"] as ModelCapability[]
    },
    {
      name: "Claude 3 Opus",
      provider: "anthropic" as LLMProvider,
      modelName: "claude-3-opus-20240229",
      contextWindow: 200000,
      capabilities: ["text", "chat", "vision"] as ModelCapability[]
    },
    {
      name: "Gemini Pro",
      provider: "google" as LLMProvider,
      modelName: "gemini-pro",
      contextWindow: 32768,
      capabilities: ["text", "chat", "code"] as ModelCapability[]
    }
  ];
  
  for (let i = 0; i < count; i++) {
    const template = modelTemplates[i % modelTemplates.length];
    
    models.push({
      id: `model-${i + 1}`,
      name: template.name,
      provider: template.provider,
      modelName: template.modelName,
      capabilities: template.capabilities as ModelCapability[],
      contextWindow: template.contextWindow,
      parameters: {
        temperature: 0.7,
        maxTokens: Math.floor(template.contextWindow / 4),
        topP: 0.95
      },
      supportsFunctions: template.provider === "openai" || template.provider === "anthropic",
      supportsVision: template.capabilities.includes("vision"),
      supportsStreaming: true,
      tokenLimit: template.contextWindow,
      inputCostPer1000Tokens: 0.005 + (i * 0.01),
      outputCostPer1000Tokens: 0.015 + (i * 0.02),
      description: `${template.name} from ${template.provider}`,
      status: "available",
      createdAt: new Date().toISOString()
    });
  }
  
  return models;
}