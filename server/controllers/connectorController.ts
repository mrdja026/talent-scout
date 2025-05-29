import { Request, Response } from "express";
import { storage } from "../storage";
import { insertConnectorSchema } from "@shared/schema";
import { log } from "../vite";

/**
 * Get all connectors
 */
const getConnectors = async (req: Request, res: Response) => {
  try {
    const connectors = await storage.getConnectors();
    res.json(connectors);
  } catch (error) {
    log(`Error getting connectors: ${error}`, "connector-controller");
    res.status(500).json({ error: "Failed to get connectors" });
  }
};

/**
 * Get a single connector by ID
 */
const getConnector = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid connector ID" });
    }

    const connector = await storage.getConnector(id);
    if (!connector) {
      return res.status(404).json({ error: `Connector with ID ${id} not found` });
    }

    res.json(connector);
  } catch (error) {
    log(`Error getting connector: ${error}`, "connector-controller");
    res.status(500).json({ error: "Failed to get connector" });
  }
};

/**
 * Create a new connector
 */
const createConnector = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = insertConnectorSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Invalid connector data",
        details: validationResult.error.errors
      });
    }

    // Create connector
    const connector = await storage.createConnector(validationResult.data);
    res.status(201).json(connector);
  } catch (error) {
    log(`Error creating connector: ${error}`, "connector-controller");
    res.status(500).json({ error: "Failed to create connector" });
  }
};

/**
 * Update an existing connector
 */
const updateConnector = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid connector ID" });
    }

    // Validate request body
    const validationResult = insertConnectorSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Invalid connector data",
        details: validationResult.error.errors
      });
    }

    // Check if connector exists
    const existingConnector = await storage.getConnector(id);
    if (!existingConnector) {
      return res.status(404).json({ error: `Connector with ID ${id} not found` });
    }

    // Update connector
    const updatedConnector = await storage.updateConnector(id, validationResult.data);
    res.json(updatedConnector);
  } catch (error) {
    log(`Error updating connector: ${error}`, "connector-controller");
    res.status(500).json({ error: "Failed to update connector" });
  }
};

/**
 * Delete a connector
 */
const deleteConnector = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid connector ID" });
    }

    // Check if connector exists
    const connector = await storage.getConnector(id);
    if (!connector) {
      return res.status(404).json({ error: `Connector with ID ${id} not found` });
    }

    // Delete connector
    await storage.deleteConnector(id);
    res.status(204).send();
  } catch (error) {
    log(`Error deleting connector: ${error}`, "connector-controller");
    res.status(500).json({ error: "Failed to delete connector" });
  }
};

/**
 * Test a connector connection
 */
const testConnector = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid connector ID" });
    }

    // Check if connector exists
    const connector = await storage.getConnector(id);
    if (!connector) {
      return res.status(404).json({ error: `Connector with ID ${id} not found` });
    }

    // Simulate testing connector connection
    // In a real implementation, this would connect to the actual service
    const isSuccess = Math.random() > 0.2; // 80% success rate for demo purposes
    
    if (isSuccess) {
      res.json({ 
        status: "success", 
        message: "Connection successful",
        connector: connector
      });
    } else {
      res.status(400).json({ 
        status: "error", 
        message: "Connection failed. Please check your configuration."
      });
    }
  } catch (error) {
    log(`Error testing connector: ${error}`, "connector-controller");
    res.status(500).json({ error: "Failed to test connector" });
  }
};

export default {
  getConnectors,
  getConnector,
  createConnector,
  updateConnector,
  deleteConnector,
  testConnector
};