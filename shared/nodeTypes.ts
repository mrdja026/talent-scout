/**
 * Node type definitions for the workflow system
 */
import { z } from "zod";

/**
 * Base properties for all node types
 */
export const baseNodeProperties = {
  label: z.string().min(1, "Label is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  inputPorts: z.array(z.string()).optional().default([]),
  outputPorts: z.array(z.string()).optional().default([]),
};

/**
 * Agent node properties
 */
export const agentNodeSchema = z.object({
  ...baseNodeProperties,
  role: z.string().optional(),
  goals: z.array(z.string()).optional(),
  model: z.string().optional(),
  memory: z.number().optional(),
});

/**
 * LLM node properties
 */
export const llmNodeSchema = z.object({
  ...baseNodeProperties,
  model: z.string(),
  temperature: z.number().min(0).max(1).optional().default(0.7),
  maxTokens: z.number().positive().optional(),
  prompt: z.string().optional(),
  systemPrompt: z.string().optional(),
});

/**
 * Data source node properties
 */
export const dataSourceNodeSchema = z.object({
  ...baseNodeProperties,
  sourceType: z.enum(["database", "api", "file", "custom"]),
  config: z.record(z.any()).optional(),
  credentials: z.record(z.string()).optional(),
});

/**
 * Transform node properties
 */
export const transformNodeSchema = z.object({
  ...baseNodeProperties,
  transformType: z.enum(["filter", "map", "extract", "combine", "custom"]).optional(),
  script: z.string().optional(),
  config: z.record(z.any()).optional(),
});

/**
 * Manual step node properties
 */
export const manualStepNodeSchema = z.object({
  ...baseNodeProperties,
  prompt: z.string(),
  instructions: z.string().optional(),
  options: z.array(z.string()).optional(),
  requireComments: z.boolean().optional().default(false),
});

/**
 * File upload node properties
 */
export const fileUploadNodeSchema = z.object({
  ...baseNodeProperties,
  acceptedTypes: z.string().optional(),
  maxFiles: z.number().positive().optional(),
  maxSize: z.number().positive().optional(), // in bytes
  instructions: z.string().optional(),
});

/**
 * Union type for all node data schema types
 */
export const nodeDataSchema = z.union([
  agentNodeSchema,
  llmNodeSchema,
  dataSourceNodeSchema,
  transformNodeSchema,
  manualStepNodeSchema,
  fileUploadNodeSchema,
]);

/**
 * Node type definitions with metadata
 */
export const NODE_TYPES = [
  {
    type: "agent",
    label: "Agent",
    icon: "robot",
    color: "#4F46E5",
    description: "An autonomous agent that can perform tasks based on goals",
    defaultData: {
      label: "Agent",
      inputPorts: ["input"],
      outputPorts: ["output"],
      role: "Assistant",
      goals: ["Help users accomplish their tasks"]
    }
  },
  {
    type: "llm",
    label: "LLM",
    icon: "cpu",
    color: "#0EA5E9",
    description: "Large language model processor",
    defaultData: {
      label: "LLM",
      inputPorts: ["prompt"],
      outputPorts: ["completion"],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      maxTokens: 1024
    }
  },
  {
    type: "dataSource",
    label: "Data Source",
    icon: "database",
    color: "#10B981",
    description: "External data source connector",
    defaultData: {
      label: "Data Source",
      outputPorts: ["data"],
      sourceType: "api"
    }
  },
  {
    type: "transform",
    label: "Transform",
    icon: "filter",
    color: "#F59E0B",
    description: "Data transformation processor",
    defaultData: {
      label: "Transform",
      inputPorts: ["input"],
      outputPorts: ["output"],
      transformType: "map"
    }
  },
  {
    type: "manualStep",
    label: "Manual Step",
    icon: "user",
    color: "#EC4899",
    description: "Human-in-the-loop approval step",
    defaultData: {
      label: "Manual Step",
      inputPorts: ["input"],
      outputPorts: ["output"],
      prompt: "Please review the following information and provide your input",
      instructions: "Enter your decision below"
    }
  },
  {
    type: "fileUpload",
    label: "File Upload",
    icon: "file-upload",
    color: "#8B5CF6",
    description: "File upload and processing",
    defaultData: {
      label: "File Upload",
      outputPorts: ["files"],
      acceptedTypes: ".jpg,.png,.pdf,.docx,.xlsx",
      maxFiles: 5,
      instructions: "Upload one or more files to process"
    }
  }
];