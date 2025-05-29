import { Request, Response } from "express";
import { storage } from "../storage";
import { insertAgentSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { eventBus } from "../services/eventBus";
import { generateTextCompletion } from "../services/mockLLM";

const agentController = {
  /**
   * Get all agents
   */
  getAgents: async (req: Request, res: Response) => {
    try {
      const agents = await storage.getAgents();
      res.json(agents);
    } catch (error) {
      console.error("Error fetching agents:", error);
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  },

  /**
   * Get a specific agent by ID
   */
  getAgent: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid agent ID" });
      }

      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }

      res.json(agent);
    } catch (error) {
      console.error("Error fetching agent:", error);
      res.status(500).json({ message: "Failed to fetch agent" });
    }
  },

  /**
   * Create a new agent
   */
  createAgent: async (req: Request, res: Response) => {
    try {
      // Validate request body
      const parsedData = insertAgentSchema.parse(req.body);
      
      // Check if the associated model exists
      const model = await storage.getModel(parsedData.modelId);
      if (!model) {
        return res.status(400).json({ message: "Model not found" });
      }
      
      // Create the agent
      const agent = await storage.createAgent(parsedData);
      
      // Emit agent created event
      eventBus.emit("agent:created", { agent });
      
      res.status(201).json(agent);
    } catch (error) {
      console.error("Error creating agent:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to create agent" });
    }
  },

  /**
   * Update an existing agent
   */
  updateAgent: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid agent ID" });
      }

      // Validate request body
      const parsedData = insertAgentSchema.parse(req.body);
      
      // Check if the agent exists
      const existingAgent = await storage.getAgent(id);
      if (!existingAgent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      // Check if the associated model exists
      const model = await storage.getModel(parsedData.modelId);
      if (!model) {
        return res.status(400).json({ message: "Model not found" });
      }
      
      // Update the agent
      const updatedAgent = await storage.updateAgent(id, parsedData);
      
      // Emit agent updated event
      eventBus.emit("agent:updated", { agent: updatedAgent });
      
      res.json(updatedAgent);
    } catch (error) {
      console.error("Error updating agent:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to update agent" });
    }
  },

  /**
   * Delete an agent
   */
  deleteAgent: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid agent ID" });
      }

      // Check if the agent exists
      const existingAgent = await storage.getAgent(id);
      if (!existingAgent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      // Delete the agent
      await storage.deleteAgent(id);
      
      // Emit agent deleted event
      eventBus.emit("agent:deleted", { agentId: id });
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting agent:", error);
      res.status(500).json({ message: "Failed to delete agent" });
    }
  },

  /**
   * Run an agent with a specific task
   */
  runAgent: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid agent ID" });
      }

      // Check if the agent exists
      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      // Get the associated model
      const model = await storage.getModel(agent.modelId);
      if (!model) {
        return res.status(500).json({ message: "Agent's model not found" });
      }
      
      // Validate request body
      const { task, inputs = {} } = req.body;
      
      if (!task || typeof task !== "string") {
        return res.status(400).json({ message: "Task is required" });
      }
      
      // Emit agent run event
      eventBus.emit("agent:run:start", { 
        agentId: id, 
        agent,
        task,
        inputs
      });
      
      // Generate agent context from its role and goals
      const goals = Array.isArray(agent.goals) ? agent.goals.join(", ") : agent.goals;
      const agentContext = `You are a ${agent.role} with the following goals: ${goals}.`;
      
      // Run the agent using the mock LLM service
      const prompt = `${agentContext}\n\nTask: ${task}\n\nInputs: ${JSON.stringify(inputs)}\n\nYour response:`;
      
      const result = await generateTextCompletion({
        model: model.name,
        prompt,
        maxTokens: 500,
        temperature: 0.7,
        provider: model.provider
      });
      
      // Emit agent run complete event
      eventBus.emit("agent:run:complete", {
        agentId: id,
        agent,
        result: {
          response: result.text
        }
      });
      
      // Return the agent's response
      const runId = `run-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      res.json({
        runId,
        agent: {
          id: agent.id,
          name: agent.name,
          role: agent.role
        },
        task,
        response: result.text,
        status: "completed",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error running agent:", error);
      res.status(500).json({ message: "Failed to run agent" });
    }
  }
};

export default agentController;
