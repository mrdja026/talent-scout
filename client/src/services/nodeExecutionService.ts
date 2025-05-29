/**
 * Service for handling node execution logic
 */
import { Node } from '@shared/schema';
import { NodeExecutionStatus } from '@shared/workflowExecution';
import { apiRequest } from './api';
import { uploadFiles } from './api';
import { LLMProvider } from '@shared/llmModel';

// Node types that require asynchronous operations with longer processing times
export const ASYNC_NODE_TYPES = ['agent', 'llm'];

// Time estimates for different node types (in milliseconds)
export const NODE_PROCESSING_TIMES = {
  agent: {
    min: 5000,   // 5 seconds minimum
    max: 30000,  // 30 seconds maximum
    avg: 12000   // 12 seconds average
  },
  llm: {
    min: 3000,   // 3 seconds minimum
    max: 20000,  // 20 seconds maximum
    avg: 8000    // 8 seconds average
  }
};

// Execution timeout in milliseconds
const DEFAULT_EXECUTION_TIMEOUT = 30000;

/**
 * Options for node execution
 */
interface NodeExecutionOptions {
  workflowId: string | number;
  executionId: string;
  timeout?: number;
  inputs?: Record<string, any>;
  onStatusChange?: (status: NodeExecutionStatus) => void;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  
  // Additional options for async operations
  onProcessingUpdate?: (message: string, progress: number) => void;
  dependencies?: string[];  // Node IDs this node depends on
  waitForDependencies?: boolean;  // Whether this node should wait for dependencies
  processingCallback?: (nodeId: string, isComplete: boolean) => void; // Callback for processing state updates
}

/**
 * Execute a specific node
 * @param node Node to execute
 * @param options Execution options
 * @returns Promise resolving to execution result
 */
export async function executeNode(node: Node, options: NodeExecutionOptions): Promise<any> {
  const { workflowId, executionId, timeout = DEFAULT_EXECUTION_TIMEOUT } = options;
  
  try {
    // Check if node has dependencies that need to finish processing first
    if (options.waitForDependencies && options.dependencies && options.dependencies.length > 0) {
      // Update status to waiting
      if (options.onStatusChange) {
        options.onStatusChange('waiting');
      }
      
      // Update message for UI
      if (options.onProcessingUpdate) {
        options.onProcessingUpdate('Waiting for dependencies to complete...', 0);
      }
      
      console.log(`Node ${node.id} waiting for dependencies: ${options.dependencies.join(', ')}`);
      return {
        status: 'waiting',
        message: 'Waiting for dependencies to complete',
        nodeId: node.id,
        executionId,
        dependencies: options.dependencies
      };
    }
    
    // Determine if this is an async node type
    const isAsyncNode = ASYNC_NODE_TYPES.includes(node.type);
    
    // For async node types, set status to processing rather than running
    if (isAsyncNode) {
      if (options.onStatusChange) {
        options.onStatusChange('processing');
      }
      
      // Calculate estimated completion time based on node type
      const processingTimes = NODE_PROCESSING_TIMES[node.type as keyof typeof NODE_PROCESSING_TIMES] || {
        min: 3000,
        max: 15000,
        avg: 8000
      };
      
      // Random time between min and max to simulate realistic variation
      const processingTime = Math.floor(
        Math.random() * (processingTimes.max - processingTimes.min) + processingTimes.min
      );
      
      // Set the estimated completion time
      const estimatedCompletionTime = Date.now() + processingTime;
      
      if (options.onProcessingUpdate) {
        options.onProcessingUpdate(`Processing ${node.type} operation...`, 5);
      }
      
      // For Agent and LLM nodes, simulate the async processing with progress updates
      return new Promise((resolve, reject) => {
        let progress = 5;
        const progressInterval = Math.min(500, processingTime / 20); // Update progress every 0.5s or 5% of total time
        
        console.log(`Node ${node.id} started ${node.type} processing, estimated time: ${processingTime}ms`);
        
        // Start a timer to simulate the async processing
        const timer = setInterval(() => {
          const elapsedTime = Date.now() - (options.startTime || Date.now());
          const remainingTime = Math.max(0, processingTime - elapsedTime);
          
          // Calculate progress percentage (5% to 95%)
          progress = Math.min(95, Math.floor(5 + ((elapsedTime / processingTime) * 90)));
          
          // Update progress in UI
          if (options.onProcessingUpdate) {
            let message;
            if (progress < 30) {
              message = `Initializing ${node.type} operation...`;
            } else if (progress < 60) {
              message = `Processing ${node.type} operation...`;
            } else if (progress < 90) {
              message = `Finalizing ${node.type} results...`;
            } else {
              message = `Completing ${node.type} operation...`;
            }
            
            options.onProcessingUpdate(message, progress);
          }
          
          // If processing is complete
          if (progress >= 95 || remainingTime <= 0) {
            clearInterval(timer);
            
            // Execute the actual operation
            let result;
            try {
              switch (node.type) {
                case 'agent':
                  executeAgentNode(node, options).then(asyncResult => {
                    if (options.onProcessingUpdate) {
                      options.onProcessingUpdate('Processing complete', 100);
                    }
                    
                    // Notify that processing is complete
                    if (options.processingCallback) {
                      options.processingCallback(node.id, true);
                    }
                    
                    // Update status to succeeded
                    if (options.onStatusChange) {
                      options.onStatusChange('succeeded');
                    }
                    
                    resolve(asyncResult);
                  }).catch(error => {
                    if (options.onStatusChange) {
                      options.onStatusChange('failed');
                    }
                    
                    if (options.onError) {
                      options.onError(error as Error);
                    }
                    
                    reject(error);
                  });
                  break;
                  
                case 'llm':
                  executeLLMNode(node, options).then(asyncResult => {
                    if (options.onProcessingUpdate) {
                      options.onProcessingUpdate('Processing complete', 100);
                    }
                    
                    // Notify that processing is complete
                    if (options.processingCallback) {
                      options.processingCallback(node.id, true);
                    }
                    
                    // Update status to succeeded
                    if (options.onStatusChange) {
                      options.onStatusChange('succeeded');
                    }
                    
                    resolve(asyncResult);
                  }).catch(error => {
                    if (options.onStatusChange) {
                      options.onStatusChange('failed');
                    }
                    
                    if (options.onError) {
                      options.onError(error as Error);
                    }
                    
                    reject(error);
                  });
                  break;
              }
            } catch (error) {
              if (options.onStatusChange) {
                options.onStatusChange('failed');
              }
              
              if (options.onError) {
                options.onError(error as Error);
              }
              
              reject(error);
            }
          }
        }, progressInterval);
      });
    } 
    else {
      // For non-async nodes, use the normal execution flow
      // Update status to running
      if (options.onStatusChange) {
        options.onStatusChange('running');
      }
      
      // Execute node based on type
      let result;
      
      switch (node.type) {
        case 'dataSource':
          result = await executeDataSourceNode(node, options);
          break;
          
        case 'transform':
          result = await executeTransformNode(node, options);
          break;
          
        case 'manualStep':
          result = await executeManualStepNode(node, options);
          break;
          
        case 'fileUpload':
          result = await executeFileUploadNode(node, options);
          break;
          
        default:
          throw new Error(`Unsupported node type: ${node.type}`);
      }
      
      // Update status to succeeded
      if (options.onStatusChange) {
        options.onStatusChange('succeeded');
      }
      
      return result;
    }
  } catch (error) {
    console.error(`Error executing node ${node.id}:`, error);
    
    // Update status to failed
    if (options.onStatusChange) {
      options.onStatusChange('failed');
    }
    
    // Call error handler if provided
    if (options.onError) {
      options.onError(error as Error);
    }
    
    throw error;
  }
}

/**
 * Execute an agent node
 */
async function executeAgentNode(node: Node, options: NodeExecutionOptions): Promise<any> {
  const { workflowId, executionId, inputs = {} } = options;
  
  const nodeData = node.data || {};
  const agentRole = nodeData.role || 'Assistant';
  const goals = nodeData.goals || [];
  const modelId = nodeData.modelId || 'default';
  
  // Execute agent via API
  return apiRequest(`/workflows/${workflowId}/nodes/${node.id}/execute`, {
    method: 'POST',
    body: JSON.stringify({
      executionId,
      inputs,
      config: {
        role: agentRole,
        goals,
        modelId
      }
    })
  });
}

/**
 * Execute an LLM node
 */
async function executeLLMNode(node: Node, options: NodeExecutionOptions): Promise<any> {
  const { workflowId, executionId, inputs = {} } = options;
  
  const nodeData = node.data || {};
  const model = nodeData.model || 'gpt-3.5-turbo';
  const temperature = nodeData.temperature || 0.7;
  const maxTokens = nodeData.maxTokens || 1024;
  const systemPrompt = nodeData.systemPrompt || '';
  
  // Get input prompt
  const prompt = inputs.prompt || nodeData.prompt || 'Hello, AI!';
  
  // Determine provider based on model
  let provider: LLMProvider = 'openai';
  if (model.includes('claude')) {
    provider = 'anthropic';
  } else if (model.includes('gemini')) {
    provider = 'google';
  }
  
  // Create request based on provider
  const requestBody = {
    executionId,
    modelId: model,
    provider,
    messages: [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      { role: 'user', content: prompt }
    ],
    parameters: {
      temperature,
      maxTokens
    }
  };
  
  // Execute LLM via API
  return apiRequest(`/workflows/${workflowId}/nodes/${node.id}/execute`, {
    method: 'POST',
    body: JSON.stringify(requestBody)
  });
}

/**
 * Execute a data source node
 */
async function executeDataSourceNode(node: Node, options: NodeExecutionOptions): Promise<any> {
  const { workflowId, executionId, inputs = {} } = options;
  
  const nodeData = node.data || {};
  const sourceType = nodeData.sourceType || 'api';
  const config = nodeData.config || {};
  
  // Execute data source via API
  return apiRequest(`/workflows/${workflowId}/nodes/${node.id}/execute`, {
    method: 'POST',
    body: JSON.stringify({
      executionId,
      inputs,
      config: {
        sourceType,
        ...config
      }
    })
  });
}

/**
 * Execute a transform node
 */
async function executeTransformNode(node: Node, options: NodeExecutionOptions): Promise<any> {
  const { workflowId, executionId, inputs = {} } = options;
  
  const nodeData = node.data || {};
  const transformType = nodeData.transformType || 'map';
  const script = nodeData.script || '';
  
  // Execute transform via API
  return apiRequest(`/workflows/${workflowId}/nodes/${node.id}/execute`, {
    method: 'POST',
    body: JSON.stringify({
      executionId,
      inputs,
      config: {
        transformType,
        script
      }
    })
  });
}

/**
 * Execute a manual step node
 */
async function executeManualStepNode(node: Node, options: NodeExecutionOptions): Promise<any> {
  const { workflowId, executionId } = options;
  
  // Update status to waiting
  if (options.onStatusChange) {
    options.onStatusChange('waiting');
  }
  
  // For manual steps, we just mark it as waiting for user input
  // The actual execution will happen when the user submits their input
  return {
    status: 'waiting',
    message: 'Waiting for manual input',
    nodeId: node.id,
    executionId
  };
}

/**
 * Submit manual input for a manual step node
 * @param nodeId Node ID
 * @param executionId Execution ID
 * @param input User input data
 * @returns Promise resolving to the execution result
 */
export async function submitManualInput(
  nodeId: string,
  workflowId: string | number,
  executionId: string,
  input: any,
): Promise<any> {
  return apiRequest(`/workflows/${workflowId}/nodes/${nodeId}/manual-input`, {
    method: 'POST',
    body: JSON.stringify({
      executionId,
      input,
      timestamp: new Date().toISOString()
    })
  });
}

/**
 * Execute a file upload node
 */
async function executeFileUploadNode(node: Node, options: NodeExecutionOptions): Promise<any> {
  const { workflowId, executionId, inputs = {} } = options;
  
  // For file uploads, we need actual File objects
  if (!inputs.files || !Array.isArray(inputs.files) || inputs.files.length === 0) {
    throw new Error('No files provided for file upload node');
  }
  
  // Update progress if handler is provided
  if (options.onProgress) {
    options.onProgress(0);
  }
  
  // Upload files
  const result = await uploadFiles(inputs.files, (progress) => {
    if (options.onProgress) {
      options.onProgress(progress);
    }
  });
  
  // Associate uploaded files with the workflow execution
  await apiRequest(`/workflows/${workflowId}/nodes/${node.id}/files`, {
    method: 'POST',
    body: JSON.stringify({
      executionId,
      fileIds: result.files.map((f: any) => f.id)
    })
  });
  
  return result;
}