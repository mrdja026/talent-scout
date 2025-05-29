import { Node, Connection } from "@shared/schema";

/**
 * Template metadata interface
 */
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  nodes: Node[];
  connections: Connection[];
}

/**
 * Keys used for localStorage
 */
const STORAGE_KEYS = {
  TEMPLATES_LIST: 'workflow_templates_list',
  TEMPLATE_PREFIX: 'workflow_template_',
  CURRENT_WORKFLOW: 'current_workflow_session',
};

/**
 * Service for managing workflow templates
 * Handles serialization, saving, and loading of workflow designs
 */
export const workflowTemplateService = {
  /**
   * Save a workflow as a template
   */
  saveTemplate(name: string, description: string, nodes: Node[], connections: Connection[]): WorkflowTemplate {
    // Generate a unique ID for the template
    const id = `template_${Date.now()}`;
    const now = new Date().toISOString();
    
    // Create the template object
    const template: WorkflowTemplate = {
      id,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      nodes,
      connections,
    };
    
    // Save the template to localStorage
    localStorage.setItem(`${STORAGE_KEYS.TEMPLATE_PREFIX}${id}`, JSON.stringify(template));
    
    // Update the templates list
    const templatesList = this.getTemplatesList();
    templatesList.push({
      id,
      name,
      description,
      createdAt: now,
      updatedAt: now,
    });
    
    localStorage.setItem(STORAGE_KEYS.TEMPLATES_LIST, JSON.stringify(templatesList));
    
    return template;
  },
  
  /**
   * Get a list of all saved templates (metadata only)
   */
  getTemplatesList(): Omit<WorkflowTemplate, 'nodes' | 'connections'>[] {
    const listJson = localStorage.getItem(STORAGE_KEYS.TEMPLATES_LIST);
    return listJson ? JSON.parse(listJson) : [];
  },
  
  /**
   * Load a template by ID
   */
  getTemplate(id: string): WorkflowTemplate | null {
    const templateJson = localStorage.getItem(`${STORAGE_KEYS.TEMPLATE_PREFIX}${id}`);
    return templateJson ? JSON.parse(templateJson) : null;
  },
  
  /**
   * Delete a template
   */
  deleteTemplate(id: string): boolean {
    // Remove the template
    localStorage.removeItem(`${STORAGE_KEYS.TEMPLATE_PREFIX}${id}`);
    
    // Update the templates list
    const templatesList = this.getTemplatesList().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES_LIST, JSON.stringify(templatesList));
    
    return true;
  },
  
  /**
   * Update an existing template
   */
  updateTemplate(id: string, updates: Partial<WorkflowTemplate>): WorkflowTemplate | null {
    const template = this.getTemplate(id);
    if (!template) return null;
    
    // Update the template
    const updatedTemplate = {
      ...template,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    // Save the updated template
    localStorage.setItem(`${STORAGE_KEYS.TEMPLATE_PREFIX}${id}`, JSON.stringify(updatedTemplate));
    
    // Update the templates list if name or description changed
    if (updates.name || updates.description) {
      const templatesList = this.getTemplatesList();
      const updatedList = templatesList.map(t => {
        if (t.id === id) {
          return {
            ...t,
            name: updatedTemplate.name,
            description: updatedTemplate.description,
            updatedAt: updatedTemplate.updatedAt,
          };
        }
        return t;
      });
      
      localStorage.setItem(STORAGE_KEYS.TEMPLATES_LIST, JSON.stringify(updatedList));
    }
    
    return updatedTemplate;
  },
  
  /**
   * Save the current workflow to session storage for recovery
   */
  saveCurrentWorkflow(nodes: Node[], connections: Connection[]): void {
    const currentWorkflow = {
      savedAt: new Date().toISOString(),
      nodes,
      connections,
    };
    
    sessionStorage.setItem(STORAGE_KEYS.CURRENT_WORKFLOW, JSON.stringify(currentWorkflow));
  },
  
  /**
   * Get the current workflow from session storage
   */
  getCurrentWorkflow(): { nodes: Node[], connections: Connection[] } | null {
    const workflowJson = sessionStorage.getItem(STORAGE_KEYS.CURRENT_WORKFLOW);
    return workflowJson ? JSON.parse(workflowJson) : null;
  },
  
  /**
   * Clear the current workflow from session storage
   */
  clearCurrentWorkflow(): void {
    sessionStorage.removeItem(STORAGE_KEYS.CURRENT_WORKFLOW);
  },
};