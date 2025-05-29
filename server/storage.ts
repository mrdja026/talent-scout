import { 
  users, type User, type InsertUser,
  workflows, type Workflow, type InsertWorkflow,
  agents, type Agent, type InsertAgent,
  models, type Model, type InsertModel,
  connectors, type Connector, type InsertConnector
} from "@shared/schema";

// Storage interface defining all supported operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Workflow operations
  getWorkflows(): Promise<Workflow[]>;
  getWorkflow(id: number): Promise<Workflow | undefined>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, workflow: InsertWorkflow): Promise<Workflow>;
  deleteWorkflow(id: number): Promise<void>;
  
  // Agent operations
  getAgents(): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: number, agent: InsertAgent): Promise<Agent>;
  deleteAgent(id: number): Promise<void>;
  
  // Model operations
  getModels(): Promise<Model[]>;
  getModel(id: number): Promise<Model | undefined>;
  createModel(model: InsertModel): Promise<Model>;
  updateModel(id: number, model: InsertModel): Promise<Model>;
  deleteModel(id: number): Promise<void>;
  
  // Connector operations
  getConnectors(): Promise<Connector[]>;
  getConnector(id: number): Promise<Connector | undefined>;
  createConnector(connector: InsertConnector): Promise<Connector>;
  updateConnector(id: number, connector: InsertConnector): Promise<Connector>;
  deleteConnector(id: number): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private workflows: Map<number, Workflow>;
  private agents: Map<number, Agent>;
  private models: Map<number, Model>;
  private connectors: Map<number, Connector>;
  
  private userIdCounter: number;
  private workflowIdCounter: number;
  private agentIdCounter: number;
  private modelIdCounter: number;
  private connectorIdCounter: number;

  constructor() {
    this.users = new Map();
    this.workflows = new Map();
    this.agents = new Map();
    this.models = new Map();
    this.connectors = new Map();
    
    this.userIdCounter = 1;
    this.workflowIdCounter = 1;
    this.agentIdCounter = 1;
    this.modelIdCounter = 1;
    this.connectorIdCounter = 1;
    
    this.initializeSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Workflow methods
  async getWorkflows(): Promise<Workflow[]> {
    return Array.from(this.workflows.values());
  }

  async getWorkflow(id: number): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }

  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const id = this.workflowIdCounter++;
    const now = new Date();
    const workflow: Workflow = { 
      ...insertWorkflow, 
      id,
      lastSaved: now 
    };
    this.workflows.set(id, workflow);
    return workflow;
  }

  async updateWorkflow(id: number, insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const existingWorkflow = await this.getWorkflow(id);
    if (!existingWorkflow) {
      throw new Error(`Workflow with id ${id} not found`);
    }
    
    const now = new Date();
    const updatedWorkflow: Workflow = {
      ...existingWorkflow,
      ...insertWorkflow,
      id,
      lastSaved: now
    };
    
    this.workflows.set(id, updatedWorkflow);
    return updatedWorkflow;
  }

  async deleteWorkflow(id: number): Promise<void> {
    this.workflows.delete(id);
  }

  // Agent methods
  async getAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    return this.agents.get(id);
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = this.agentIdCounter++;
    const agent: Agent = { ...insertAgent, id };
    this.agents.set(id, agent);
    return agent;
  }

  async updateAgent(id: number, insertAgent: InsertAgent): Promise<Agent> {
    const existingAgent = await this.getAgent(id);
    if (!existingAgent) {
      throw new Error(`Agent with id ${id} not found`);
    }
    
    const updatedAgent: Agent = {
      ...existingAgent,
      ...insertAgent,
      id
    };
    
    this.agents.set(id, updatedAgent);
    return updatedAgent;
  }

  async deleteAgent(id: number): Promise<void> {
    this.agents.delete(id);
  }

  // Model methods
  async getModels(): Promise<Model[]> {
    return Array.from(this.models.values());
  }

  async getModel(id: number): Promise<Model | undefined> {
    return this.models.get(id);
  }

  async createModel(insertModel: InsertModel): Promise<Model> {
    const id = this.modelIdCounter++;
    const model: Model = { ...insertModel, id };
    this.models.set(id, model);
    return model;
  }

  async updateModel(id: number, insertModel: InsertModel): Promise<Model> {
    const existingModel = await this.getModel(id);
    if (!existingModel) {
      throw new Error(`Model with id ${id} not found`);
    }
    
    const updatedModel: Model = {
      ...existingModel,
      ...insertModel,
      id
    };
    
    this.models.set(id, updatedModel);
    return updatedModel;
  }

  async deleteModel(id: number): Promise<void> {
    this.models.delete(id);
  }

  // Connector methods
  async getConnectors(): Promise<Connector[]> {
    return Array.from(this.connectors.values());
  }

  async getConnector(id: number): Promise<Connector | undefined> {
    return this.connectors.get(id);
  }

  async createConnector(insertConnector: InsertConnector): Promise<Connector> {
    const id = this.connectorIdCounter++;
    const connector: Connector = { ...insertConnector, id };
    this.connectors.set(id, connector);
    return connector;
  }

  async updateConnector(id: number, insertConnector: InsertConnector): Promise<Connector> {
    const existingConnector = await this.getConnector(id);
    if (!existingConnector) {
      throw new Error(`Connector with id ${id} not found`);
    }
    
    const updatedConnector: Connector = {
      ...existingConnector,
      ...insertConnector,
      id
    };
    
    this.connectors.set(id, updatedConnector);
    return updatedConnector;
  }

  async deleteConnector(id: number): Promise<void> {
    this.connectors.delete(id);
  }

  // Initialize sample data
  private initializeSampleData(): void {
    // Create sample user
    const user: User = {
      id: this.userIdCounter++,
      username: 'admin',
      password: 'admin123'
    };
    this.users.set(user.id, user);

    // Create sample models
    const models: InsertModel[] = [
      {
        name: "Llama2 7B",
        provider: "Meta",
        parameters: {
          size: "7B parameters",
          quantization: "4-bit",
          contextLength: 4096
        },
        status: "loaded"
      },
      {
        name: "Llama2 13B",
        provider: "Meta",
        parameters: {
          size: "13B parameters",
          quantization: "5-bit",
          contextLength: 4096
        },
        status: "loaded"
      },
      {
        name: "Mistral 7B",
        provider: "Mistral AI",
        parameters: {
          size: "7B parameters",
          quantization: "4-bit",
          contextLength: 8192
        },
        status: "loaded"
      },
      {
        name: "Phi-2",
        provider: "Microsoft",
        parameters: {
          size: "2.7B parameters",
          quantization: "4-bit",
          contextLength: 2048
        },
        status: "available"
      }
    ];

    models.forEach(model => {
      const id = this.modelIdCounter++;
      this.models.set(id, { ...model, id });
    });

    // Create sample agents
    const agents: InsertAgent[] = [
      {
        name: "Data Analyst",
        role: "Data Analysis",
        goals: ["Analyze customer data patterns", "Identify growth opportunities"],
        memory: 4096,
        modelId: 1
      },
      {
        name: "Research Assistant",
        role: "Information Retrieval",
        goals: ["Find relevant information in documents", "Summarize key findings"],
        memory: 8192,
        modelId: 2
      },
      {
        name: "Customer Support",
        role: "Support",
        goals: ["Answer customer questions", "Resolve issues efficiently"],
        memory: 4096,
        modelId: 3
      }
    ];

    agents.forEach(agent => {
      const id = this.agentIdCounter++;
      this.agents.set(id, { ...agent, id });
    });

    // Create sample connectors
    const connectors: InsertConnector[] = [
      {
        name: "PostgreSQL Database",
        type: "database",
        config: {
          host: "localhost",
          port: 5432,
          database: "customer_data",
          useSSL: true
        },
        status: "configured"
      },
      {
        name: "Google Drive",
        type: "storage",
        config: {
          clientId: "mock-client-id",
          scopes: ["files.read", "files.write"],
          redirectUri: "http://localhost:5000/auth/callback"
        },
        status: "configured"
      },
      {
        name: "Slack API",
        type: "communication",
        config: {
          token: "xoxb-mock-token",
          channels: ["general", "support"],
          notificationLevel: "medium"
        },
        status: "configured"
      }
    ];

    connectors.forEach(connector => {
      const id = this.connectorIdCounter++;
      this.connectors.set(id, { ...connector, id });
    });

    // Create sample workflow
    const sampleWorkflow: InsertWorkflow = {
      name: "Customer Analysis Pipeline",
      description: "Analyze customer data and generate insights report",
      nodes: [
        {
          id: "node1",
          type: "dataSource",
          position: { x: 100, y: 200 },
          data: {
            label: "Database Connector",
            icon: "storage",
            color: "secondary",
            connection: "PostgreSQL",
            query: "SELECT * FROM customer_data"
          },
          width: 256,
          height: 160
        },
        {
          id: "node2",
          type: "transform",
          position: { x: 450, y: 200 },
          data: {
            label: "Data Transformer",
            icon: "transform",
            color: "secondary-light",
            action: "Normalize text data",
            format: "JSON output"
          },
          width: 256,
          height: 160
        },
        {
          id: "node3",
          type: "modelRunner",
          position: { x: 800, y: 200 },
          data: {
            label: "Llama2 7B Model",
            icon: "model_training",
            color: "primary",
            model: "Llama2 7B",
            mode: "Text Generation",
            temperature: 0.7,
            maxTokens: 512,
            systemPrompt: "You are an AI assistant that analyzes customer data and identifies patterns and trends."
          },
          width: 256,
          height: 160
        },
        {
          id: "node4",
          type: "agent",
          position: { x: 1150, y: 200 },
          data: {
            label: "Analyst Agent",
            icon: "smart_toy",
            color: "accent",
            role: "Data Analyst",
            goal: "Analyze customer patterns",
            memory: "4KB context"
          },
          width: 256,
          height: 160
        },
        {
          id: "node5",
          type: "output",
          position: { x: 1500, y: 200 },
          data: {
            label: "Report Generator",
            icon: "description",
            color: "gray-500",
            format: "Markdown",
            output: "Customer Insights Report"
          },
          width: 256,
          height: 160
        }
      ],
      connections: [
        {
          id: "conn1",
          source: "node1",
          target: "node2"
        },
        {
          id: "conn2",
          source: "node2",
          target: "node3"
        },
        {
          id: "conn3",
          source: "node3",
          target: "node4"
        },
        {
          id: "conn4",
          source: "node4",
          target: "node5"
        }
      ],
      createdBy: user.id,
      status: "draft",
      version: "0.1"
    };

    const workflowId = this.workflowIdCounter++;
    this.workflows.set(workflowId, { 
      ...sampleWorkflow, 
      id: workflowId,
      lastSaved: new Date()
    });

    console.log("[Storage] Sample data initialized");
  }
}

// Create singleton instance for the application
export const storage = new MemStorage();
