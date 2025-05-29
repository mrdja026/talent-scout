"""
Agent management API endpoints
Handles agent CRUD operations and related functionality
"""
import time
import random
import logging
import uuid
from datetime import datetime
from flask import request, jsonify, current_app
from flask_restful import Resource, Api
from . import api_bp
from ..models.agent import Agent

# Set up API resources
api = Api(api_bp)

# In-memory storage for agents
# In production, this would be stored in a database
_agents = {}
_next_agent_id = 1

def _initialize_sample_agents():
    """Initialize with sample agents"""
    global _next_agent_id
    
    # Import here to avoid circular imports
    from ..utils.mock_data import generate_agents
    
    sample_agents = generate_agents(3)
    for idx, agent in enumerate(sample_agents, start=1):
        agent_id = idx
        agent['id'] = agent_id
        _agents[agent_id] = agent
        
    # Set next ID after the last one
    _next_agent_id = len(sample_agents) + 1

class AgentListResource(Resource):
    """Resource for agent collection operations"""
    
    def get(self):
        """Get all agents"""
        # Initialize if empty
        if not _agents:
            _initialize_sample_agents()
            
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Getting all agents with {delay:.2f}s delay")
        
        # Return agents
        agents = list(_agents.values())
        return jsonify({
            'agents': agents,
            'count': len(agents)
        })
    
    def post(self):
        """Create a new agent"""
        data = request.get_json() or {}
        
        # Validate required fields
        if 'name' not in data:
            return {'error': 'Agent name is required'}, 400
        if 'capabilities' not in data or not data['capabilities']:
            return {'error': 'Agent capabilities are required'}, 400
            
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Creating new agent with {delay:.2f}s delay")
        
        # Create new agent with an ID
        global _next_agent_id
        agent_id = _next_agent_id
        _next_agent_id += 1
        
        agent = {
            'id': agent_id,
            'name': data['name'],
            'description': data.get('description', ''),
            'capabilities': data['capabilities'],
            'personality': data.get('personality', {}),
            'knowledgeDomains': data.get('knowledgeDomains', []),
            'modelId': data.get('modelId'),
            'systemPrompt': data.get('systemPrompt', ''),
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat(),
            'status': 'active'
        }
        
        # Add to storage
        _agents[agent_id] = agent
        
        return jsonify(agent), 201

class AgentResource(Resource):
    """Resource for individual agent operations"""
    
    def get(self, agent_id):
        """Get a specific agent"""
        # Initialize if empty
        if not _agents:
            _initialize_sample_agents()
            
        # Handle string IDs
        if isinstance(agent_id, str) and agent_id.isdigit():
            agent_id = int(agent_id)
            
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Getting agent {agent_id} with {delay:.2f}s delay")
        
        # Check if agent exists
        if agent_id not in _agents:
            return {'error': 'Agent not found'}, 404
            
        return jsonify(_agents[agent_id])
    
    def put(self, agent_id):
        """Update an agent"""
        data = request.get_json() or {}
        
        # Handle string IDs
        if isinstance(agent_id, str) and agent_id.isdigit():
            agent_id = int(agent_id)
            
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Updating agent {agent_id} with {delay:.2f}s delay")
        
        # Check if agent exists
        if agent_id not in _agents:
            return {'error': 'Agent not found'}, 404
            
        # Update agent
        agent = _agents[agent_id]
        for key, value in data.items():
            if key != 'id' and key != 'createdAt':  # Don't allow changing ID or creation date
                agent[key] = value
                
        # Update the updated timestamp
        agent['updatedAt'] = datetime.now().isoformat()
        
        return jsonify(agent)
    
    def delete(self, agent_id):
        """Delete an agent"""
        # Handle string IDs
        if isinstance(agent_id, str) and agent_id.isdigit():
            agent_id = int(agent_id)
            
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Deleting agent {agent_id} with {delay:.2f}s delay")
        
        # Check if agent exists
        if agent_id not in _agents:
            return {'error': 'Agent not found'}, 404
            
        # Delete agent
        del _agents[agent_id]
        
        return {'message': f'Agent {agent_id} deleted successfully'}, 200

class AgentExecuteResource(Resource):
    """Resource for executing an agent"""
    
    def post(self, agent_id):
        """Execute an agent with provided inputs"""
        data = request.get_json() or {}
        
        # Handle string IDs
        if isinstance(agent_id, str) and agent_id.isdigit():
            agent_id = int(agent_id)
            
        # Simulate network delay (longer for execution)
        delay = random.uniform(
            current_app.config['MIN_LATENCY'] * 2,
            current_app.config['MAX_LATENCY'] * 3
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Executing agent {agent_id} with {delay:.2f}s delay")
        
        # Check if agent exists
        if agent_id not in _agents:
            return {'error': 'Agent not found'}, 404
            
        # Extract inputs
        inputs = data.get('inputs', {})
        execution_context = data.get('context', {})
        
        # Get the agent
        agent = _agents[agent_id]
        
        # Generate a response based on agent capabilities
        response = {
            'agentId': agent_id,
            'executionId': f"exec-{uuid.uuid4().hex[:8]}",
            'timestamp': datetime.now().isoformat(),
            'status': 'completed',
            'result': {
                'content': f"Response from agent '{agent['name']}' with capabilities: {', '.join(agent['capabilities'])}",
                'metadata': {
                    'processingTime': delay,
                    'inputTokens': len(str(inputs)) // 4,  # Rough estimate
                    'outputTokens': 50,  # Rough estimate
                }
            }
        }
        
        # Add specific responses based on agent knowledge domains
        if 'knowledgeDomains' in agent and agent['knowledgeDomains']:
            domains = ', '.join(agent['knowledgeDomains'])
            response['result']['content'] += f"\nI have expertise in: {domains}"
            
        # Add any personality traits to the response
        if 'personality' in agent and agent['personality']:
            traits = []
            for trait, value in agent['personality'].items():
                if value > 0.7:
                    traits.append(f"high {trait}")
                elif value < 0.3:
                    traits.append(f"low {trait}")
            
            if traits:
                traits_str = ', '.join(traits)
                response['result']['content'] += f"\nMy personality traits: {traits_str}"
        
        # Handle any user inputs specifically
        if 'query' in inputs:
            response['result']['content'] += f"\n\nIn response to: '{inputs['query']}'\n"
            response['result']['content'] += "I would need more context to provide a meaningful answer to your specific query."
            
        return jsonify(response)

# Register API resources
api.add_resource(AgentListResource, '/agents')
api.add_resource(AgentResource, '/agents/<agent_id>')
api.add_resource(AgentExecuteResource, '/agents/<agent_id>/execute')