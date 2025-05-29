Let me now provide you with some helpful curl examples for testing different API endpoints. You can also use the API Testing dashboard we set up at /api-test to test these endpoints with a visual interface.
Example curl commands for API testing:
Workflows API

Get all workflows:

curl -X GET http://localhost:5000/api/workflows

Create a new workflow:

curl -X POST http://localhost:5000/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Workflow",
    "description": "A workflow created for testing",
    "nodes": [
      {
        "id": "node-1",
        "type": "agent",
        "position": { "x": 100, "y": 200 },
        "data": { "agentId": 1, "capabilities": ["TEXT_GENERATION"] }
      }
    ],
    "connections": []
  }'

Get a specific workflow by ID:

curl -X GET http://localhost:5000/api/workflows/1

Update a workflow:

curl -X PUT http://localhost:5000/api/workflows/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Workflow Name",
    "description": "Updated description"
  }'

Delete a workflow:

curl -X DELETE http://localhost:5000/api/workflows/1

Agents API

Get all agents:

curl -X GET http://localhost:5000/api/agents

Create a new agent:

curl -X POST http://localhost:5000/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Agent",
    "description": "A test agent for processing documents",
    "capabilities": ["TEXT_GENERATION", "CLASSIFICATION"],
    "personality": {
      "tone": "PROFESSIONAL",
      "style": "CONCISE",
      "traits": ["ANALYTICAL", "HELPFUL"]
    },
    "knowledgeDomains": ["GENERAL", "TECHNICAL"],
    "configurationOptions": {
      "temperature": 0.7,
      "maxOutputTokens": 2048
    }
  }'

Get a specific agent by ID:

curl -X GET http://localhost:5000/api/agents/1

Execute an agent:

curl -X POST http://localhost:5000/api/agents/1/execute \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": {
      "prompt": "Analyze the following text and summarize the key points",
      "text": "Artificial intelligence has been transforming industries across the globe..."
    },
    "executionOptions": {
      "temperature": 0.5,
      "maxTokens": 500
    }
  }'

Models API

Get all models:

curl -X GET http://localhost:5000/api/models

Create a new model:

curl -X POST http://localhost:5000/api/models \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GPT-4 Model",
    "provider": "OPENAI",
    "modelId": "gpt-4",
    "capabilities": ["TEXT_GENERATION", "CHAT_COMPLETION"],
    "maxContextLength": 8192,
    "defaultTemperature": 0.7,
    "costPerToken": 0.00006,
    "apiKey": "YOUR_API_KEY_HERE"
  }'

Execute a model:

curl -X POST http://localhost:5000/api/models/1/execute \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CHAT_COMPLETION",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "Explain quantum computing in simple terms"
      }
    ],
    "temperature": 0.7,
    "maxTokens": 500
  }'

Executions API

Get execution status:

curl -X GET http://localhost:5000/api/executions/exec-12345

Update node status in execution:

curl -X PUT http://localhost:5000/api/executions/exec-12345/nodes/node-1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED",
    "output": {
      "result": "Text analysis complete",
      "confidence": 0.95
    }
  }'

Interact with a manual node:

curl -X POST http://localhost:5000/api/executions/exec-12345/manual/node-2 \
  -H "Content-Type: application/json" \
  -d '{
    "action": "APPROVE",
    "input": {
      "comment": "Review complete, content approved",
      "reviewerId": 123
    }
  }'

Is there a specific API endpoint you'd like to test or understand better? I can explain more about how any of these endpoints work or provide more detailed examples.