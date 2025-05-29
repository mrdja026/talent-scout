import Sidebar from "@/components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Documentation() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 py-3 px-6">
          <h2 className="text-xl font-medium">Documentation</h2>
        </header>
        
        <div className="flex-1 overflow-auto p-6">
          <Tabs defaultValue="getting-started">
            <div className="flex">
              <div className="w-48 flex-shrink-0">
                <TabsList className="flex flex-col space-y-1 items-start h-auto bg-transparent p-0">
                  <TabsTrigger value="getting-started" className="w-full justify-start px-3">
                    Getting Started
                  </TabsTrigger>
                  <TabsTrigger value="workflows" className="w-full justify-start px-3">
                    Workflows
                  </TabsTrigger>
                  <TabsTrigger value="agents" className="w-full justify-start px-3">
                    Agents
                  </TabsTrigger>
                  <TabsTrigger value="models" className="w-full justify-start px-3">
                    Models
                  </TabsTrigger>
                  <TabsTrigger value="api" className="w-full justify-start px-3">
                    API Reference
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex-1 ml-6">
                <TabsContent value="getting-started">
                  <div className="prose prose-neutral max-w-none">
                    <h1>Getting Started with LocalAgentFlow</h1>
                    
                    <p>
                      LocalAgentFlow is a distributed system for orchestrating AI agents using local language models.
                      This guide will help you get started with the platform.
                    </p>
                    
                    <h2>Installation</h2>
                    
                    <p>
                      To install LocalAgentFlow, follow these steps:
                    </p>
                    
                    <pre><code>{`# Clone the repository
git clone https://github.com/localagentflow/platform.git
cd platform

# Install dependencies
npm install

# Start the application
npm run dev`}</code></pre>
                    
                    <h2>Core Concepts</h2>
                    
                    <h3>Workflows</h3>
                    <p>
                      Workflows are the heart of LocalAgentFlow. They define how agents, models, and data sources
                      interact to accomplish tasks.
                    </p>
                    
                    <h3>Agents</h3>
                    <p>
                      Agents are autonomous entities powered by LLMs that can perform tasks, communicate with each other,
                      and interact with external systems.
                    </p>
                    
                    <h3>Models</h3>
                    <p>
                      LocalAgentFlow uses local large language models for inference, allowing for private and
                      efficient AI processing.
                    </p>
                    
                    <h2>Quick Start</h2>
                    
                    <ol>
                      <li>Navigate to the <strong>Models</strong> section and load a model</li>
                      <li>Go to the <strong>Workflows</strong> section and create a new workflow</li>
                      <li>Add nodes to your workflow by dragging from the node library</li>
                      <li>Connect nodes to create a workflow</li>
                      <li>Configure each node's properties</li>
                      <li>Save and run your workflow</li>
                    </ol>
                  </div>
                </TabsContent>
                
                <TabsContent value="workflows">
                  <div className="prose prose-neutral max-w-none">
                    <h1>Working with Workflows</h1>
                    
                    <p>
                      Workflows in LocalAgentFlow allow you to design complex AI agent processes visually.
                    </p>
                    
                    <h2>Creating a Workflow</h2>
                    
                    <p>
                      To create a workflow:
                    </p>
                    
                    <ol>
                      <li>Navigate to the Workflows section</li>
                      <li>Click the "New Workflow" button</li>
                      <li>Give your workflow a name and description</li>
                      <li>Use the visual editor to add and connect nodes</li>
                    </ol>
                    
                    <h2>Node Types</h2>
                    
                    <h3>Agent Nodes</h3>
                    <p>
                      Agent nodes represent AI agents that can perform tasks based on their defined role and goals.
                    </p>
                    
                    <h3>LLM Nodes</h3>
                    <p>
                      LLM nodes handle interactions with language models, allowing you to generate text, analyze content,
                      or perform other NLP tasks.
                    </p>
                    
                    <h3>Data Nodes</h3>
                    <p>
                      Data nodes connect to external data sources like databases, files, or APIs.
                    </p>
                    
                    <h3>Flow Control Nodes</h3>
                    <p>
                      These nodes control the flow of execution with branches, loops, and conditional logic.
                    </p>
                    
                    <h2>Example Workflow</h2>
                    
                    <p>
                      Here's a simple example of a workflow that analyzes customer data:
                    </p>
                    
                    <ol>
                      <li>Database Connector node retrieves customer data</li>
                      <li>Transform node normalizes the data</li>
                      <li>Llama2 Model node processes the data</li>
                      <li>Analyst Agent node interprets the results</li>
                      <li>Report Generator node creates a final report</li>
                    </ol>
                  </div>
                </TabsContent>
                
                <TabsContent value="agents">
                  <div className="prose prose-neutral max-w-none">
                    <h1>Working with Agents</h1>
                    
                    <p>
                      Agents are autonomous entities powered by LLMs that can perform specific tasks.
                    </p>
                    
                    <h2>Creating an Agent</h2>
                    
                    <p>
                      To create an agent:
                    </p>
                    
                    <ol>
                      <li>Navigate to the Agents section</li>
                      <li>Click the "Create Agent" button</li>
                      <li>Define the agent's name, role, and goals</li>
                      <li>Select the LLM the agent should use</li>
                      <li>Configure memory settings</li>
                    </ol>
                    
                    <h2>Agent Properties</h2>
                    
                    <h3>Role</h3>
                    <p>
                      The role defines what the agent is responsible for, such as "Data Analyst" or "Customer Support".
                    </p>
                    
                    <h3>Goals</h3>
                    <p>
                      Goals define what the agent should achieve, like "Find patterns in customer data" or "Answer user questions".
                    </p>
                    
                    <h3>Memory</h3>
                    <p>
                      Memory determines how much context the agent can retain during a conversation or task.
                    </p>
                    
                    <h3>Model</h3>
                    <p>
                      The language model that powers the agent. Different models have different capabilities and performance characteristics.
                    </p>
                    
                    <h2>Multi-Agent Systems</h2>
                    
                    <p>
                      LocalAgentFlow supports CrewAI-style multi-agent systems, where multiple agents collaborate to solve complex problems.
                      Agents can communicate, share information, and coordinate their actions.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="models">
                  <div className="prose prose-neutral max-w-none">
                    <h1>Working with Models</h1>
                    
                    <p>
                      LocalAgentFlow uses local language models for inference, providing privacy and control over AI processing.
                    </p>
                    
                    <h2>Supported Models</h2>
                    
                    <p>
                      LocalAgentFlow supports various language models:
                    </p>
                    
                    <ul>
                      <li>Llama 2 (7B, 13B, 70B parameters)</li>
                      <li>Mistral (7B parameters)</li>
                      <li>Phi-2 (2.7B parameters)</li>
                      <li>Vicuna (7B, 13B parameters)</li>
                      <li>Other models compatible with Ollama</li>
                    </ul>
                    
                    <h2>Model Management</h2>
                    
                    <h3>Adding a Model</h3>
                    <p>
                      To add a model:
                    </p>
                    
                    <ol>
                      <li>Navigate to the Models section</li>
                      <li>Click "Add Model"</li>
                      <li>Select the model from the available options</li>
                      <li>Download the model (this may take some time)</li>
                    </ol>
                    
                    <h3>Using Models</h3>
                    <p>
                      Once a model is loaded, it can be used by:
                    </p>
                    
                    <ul>
                      <li>Agents for autonomous task completion</li>
                      <li>Model Runner nodes in workflows for text generation</li>
                      <li>API endpoints for direct access</li>
                    </ul>
                    
                    <h2>Model Configuration</h2>
                    
                    <p>
                      Models can be configured with various parameters:
                    </p>
                    
                    <ul>
                      <li><strong>Temperature</strong>: Controls randomness (higher = more creative, lower = more deterministic)</li>
                      <li><strong>Max Tokens</strong>: Maximum length of generated text</li>
                      <li><strong>System Prompt</strong>: Initial instructions for the model</li>
                      <li><strong>Quantization</strong>: Precision level for model weights (affects performance and quality)</li>
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="api">
                  <div className="prose prose-neutral max-w-none">
                    <h1>API Reference</h1>
                    
                    <p>
                      LocalAgentFlow provides RESTful APIs for programmatic access to the platform.
                    </p>
                    
                    <h2>Authentication</h2>
                    
                    <p>
                      All API requests require authentication using an API key:
                    </p>
                    
                    <pre><code>{`curl -X GET http://localhost:8000/api/workflows \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code></pre>
                    
                    <h2>Workflow API</h2>
                    
                    <h3>List Workflows</h3>
                    <pre><code>{`GET /api/workflows`}</code></pre>
                    
                    <h3>Get Workflow</h3>
                    <pre><code>{`GET /api/workflows/{id}`}</code></pre>
                    
                    <h3>Create Workflow</h3>
                    <pre><code>{`POST /api/workflows
Content-Type: application/json

{
  "name": "My Workflow",
  "description": "Workflow description",
  "nodes": [...],
  "connections": [...]
}`}</code></pre>
                    
                    <h3>Update Workflow</h3>
                    <pre><code>{`PUT /api/workflows/{id}
Content-Type: application/json

{
  "name": "Updated Workflow",
  "description": "Updated description",
  "nodes": [...],
  "connections": [...]
}`}</code></pre>
                    
                    <h3>Execute Workflow</h3>
                    <pre><code>{`POST /api/workflows/{id}/execute
Content-Type: application/json

{
  "inputs": {
    "key1": "value1",
    "key2": "value2"
  }
}`}</code></pre>
                    
                    <h2>Agent API</h2>
                    
                    <h3>List Agents</h3>
                    <pre><code>{`GET /api/agents`}</code></pre>
                    
                    <h3>Get Agent</h3>
                    <pre><code>{`GET /api/agents/{id}`}</code></pre>
                    
                    <h3>Create Agent</h3>
                    <pre><code>{`POST /api/agents
Content-Type: application/json

{
  "name": "My Agent",
  "role": "Data Analyst",
  "goals": ["Analyze customer data"],
  "memory": 4096,
  "modelId": 1
}`}</code></pre>
                    
                    <h2>Model API</h2>
                    
                    <h3>List Models</h3>
                    <pre><code>{`GET /api/models`}</code></pre>
                    
                    <h3>Get Model</h3>
                    <pre><code>{`GET /api/models/{id}`}</code></pre>
                    
                    <h3>Text Generation</h3>
                    <pre><code>{`POST /api/models/{id}/generate
Content-Type: application/json

{
  "prompt": "Once upon a time",
  "maxTokens": 100,
  "temperature": 0.7
}`}</code></pre>
                  </div>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
