/**
 * Service for managing workflow storage and persistence
 */
import { storage } from "@server/storage";
import { apiRequest } from './api';
import { Workflow, Node, Connection } from '@shared/schema';
import { Template } from '@shared/workflowTemplate';
import { WorkflowExecutionState } from '@shared/workflowExecution';
import { generateId, generateWorkflow, generateTemplates } from '@shared/mockData';

// Key for localStorage template storage
const TEMPLATE_STORAGE_KEY = 'workflow_templates';

/**
 * Get all workflows
 * @returns Promise resolving to array of workflows
 */
export async function getWorkflows(): Promise<Workflow[]> {
  try {
    // First attempt to fetch from API
    const response = await apiRequest<{ workflows: Workflow[] }>('/workflows');
    return response.workflows;
  } catch (error) {
    console.error('Error fetching workflows from API:', error);
    
    // Fallback to local storage
    try {
      const workflows = await storage.getWorkflows();
      return workflows;
    } catch (storageError) {
      console.error('Error fetching workflows from storage:', storageError);
      
      // Generate mock data as last resort
      return [generateWorkflow(), generateWorkflow()];
    }
  }
}

/**
 * Get a specific workflow by ID
 * @param id Workflow ID
 * @returns Promise resolving to workflow or null if not found
 */
export async function getWorkflow(id: number): Promise<Workflow | null> {
  try {
    // First attempt to fetch from API
    const workflow = await apiRequest<Workflow>(`/workflows/${id}`);
    return workflow;
  } catch (error) {
    console.error(`Error fetching workflow ${id} from API:`, error);
    
    // Fallback to local storage
    try {
      const workflow = await storage.getWorkflow(id);
      return workflow || null;
    } catch (storageError) {
      console.error(`Error fetching workflow ${id} from storage:`, storageError);
      return null;
    }
  }
}

/**
 * Create a new workflow
 * @param workflow Workflow data
 * @returns Promise resolving to created workflow
 */
export async function createWorkflow(workflow: Omit<Workflow, 'id'>): Promise<Workflow> {
  try {
    // First attempt to create via API
    const newWorkflow = await apiRequest<Workflow>('/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow)
    });
    return newWorkflow;
  } catch (error) {
    console.error('Error creating workflow via API:', error);
    
    // Fallback to local storage
    try {
      // Ensure necessary fields have default values
      const workflowToCreate = {
        ...workflow,
        createdBy: workflow.createdBy || 1,
        status: workflow.status || 'draft',
        version: workflow.version || '1.0',
        lastSaved: workflow.lastSaved || new Date().toISOString()
      };
      
      const newWorkflow = await storage.createWorkflow(workflowToCreate);
      return newWorkflow;
    } catch (storageError) {
      console.error('Error creating workflow in storage:', storageError);
      throw storageError;
    }
  }
}

/**
 * Update an existing workflow
 * @param id Workflow ID
 * @param workflow Updated workflow data
 * @returns Promise resolving to updated workflow
 */
export async function updateWorkflow(id: number, workflow: Partial<Workflow>): Promise<Workflow> {
  try {
    // First attempt to update via API
    const updatedWorkflow = await apiRequest<Workflow>(`/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workflow)
    });
    return updatedWorkflow;
  } catch (error) {
    console.error(`Error updating workflow ${id} via API:`, error);
    
    // Fallback to local storage
    try {
      // Get current workflow first
      const currentWorkflow = await storage.getWorkflow(id);
      
      if (!currentWorkflow) {
        throw new Error(`Workflow ${id} not found`);
      }
      
      // Update timestamp
      const workflowToUpdate = {
        ...workflow,
        lastSaved: new Date().toISOString()
      };
      
      const updatedWorkflow = await storage.updateWorkflow(id, workflowToUpdate);
      return updatedWorkflow;
    } catch (storageError) {
      console.error(`Error updating workflow ${id} in storage:`, storageError);
      throw storageError;
    }
  }
}

/**
 * Delete a workflow
 * @param id Workflow ID
 * @returns Promise resolving when deletion is complete
 */
export async function deleteWorkflow(id: number): Promise<void> {
  try {
    // First attempt to delete via API
    await apiRequest(`/workflows/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error(`Error deleting workflow ${id} via API:`, error);
    
    // Fallback to local storage
    try {
      await storage.deleteWorkflow(id);
    } catch (storageError) {
      console.error(`Error deleting workflow ${id} from storage:`, storageError);
      throw storageError;
    }
  }
}

/**
 * Execute a workflow
 * @param id Workflow ID
 * @param inputs Optional workflow inputs
 * @returns Promise resolving to execution result
 */
export async function executeWorkflow(id: number, inputs?: Record<string, any>): Promise<{ executionId: string }> {
  try {
    // Execute via API
    const result = await apiRequest(`/workflows/${id}/execute`, {
      method: 'POST',
      body: JSON.stringify({ inputs })
    });
    return result;
  } catch (error) {
    console.error(`Error executing workflow ${id}:`, error);
    throw error;
  }
}

/**
 * Get workflow templates from localStorage
 * @returns Array of workflow templates
 */
export function getWorkflowTemplates(): Template[] {
  try {
    const templatesJson = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (templatesJson) {
      return JSON.parse(templatesJson);
    }
    
    // If no templates found, generate mock ones and save them
    const templates = generateTemplates(3);
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
    return templates;
  } catch (error) {
    console.error('Error getting workflow templates:', error);
    
    // Return empty array on error
    return [];
  }
}

/**
 * Save a workflow as a template
 * @param workflow Workflow to save as template
 * @param templateName Name for the template
 * @param description Optional description
 * @returns Created template
 */
export function saveWorkflowAsTemplate(
  workflow: Workflow,
  templateName: string,
  description?: string
): Template {
  try {
    // Create template object
    const template: Template = {
      id: generateId('tmpl-'),
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
    
    // Get existing templates
    const templates = getWorkflowTemplates();
    
    // Add new template
    templates.push(template);
    
    // Save updated templates
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
    
    return template;
  } catch (error) {
    console.error('Error saving workflow as template:', error);
    throw error;
  }
}

/**
 * Delete a workflow template
 * @param templateId Template ID
 * @returns True if deletion was successful
 */
export function deleteWorkflowTemplate(templateId: string): boolean {
  try {
    // Get existing templates
    const templates = getWorkflowTemplates();
    
    // Find template index
    const index = templates.findIndex(t => t.id === templateId);
    
    if (index === -1) {
      return false;
    }
    
    // Remove template
    templates.splice(index, 1);
    
    // Save updated templates
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
    
    return true;
  } catch (error) {
    console.error(`Error deleting template ${templateId}:`, error);
    return false;
  }
}

/**
 * Create a workflow from a template
 * @param templateId Template ID
 * @param newName Optional name for the new workflow
 * @returns Created workflow
 */
export async function createWorkflowFromTemplate(
  templateId: string,
  newName?: string
): Promise<Workflow> {
  try {
    // Get templates
    const templates = getWorkflowTemplates();
    
    // Find template
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }
    
    // Create workflow data
    const workflowData = {
      name: newName || `${template.name} Copy`,
      description: template.description || '',
      nodes: template.nodes,
      connections: template.connections,
      createdBy: 1,
      status: 'draft',
      version: '1.0',
      lastSaved: new Date().toISOString()
    };
    
    // Create workflow
    const workflow = await createWorkflow(workflowData);
    
    // Update template usage count
    template.usageCount = (template.usageCount || 0) + 1;
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
    
    return workflow;
  } catch (error) {
    console.error(`Error creating workflow from template ${templateId}:`, error);
    throw error;
  }
}