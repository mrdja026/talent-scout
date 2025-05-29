import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import workflowController from "./controllers/workflowController";
import modelController from "./controllers/modelController";
import agentController from "./controllers/agentController";
import templateController from "./controllers/templateController";
import connectorController from "./controllers/connectorController";
import { setupEventBus } from "./services/eventBus";
import { flaskProxyMiddleware, startFlaskAPI } from "./services/flaskProxy";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup event bus for microservices communication
  setupEventBus();
  
  // We're using the Express controllers directly instead of the Flask API
  // app.use(flaskProxyMiddleware);
  // startFlaskAPI();

  // Workflow routes
  app.get("/api/workflows", workflowController.getWorkflows);
  app.get("/api/workflows/:id", workflowController.getWorkflow);
  app.post("/api/workflows", workflowController.createWorkflow);
  app.put("/api/workflows/:id", workflowController.updateWorkflow);
  app.delete("/api/workflows/:id", workflowController.deleteWorkflow);
  app.post("/api/workflows/:id/execute", workflowController.executeWorkflow);

  // Model routes
  app.get("/api/models", modelController.getModels);
  app.get("/api/models/:id", modelController.getModel);
  app.post("/api/models", modelController.createModel);
  app.put("/api/models/:id", modelController.updateModel);
  app.delete("/api/models/:id", modelController.deleteModel);
  app.post("/api/models/:id/generate", modelController.generateText);

  // Agent routes
  app.get("/api/agents", agentController.getAgents);
  app.get("/api/agents/:id", agentController.getAgent);
  app.post("/api/agents", agentController.createAgent);
  app.put("/api/agents/:id", agentController.updateAgent);
  app.delete("/api/agents/:id", agentController.deleteAgent);
  app.post("/api/agents/:id/run", agentController.runAgent);

  // Connector routes
  app.get("/api/connectors", connectorController.getConnectors);
  app.get("/api/connectors/:id", connectorController.getConnector);
  app.post("/api/connectors", connectorController.createConnector);
  app.put("/api/connectors/:id", connectorController.updateConnector);
  app.delete("/api/connectors/:id", connectorController.deleteConnector);
  app.post("/api/connectors/:id/test", connectorController.testConnector);

  // Template routes
  app.get("/api/templates", templateController.getTemplates);
  app.get("/api/templates/:id", templateController.getTemplate);
  app.post("/api/templates", templateController.createTemplate);
  app.post("/api/templates/:id/apply", templateController.applyTemplate);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      version: "0.1.0",
      services: {
        workflow: "active",
        model: "active",
        agent: "active",
        connector: "active",
        storage: "active",
        eventBus: "active"
      }
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
