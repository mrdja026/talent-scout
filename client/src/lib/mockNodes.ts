import { NodeType } from "@/components/DraggableNode";

// Node category groupings
export const nodeTypes: { category: string; nodes: NodeType[] }[] = [
  {
    category: "Agent Nodes",
    nodes: [
      {
        type: "agent",
        label: "Agent",
        icon: "smart_toy",
        color: "accent",
        lightColor: "accent-light",
        darkColor: "accent-dark"
      },
      {
        type: "multiAgent",
        label: "Multi-Agent",
        icon: "groups",
        color: "accent-light",
        lightColor: "accent-lighter",
        darkColor: "accent"
      }
    ]
  },
  {
    category: "LLM Nodes",
    nodes: [
      {
        type: "modelRunner",
        label: "Model Runner",
        icon: "model_training",
        color: "primary",
        lightColor: "primary-light",
        darkColor: "primary-dark"
      },
      {
        type: "parameterConfig",
        label: "Parameter Config",
        icon: "tune",
        color: "primary-light",
        lightColor: "primary-lighter",
        darkColor: "primary"
      }
    ]
  },
  {
    category: "Data Nodes",
    nodes: [
      {
        type: "dataSource",
        label: "Data Source",
        icon: "storage",
        color: "secondary",
        lightColor: "secondary-light",
        darkColor: "secondary-dark"
      },
      {
        type: "transform",
        label: "Transform",
        icon: "transform",
        color: "secondary-light",
        lightColor: "secondary-lighter",
        darkColor: "secondary"
      }
    ]
  },
  {
    category: "Flow Control",
    nodes: [
      {
        type: "branch",
        label: "Branch",
        icon: "call_split",
        color: "gray-500",
        lightColor: "gray-400",
        darkColor: "gray-600"
      },
      {
        type: "merge",
        label: "Merge",
        icon: "join_full",
        color: "gray-400",
        lightColor: "gray-300",
        darkColor: "gray-500"
      },
      {
        type: "connector",
        label: "I/O Connector",
        icon: "cable",
        color: "blue-500",
        lightColor: "blue-400",
        darkColor: "blue-600"
      }
    ]
  },
  {
    category: "User Interaction",
    nodes: [
      {
        type: "manualStep",
        label: "Manual Step",
        icon: "person",
        color: "purple-500",
        lightColor: "purple-300",
        darkColor: "purple-700"
      },
      {
        type: "fileUpload",
        label: "Document Upload",
        icon: "upload_file",
        color: "purple-400",
        lightColor: "purple-200",
        darkColor: "purple-600"
      }
    ]
  },
  {
    category: "Output Nodes",
    nodes: [
      {
        type: "output",
        label: "Report Generator",
        icon: "description",
        color: "gray-500",
        lightColor: "gray-400",
        darkColor: "gray-600"
      }
    ]
  }
];

// Default configurations for node types
export const defaultNodeConfigs: Record<string, Record<string, any>> = {
  agent: {
    role: "Assistant",
    goal: "Help the user",
    memory: "4KB context",
    inputs: ["instructions", "context"],
    outputs: ["response", "reasoning"]
  },
  modelRunner: {
    model: "Llama2 7B",
    mode: "Text Generation",
    temperature: 0.7,
    maxTokens: 512,
    systemPrompt: "You are a helpful assistant.",
    inputs: ["prompt", "context"],
    outputs: ["completion", "tokens"]
  },
  dataSource: {
    connection: "PostgreSQL",
    query: "SELECT * FROM data",
    inputs: [],
    outputs: ["data", "metadata"]
  },
  transform: {
    action: "Normalize text data",
    format: "JSON output",
    inputs: ["rawData"],
    outputs: ["transformedData"]
  },
  output: {
    format: "Markdown",
    output: "Final Report",
    inputs: ["content"],
    outputs: []
  },
  connector: {
    connectionType: "Data Transfer",
    dataFormat: "JSON",
    bufferSize: "1MB",
    inputs: ["sourceData"],
    outputs: ["processedData"],
    inputLabel: "Input",
    outputLabel: "Output"
  },
  manualStep: {
    prompt: "Please review and decide:",
    instructions: "Click 'Continue' when ready",
    waitingFor: "User input",
    status: "idle", // idle, waiting, complete
    inputs: ["workflowData", "context"],
    outputs: ["userDecision", "userInput"],
    requiresAttention: true
  },
  fileUpload: {
    acceptedTypes: ".pdf,.doc,.docx,.txt",
    maxFileSize: "20MB",
    instructions: "Upload competitor documentation",
    status: "idle", // idle, waiting, complete
    inputs: ["requestContext"],
    outputs: ["documentData", "documentMetadata"],
    requiresAttention: true
  }
};
