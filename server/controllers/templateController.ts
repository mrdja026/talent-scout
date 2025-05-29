import { Request, Response } from "express";
import { storage } from "../storage";
import { eventBus } from "../services/eventBus";

// In-memory template storage
const templates: any[] = [
  {
    id: 1,
    name: "Document Processing Template",
    description: "A template for document processing workflows",
    category: "DOCUMENT_PROCESSING",
    tags: ["document", "analysis", "extraction"],
    workflowDefinition: {
      nodes: [
        {
          id: "node-1",
          type: "fileUpload",
          position: { x: 100, y: 200 },
          data: { 
            acceptedFileTypes: ["pdf", "docx", "txt"],
            maxFileSize: 10
          }
        },
        {
          id: "node-2",
          type: "transform",
          position: { x: 400, y: 200 },
          data: { 
            transformType: "TEXT_EXTRACTION"
          }
        }
      ],
      connections: [
        {
          id: "conn-1",
          source: "node-1",
          target: "node-2"
        }
      ]
    },
    authorId: 1,
    version: "1.0",
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const templateController = {
  /**
   * Get all templates
   */
  getTemplates: async (req: Request, res: Response) => {
    try {
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  },

  /**
   * Get a specific template by ID
   */
  getTemplate: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }

      const template = templates.find(t => t.id === id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  },

  /**
   * Create a new template
   */
  createTemplate: async (req: Request, res: Response) => {
    try {
      const templateData = req.body;
      
      // Generate an ID and add timestamps
      const newTemplate = {
        id: templates.length + 1,
        ...templateData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to templates collection
      templates.push(newTemplate);
      
      // Return the created template
      res.json(newTemplate);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ message: "Failed to create template" });
    }
  },

  /**
   * Apply a template to create a new workflow
   */
  applyTemplate: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }

      const template = templates.find(t => t.id === id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      // Create a new workflow from template
      const newWorkflow = {
        name: `${template.name} - ${new Date().toLocaleString()}`,
        description: `Created from template: ${template.description}`,
        nodes: template.workflowDefinition.nodes,
        connections: template.workflowDefinition.connections,
        version: "1.0",
        status: "draft",
        createdBy: req.body.userId || 1
      };

      // Create workflow using existing controller
      const workflow = await storage.createWorkflow(newWorkflow);
      
      // Emit workflow created event
      eventBus.emit("workflow:created", { workflow, fromTemplate: template.id });
      
      res.json({
        success: true,
        message: "Template applied successfully",
        workflow
      });
    } catch (error) {
      console.error("Error applying template:", error);
      res.status(500).json({ message: "Failed to apply template" });
    }
  }
};

export default templateController;