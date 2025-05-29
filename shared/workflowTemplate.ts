/**
 * Workflow template models and utilities
 */
import { z } from "zod";
import { nodeSchema, connectionSchema } from "./schema";

/**
 * Template category
 */
export const TemplateCategory = z.enum([
  "general",     // General purpose templates
  "document",    // Document processing
  "data",        // Data processing
  "ai",          // AI and LLM integrations
  "custom",      // User-created templates
  "featured"     // Featured/recommended templates
]);

export type TemplateCategory = z.infer<typeof TemplateCategory>;

/**
 * Template tags
 */
export const TemplateTags = z.array(z.string());
export type TemplateTags = z.infer<typeof TemplateTags>;

/**
 * Template schema
 */
export const templateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  category: TemplateCategory.optional().default("custom"),
  tags: TemplateTags.optional().default([]),
  nodes: z.array(nodeSchema),
  connections: z.array(connectionSchema),
  thumbnail: z.string().optional(),
  creator: z.string().or(z.number()).optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  version: z.string().optional().default("1.0"),
  metadata: z.record(z.any()).optional(),
  isPublic: z.boolean().optional().default(false),
  usageCount: z.number().optional().default(0)
});

export type Template = z.infer<typeof templateSchema>;

/**
 * Template list item (condensed version for listing)
 */
export const templateListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: TemplateCategory,
  tags: TemplateTags.optional(),
  thumbnail: z.string().optional(),
  creator: z.string().or(z.number()).optional(),
  createdAt: z.string(),
  version: z.string().optional(),
  isPublic: z.boolean().optional(),
  usageCount: z.number().optional(),
  nodeCount: z.number().optional()
});

export type TemplateListItem = z.infer<typeof templateListItemSchema>;

/**
 * Template creation request
 */
export const createTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  category: TemplateCategory.optional(),
  tags: TemplateTags.optional(),
  workflowId: z.string().or(z.number()).optional(),
  nodes: z.array(nodeSchema).optional(),
  connections: z.array(connectionSchema).optional(),
  isPublic: z.boolean().optional()
});

export type CreateTemplateRequest = z.infer<typeof createTemplateSchema>;

/**
 * Template update request
 */
export const updateTemplateSchema = createTemplateSchema.partial().extend({
  id: z.string(),
});

export type UpdateTemplateRequest = z.infer<typeof updateTemplateSchema>;

/**
 * Converts a template to a workflow-compatible format
 * @param template Template to convert
 * @param newName Optional new name for the workflow
 * @returns Workflow data
 */
export function templateToWorkflow(template: Template, newName?: string) {
  return {
    name: newName || `${template.name} Copy`,
    description: template.description,
    nodes: template.nodes,
    connections: template.connections,
    status: "draft",
    version: "1.0",
    metadata: {
      templateId: template.id,
      templateVersion: template.version,
      createdFrom: "template"
    }
  };
}