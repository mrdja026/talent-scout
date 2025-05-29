/**
 * Agent model definitions and utilities
 */
import { z } from "zod";

/**
 * Agent capability types
 */
export const AgentCapability = z.enum([
  "text",          // Text generation and conversation
  "search",        // Web search capability
  "code",          // Code generation and analysis
  "reasoning",     // Step-by-step reasoning
  "math",          // Mathematical calculations
  "memory",        // Long-term memory and context tracking
  "tools",         // Using external tools
  "retrieval",     // Document retrieval
  "planning",      // Sequential planning
  "multimedia"     // Handling images, audio, etc.
]);

export type AgentCapability = z.infer<typeof AgentCapability>;

/**
 * Agent personality traits
 */
export const AgentPersonality = z.object({
  helpfulness: z.number().min(1).max(10).optional(),
  creativity: z.number().min(1).max(10).optional(),
  technical: z.number().min(1).max(10).optional(),
  formal: z.number().min(1).max(10).optional(),
  traits: z.array(z.string()).optional()
});

export type AgentPersonality = z.infer<typeof AgentPersonality>;

/**
 * Agent knowledge domain
 */
export const AgentKnowledgeDomain = z.enum([
  "general",       // General knowledge
  "technical",     // Technical and programming knowledge
  "business",      // Business and finance
  "creative",      // Creative writing and arts
  "scientific",    // Scientific knowledge
  "academic",      // Academic writing and research
  "legal",         // Legal knowledge
  "medical",       // Medical knowledge
  "custom"         // Custom domain
]);

export type AgentKnowledgeDomain = z.infer<typeof AgentKnowledgeDomain>;

/**
 * Agent configuration schema
 */
export const agentConfigSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Agent name is required"),
  description: z.string().optional(),
  role: z.string(),
  goals: z.array(z.string()),
  capabilities: z.array(AgentCapability).optional(),
  personality: AgentPersonality.optional(),
  knowledgeDomains: z.array(AgentKnowledgeDomain).optional(),
  modelId: z.string().or(z.number()),
  modelConfig: z.object({
    temperature: z.number().min(0).max(1).optional().default(0.7),
    maxTokens: z.number().positive().optional(),
    topP: z.number().min(0).max(1).optional(),
    frequencyPenalty: z.number().min(0).max(2).optional(),
    presencePenalty: z.number().min(0).max(2).optional()
  }).optional(),
  memoryConfig: z.object({
    memoryType: z.enum(["conversational", "episodic", "semantic", "none"]).optional(),
    maxContextSize: z.number().positive().optional(),
    summaryThreshold: z.number().positive().optional(),
    recallThreshold: z.number().min(0).max(1).optional()
  }).optional(),
  systemPrompt: z.string().optional(),
  constraints: z.array(z.string()).optional(),
  tools: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    config: z.record(z.any()).optional()
  })).optional(),
  createdBy: z.string().or(z.number()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  isActive: z.boolean().optional().default(true)
});

export type AgentConfig = z.infer<typeof agentConfigSchema>;

/**
 * Agent execution request
 */
export const agentExecutionRequestSchema = z.object({
  agentId: z.string().or(z.number()),
  input: z.string().or(z.record(z.any())),
  context: z.record(z.any()).optional(),
  executionId: z.string().optional(),
  nodeId: z.string().optional(),
  workflowId: z.string().or(z.number()).optional(),
  tools: z.array(z.string()).optional(),
  maxIterations: z.number().optional(),
  timeoutSeconds: z.number().optional()
});

export type AgentExecutionRequest = z.infer<typeof agentExecutionRequestSchema>;

/**
 * Agent execution response
 */
export const agentExecutionResponseSchema = z.object({
  executionId: z.string(),
  agentId: z.string().or(z.number()),
  status: z.enum(["running", "completed", "failed", "timeout"]),
  output: z.any(),
  error: z.string().optional(),
  iterations: z.number().optional(),
  duration: z.number().optional(), // in milliseconds
  logs: z.array(z.object({
    timestamp: z.string(),
    level: z.string(),
    message: z.string(),
    data: z.any().optional()
  })).optional(),
  toolCalls: z.array(z.object({
    tool: z.string(),
    input: z.any(),
    output: z.any().optional(),
    error: z.string().optional()
  })).optional(),
  metadata: z.record(z.any()).optional()
});

export type AgentExecutionResponse = z.infer<typeof agentExecutionResponseSchema>;