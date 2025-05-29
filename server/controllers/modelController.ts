import { Request, Response } from "express";
import { storage } from "../storage";
import { insertModelSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { eventBus } from "../services/eventBus";
import { generateTextCompletion } from "../services/mockLLM";

const modelController = {
  /**
   * Get all models
   */
  getModels: async (req: Request, res: Response) => {
    try {
      const models = await storage.getModels();
      res.json(models);
    } catch (error) {
      console.error("Error fetching models:", error);
      res.status(500).json({ message: "Failed to fetch models" });
    }
  },

  /**
   * Get a specific model by ID
   */
  getModel: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid model ID" });
      }

      const model = await storage.getModel(id);
      if (!model) {
        return res.status(404).json({ message: "Model not found" });
      }

      res.json(model);
    } catch (error) {
      console.error("Error fetching model:", error);
      res.status(500).json({ message: "Failed to fetch model" });
    }
  },

  /**
   * Create a new model
   */
  createModel: async (req: Request, res: Response) => {
    try {
      // Validate request body
      const parsedData = insertModelSchema.parse(req.body);
      
      // Create the model
      const model = await storage.createModel(parsedData);
      
      // Emit model created event
      eventBus.emit("model:created", { model });
      
      res.status(201).json(model);
    } catch (error) {
      console.error("Error creating model:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to create model" });
    }
  },

  /**
   * Update an existing model
   */
  updateModel: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid model ID" });
      }

      // Validate request body
      const parsedData = insertModelSchema.parse(req.body);
      
      // Check if the model exists
      const existingModel = await storage.getModel(id);
      if (!existingModel) {
        return res.status(404).json({ message: "Model not found" });
      }
      
      // Update the model
      const updatedModel = await storage.updateModel(id, parsedData);
      
      // Emit model updated event
      eventBus.emit("model:updated", { model: updatedModel });
      
      res.json(updatedModel);
    } catch (error) {
      console.error("Error updating model:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to update model" });
    }
  },

  /**
   * Delete a model
   */
  deleteModel: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid model ID" });
      }

      // Check if the model exists
      const existingModel = await storage.getModel(id);
      if (!existingModel) {
        return res.status(404).json({ message: "Model not found" });
      }
      
      // Delete the model
      await storage.deleteModel(id);
      
      // Emit model deleted event
      eventBus.emit("model:deleted", { modelId: id });
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting model:", error);
      res.status(500).json({ message: "Failed to delete model" });
    }
  },

  /**
   * Generate text using a model
   */
  generateText: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid model ID" });
      }

      // Check if the model exists
      const model = await storage.getModel(id);
      if (!model) {
        return res.status(404).json({ message: "Model not found" });
      }
      
      // Validate request body
      const { prompt, maxTokens = 100, temperature = 0.7 } = req.body;
      
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ message: "Invalid prompt" });
      }
      
      // Log model request
      console.log(`Generating text with model ${model.name}, prompt: "${prompt.substring(0, 50)}..."`);
      
      // Emit model generate event
      eventBus.emit("model:generate:start", { 
        modelId: id, 
        model,
        prompt,
        maxTokens,
        temperature
      });
      
      // Generate text using the mock LLM service
      const result = await generateTextCompletion({
        model: model.name,
        prompt,
        maxTokens,
        temperature,
        provider: model.provider
      });
      
      // Emit model generate complete event
      eventBus.emit("model:generate:complete", {
        modelId: id,
        model,
        result
      });
      
      res.json({
        id: `gen-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        model: model.name,
        generated_text: result.text,
        usage: {
          prompt_tokens: prompt.length / 4, // Rough approximation
          completion_tokens: result.text.length / 4,
          total_tokens: (prompt.length + result.text.length) / 4
        },
        finish_reason: result.finishReason
      });
    } catch (error) {
      console.error("Error generating text:", error);
      res.status(500).json({ message: "Failed to generate text" });
    }
  }
};

export default modelController;
