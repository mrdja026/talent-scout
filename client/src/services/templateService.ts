/**
 * Service for interacting with workflow template API endpoints
 */
import { apiRequest } from './api';

/**
 * Get all workflow templates
 * @returns List of templates
 */
export async function getTemplates() {
  return apiRequest('/templates');
}

/**
 * Get a specific template
 * @param templateId ID of the template
 * @returns Template data
 */
export async function getTemplate(templateId: string) {
  return apiRequest(`/templates/${templateId}`);
}

/**
 * Create a new template from a workflow
 * @param templateData Template data
 * @returns Created template
 */
export async function createTemplate(templateData: any) {
  return apiRequest('/templates', {
    method: 'POST',
    body: JSON.stringify(templateData),
  });
}

/**
 * Delete a template
 * @param templateId ID of the template
 * @returns Deletion status
 */
export async function deleteTemplate(templateId: string) {
  return apiRequest(`/templates/${templateId}`, {
    method: 'DELETE',
  });
}