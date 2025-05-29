/**
 * API service for making requests to the backend
 */

// Base URL for API requests
const API_BASE_URL = '/api';

/**
 * Make a request to the API
 * @param endpoint API endpoint
 * @param options Request options
 * @returns Response data
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Make the request
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  
  // Handle different response types
  const data = isJson ? await response.json() : await response.text();
  
  // Handle error responses
  if (!response.ok) {
    const error = isJson ? data.error || data.message || 'Unknown error' : 'Network error';
    throw new Error(error);
  }
  
  return data as T;
}

/**
 * Upload files to the API
 * @param files List of files to upload
 * @param onProgress Progress callback
 * @returns Response data
 */
export async function uploadFiles(
  files: File[],
  onProgress?: (progress: number) => void
): Promise<any> {
  // Create form data
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  
  // Create request with progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });
    }
    
    // Handle response
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } catch (e) {
          resolve(xhr.responseText);
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };
    
    // Handle errors
    xhr.onerror = () => {
      reject(new Error('Network error during upload'));
    };
    
    // Send the request
    xhr.open('POST', `${API_BASE_URL}/files/upload`);
    xhr.send(formData);
  });
}

// Agent API

export interface Agent {
  id: number;
  name: string;
  role: string;
  goals: string[];
  memory: number;
  modelId: number;
  status?: string;
}

export interface CreateAgentPayload {
  name: string;
  role: string;
  goals: string[];
  memory: number;
  modelId: number;
}

/**
 * Get all agents
 * @returns List of agents
 */
export async function getAgents(): Promise<Agent[]> {
  return apiRequest<Agent[]>('/agents');
}

/**
 * Get a single agent by ID
 * @param id Agent ID
 * @returns Agent data
 */
export async function getAgent(id: number): Promise<Agent> {
  return apiRequest<Agent>(`/agents/${id}`);
}

/**
 * Create a new agent
 * @param agent Agent data
 * @returns Created agent
 */
export async function createAgent(agent: CreateAgentPayload): Promise<Agent> {
  return apiRequest<Agent>('/agents', {
    method: 'POST',
    body: JSON.stringify(agent),
  });
}

/**
 * Update an existing agent
 * @param id Agent ID
 * @param agent Agent data
 * @returns Updated agent
 */
export async function updateAgent(id: number, agent: Partial<CreateAgentPayload>): Promise<Agent> {
  return apiRequest<Agent>(`/agents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(agent),
  });
}

/**
 * Delete an agent
 * @param id Agent ID
 */
export async function deleteAgent(id: number): Promise<void> {
  return apiRequest<void>(`/agents/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Run an agent
 * @param id Agent ID
 * @param input Input data for the agent
 * @returns Agent execution result
 */
export async function runAgent(id: number, input: any = {}): Promise<any> {
  return apiRequest<any>(`/agents/${id}/run`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

// Model API

export interface Model {
  id: number;
  name: string;
  provider: string;
  parameters: {
    modelType?: string;
    capabilities?: string[];
    contextSize?: number;
    apiKey?: string;
    endpoint?: string;
  };
  status: string;
}

export interface CreateModelPayload {
  name: string;
  provider: string;
  parameters: {
    modelType?: string;
    capabilities?: string[];
    contextSize?: number;
    apiKey?: string;
    endpoint?: string;
  };
  status?: string;
}

/**
 * Get all models
 * @returns List of models
 */
export async function getModels(): Promise<Model[]> {
  return apiRequest<Model[]>('/models');
}

/**
 * Get a single model by ID
 * @param id Model ID
 * @returns Model data
 */
export async function getModel(id: number): Promise<Model> {
  return apiRequest<Model>(`/models/${id}`);
}

/**
 * Create a new model
 * @param model Model data
 * @returns Created model
 */
export async function createModel(model: CreateModelPayload): Promise<Model> {
  return apiRequest<Model>('/models', {
    method: 'POST',
    body: JSON.stringify(model),
  });
}

/**
 * Update an existing model
 * @param id Model ID
 * @param model Model data
 * @returns Updated model
 */
export async function updateModel(id: number, model: Partial<CreateModelPayload>): Promise<Model> {
  return apiRequest<Model>(`/models/${id}`, {
    method: 'PUT',
    body: JSON.stringify(model),
  });
}

/**
 * Delete a model
 * @param id Model ID
 */
export async function deleteModel(id: number): Promise<void> {
  return apiRequest<void>(`/models/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Generate text with a model
 * @param id Model ID
 * @param input Input data for text generation
 * @returns Generated text
 */
export async function generateText(id: number, input: { prompt: string, maxTokens?: number, temperature?: number }): Promise<any> {
  return apiRequest<any>(`/models/${id}/generate`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

// Connector API

export interface Connector {
  id: number;
  name: string;
  type: string;
  description: string;
  config: Record<string, any>;
  status?: string;
}

export interface CreateConnectorPayload {
  name: string;
  type: string;
  description: string;
  config: Record<string, any>;
}

/**
 * Get all connectors
 * @returns List of connectors
 */
export async function getConnectors(): Promise<Connector[]> {
  return apiRequest<Connector[]>('/connectors');
}

/**
 * Get a single connector by ID
 * @param id Connector ID
 * @returns Connector data
 */
export async function getConnector(id: number): Promise<Connector> {
  return apiRequest<Connector>(`/connectors/${id}`);
}

/**
 * Create a new connector
 * @param connector Connector data
 * @returns Created connector
 */
export async function createConnector(connector: CreateConnectorPayload): Promise<Connector> {
  return apiRequest<Connector>('/connectors', {
    method: 'POST',
    body: JSON.stringify(connector),
  });
}

/**
 * Update an existing connector
 * @param id Connector ID
 * @param connector Connector data
 * @returns Updated connector
 */
export async function updateConnector(id: number, connector: Partial<CreateConnectorPayload>): Promise<Connector> {
  return apiRequest<Connector>(`/connectors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(connector),
  });
}

/**
 * Delete a connector
 * @param id Connector ID
 */
export async function deleteConnector(id: number): Promise<void> {
  return apiRequest<void>(`/connectors/${id}`, {
    method: 'DELETE',
  });
}