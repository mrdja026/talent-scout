/**
 * LLM (Large Language Model) service models and utilities
 */
import { z } from "zod";

/**
 * LLM provider types
 */
export const LLMProvider = z.enum([
  "openai",       // OpenAI (GPT-3.5, GPT-4, etc.)
  "anthropic",    // Anthropic (Claude models)
  "google",       // Google (Gemini, PaLM models)
  "mistral",      // Mistral AI models
  "cohere",       // Cohere models
  "huggingface",  // HuggingFace models
  "local",        // Local models
  "custom"        // Custom model integrations
]);

export type LLMProvider = z.infer<typeof LLMProvider>;

/**
 * Model capabilities
 */
export const ModelCapability = z.enum([
  "text",           // Text generation
  "chat",           // Conversational capability
  "embedding",      // Vector embeddings
  "classification", // Text classification
  "summarization",  // Text summarization
  "extraction",     // Entity extraction
  "code",           // Code generation
  "vision",         // Vision capabilities
  "audio"           // Audio processing
]);

export type ModelCapability = z.infer<typeof ModelCapability>;

/**
 * LLM model configuration schema
 */
export const llmModelConfigSchema = z.object({
  id: z.string().or(z.number()),
  name: z.string().min(1, "Model name is required"),
  provider: LLMProvider,
  modelName: z.string(), // e.g., "gpt-4", "claude-3-opus", etc.
  capabilities: z.array(ModelCapability).optional(),
  apiVersion: z.string().optional(),
  contextWindow: z.number().positive().optional(), // in tokens
  parameters: z.object({
    temperature: z.number().min(0).max(2).optional().default(0.7),
    topP: z.number().min(0).max(1).optional(),
    topK: z.number().positive().optional(),
    maxTokens: z.number().positive().optional(),
    frequencyPenalty: z.number().min(0).max(2).optional(),
    presencePenalty: z.number().min(0).max(2).optional(),
    stopSequences: z.array(z.string()).optional()
  }).optional(),
  supportsFunctions: z.boolean().optional().default(false),
  supportsVision: z.boolean().optional().default(false),
  supportsStreaming: z.boolean().optional().default(false),
  tokenLimit: z.number().positive().optional(),
  inputCostPer1000Tokens: z.number().min(0).optional(),
  outputCostPer1000Tokens: z.number().min(0).optional(),
  description: z.string().optional(),
  status: z.enum(["available", "limited", "unavailable"]).optional().default("available"),
  credentials: z.object({
    apiKey: z.string().optional(),
    organizationId: z.string().optional(),
    endpointUrl: z.string().optional()
  }).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export type LLMModelConfig = z.infer<typeof llmModelConfigSchema>;

/**
 * Text completion request schema
 */
export const textCompletionRequestSchema = z.object({
  modelId: z.string().or(z.number()),
  prompt: z.string(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(0).max(2).optional(),
  presencePenalty: z.number().min(0).max(2).optional(),
  stop: z.array(z.string()).optional(),
  stream: z.boolean().optional().default(false),
  executionId: z.string().optional(),
  nodeId: z.string().optional(),
  workflowId: z.string().or(z.number()).optional()
});

export type TextCompletionRequest = z.infer<typeof textCompletionRequestSchema>;

/**
 * Chat message role
 */
export const ChatMessageRole = z.enum([
  "system",
  "user",
  "assistant",
  "function",
  "tool"
]);

export type ChatMessageRole = z.infer<typeof ChatMessageRole>;

/**
 * Chat message schema
 */
export const chatMessageSchema = z.object({
  role: ChatMessageRole,
  content: z.string(),
  name: z.string().optional(),
  toolCallId: z.string().optional(),
  functionCall: z.record(z.any()).optional()
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

/**
 * Chat completion request schema
 */
export const chatCompletionRequestSchema = z.object({
  modelId: z.string().or(z.number()),
  messages: z.array(chatMessageSchema),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(0).max(2).optional(),
  presencePenalty: z.number().min(0).max(2).optional(),
  stop: z.array(z.string()).optional(),
  tools: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    parameters: z.record(z.any()).optional()
  })).optional(),
  stream: z.boolean().optional().default(false),
  executionId: z.string().optional(),
  nodeId: z.string().optional(),
  workflowId: z.string().or(z.number()).optional()
});

export type ChatCompletionRequest = z.infer<typeof chatCompletionRequestSchema>;

/**
 * LLM completion response schema
 */
export const llmCompletionResponseSchema = z.object({
  id: z.string(),
  modelId: z.string().or(z.number()),
  text: z.string().optional(),
  message: chatMessageSchema.optional(),
  finishReason: z.enum(["stop", "length", "content_filter", "tool_calls", "function_call"]).optional(),
  promptTokens: z.number().optional(),
  completionTokens: z.number().optional(),
  totalTokens: z.number().optional(),
  toolCalls: z.array(z.object({
    id: z.string(),
    type: z.string(),
    function: z.object({
      name: z.string(),
      arguments: z.string() // JSON string
    })
  })).optional(),
  executionId: z.string().optional(),
  createdAt: z.string(),
  duration: z.number().optional(), // in milliseconds
  cost: z.number().optional()
});

export type LLMCompletionResponse = z.infer<typeof llmCompletionResponseSchema>;

/**
 * Embedding request schema
 */
export const embeddingRequestSchema = z.object({
  modelId: z.string().or(z.number()),
  input: z.union([z.string(), z.array(z.string())]),
  dimensions: z.number().positive().optional(),
  user: z.string().optional(),
  executionId: z.string().optional(),
  nodeId: z.string().optional(),
  workflowId: z.string().or(z.number()).optional()
});

export type EmbeddingRequest = z.infer<typeof embeddingRequestSchema>;

/**
 * Embedding response schema
 */
export const embeddingResponseSchema = z.object({
  id: z.string(),
  object: z.string(),
  embeddings: z.array(z.array(z.number())),
  model: z.string(),
  promptTokens: z.number().optional(),
  dimensions: z.number().optional(),
  truncated: z.boolean().optional(),
  executionId: z.string().optional(),
  createdAt: z.string(),
  duration: z.number().optional(), // in milliseconds
  cost: z.number().optional()
});

export type EmbeddingResponse = z.infer<typeof embeddingResponseSchema>;