import { Request, Response } from "express";
import { storage } from "../storage";
import { insertWorkflowSchema, workflowSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { eventBus } from "../services/eventBus";

const workflowController = {
  /**
   * Get all workflows
   */
  getWorkflows: async (req: Request, res: Response) => {
    try {
      const workflows = await storage.getWorkflows();
      res.json(workflows);
    } catch (error) {
      console.error("Error fetching workflows:", error);
      res.status(500).json({ message: "Failed to fetch workflows" });
    }
  },

  /**
   * Get a specific workflow by ID
   */
  getWorkflow: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid workflow ID" });
      }

      const workflow = await storage.getWorkflow(id);
      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }

      res.json(workflow);
    } catch (error) {
      console.error("Error fetching workflow:", error);
      res.status(500).json({ message: "Failed to fetch workflow" });
    }
  },

  /**
   * Create a new workflow
   */
  createWorkflow: async (req: Request, res: Response) => {
    try {
      // Validate request body
      const parsedData = insertWorkflowSchema.parse(req.body);
      
      // Create the workflow
      const workflow = await storage.createWorkflow(parsedData);
      
      // Emit workflow created event
      eventBus.emit("workflow:created", { workflow });
      
      res.status(201).json(workflow);
    } catch (error) {
      console.error("Error creating workflow:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to create workflow" });
    }
  },

  /**
   * Update an existing workflow
   */
  updateWorkflow: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid workflow ID" });
      }

      // Validate request body
      const parsedData = insertWorkflowSchema.parse(req.body);
      
      // Check if the workflow exists
      const existingWorkflow = await storage.getWorkflow(id);
      if (!existingWorkflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }
      
      // Update the workflow
      const updatedWorkflow = await storage.updateWorkflow(id, parsedData);
      
      // Emit workflow updated event
      eventBus.emit("workflow:updated", { workflow: updatedWorkflow });
      
      res.json(updatedWorkflow);
    } catch (error) {
      console.error("Error updating workflow:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to update workflow" });
    }
  },

  /**
   * Delete a workflow
   */
  deleteWorkflow: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid workflow ID" });
      }

      // Check if the workflow exists
      const existingWorkflow = await storage.getWorkflow(id);
      if (!existingWorkflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }
      
      // Delete the workflow
      await storage.deleteWorkflow(id);
      
      // Emit workflow deleted event
      eventBus.emit("workflow:deleted", { workflowId: id });
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting workflow:", error);
      res.status(500).json({ message: "Failed to delete workflow" });
    }
  },

  /**
   * Execute a workflow
   */
  executeWorkflow: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid workflow ID" });
      }

      // Check if the workflow exists
      const workflow = await storage.getWorkflow(id);
      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }
      
      // Validate inputs (optional)
      const inputs = req.body.inputs || {};
      
      // Emit workflow execution event
      eventBus.emit("workflow:execute", { 
        workflowId: id, 
        workflow, 
        inputs 
      });
      
      // Return execution ID and status
      const executionId = `exec-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      res.json({
        executionId,
        status: "started",
        message: "Workflow execution started",
        workflow: {
          id: workflow.id,
          name: workflow.name
        }
      });
      
      // In a real implementation, we would track the execution and provide updates
      // Here we'll simulate a completion after a short delay
      setTimeout(() => {
        eventBus.emit("workflow:executed", {
          workflowId: id,
          executionId,
          status: "completed",
          result: {
            success: true,
            output: {
              message: "Workflow executed successfully",
              timestamp: new Date().toISOString()
            }
          }
        });
      }, 2000);
    } catch (error) {
      console.error("Error executing workflow:", error);
      res.status(500).json({ message: "Failed to execute workflow" });
    }
  }
};

export default workflowController;
