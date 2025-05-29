"""
LLM model management API endpoints
Handles model CRUD operations and related functionality
"""
import time
import random
import logging
import uuid
from datetime import datetime
from flask import request, jsonify, current_app
from flask_restful import Resource, Api
from . import api_bp

# Set up API resources
api = Api(api_bp)

# In-memory storage for models
# In production, this would be stored in a database
_models = {}
_next_model_id = 1

def _initialize_sample_models():
    """Initialize with sample models"""
    global _next_model_id
    
    # Import here to avoid circular imports
    from ..utils.mock_data import generate_LLM_models
    
    sample_models = generate_LLM_models(4)
    for idx, model in enumerate(sample_models, start=1):
        model_id = idx
        model['id'] = model_id
        _models[model_id] = model
        
    # Set next ID after the last one
    _next_model_id = len(sample_models) + 1

class ModelListResource(Resource):
    """Resource for model collection operations"""
    
    def get(self):
        """Get all models"""
        # Initialize if empty
        if not _models:
            _initialize_sample_models()
            
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Getting all models with {delay:.2f}s delay")
        
        # Return models
        models = list(_models.values())
        return jsonify({
            'models': models,
            'count': len(models)
        })
    
    def post(self):
        """Create a new model"""
        data = request.get_json() or {}
        
        # Validate required fields
        if 'name' not in data:
            return {'error': 'Model name is required'}, 400
        if 'provider' not in data:
            return {'error': 'Model provider is required'}, 400
        if 'modelId' not in data:
            return {'error': 'Model ID is required'}, 400
            
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Creating new model with {delay:.2f}s delay")
        
        # Create new model with an ID
        global _next_model_id
        id = _next_model_id
        _next_model_id += 1
        
        model = {
            'id': id,
            'name': data['name'],
            'description': data.get('description', ''),
            'provider': data['provider'], 
            'modelId': data['modelId'],
            'version': data.get('version', '1.0'),
            'capabilities': data.get('capabilities', []),
            'contextWindow': data.get('contextWindow', 4000),
            'maxTokens': data.get('maxTokens', 1000),
            'apiEndpoint': data.get('apiEndpoint', ''),
            'parameters': data.get('parameters', {}),
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat(),
            'status': 'active'
        }
        
        # Add to storage
        _models[id] = model
        
        return jsonify(model), 201

class ModelResource(Resource):
    """Resource for individual model operations"""
    
    def get(self, model_id):
        """Get a specific model"""
        # Initialize if empty
        if not _models:
            _initialize_sample_models()
            
        # Handle string IDs
        if isinstance(model_id, str) and model_id.isdigit():
            model_id = int(model_id)
            
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Getting model {model_id} with {delay:.2f}s delay")
        
        # Check if model exists
        if model_id not in _models:
            return {'error': 'Model not found'}, 404
            
        return jsonify(_models[model_id])
    
    def put(self, model_id):
        """Update a model"""
        data = request.get_json() or {}
        
        # Handle string IDs
        if isinstance(model_id, str) and model_id.isdigit():
            model_id = int(model_id)
            
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Updating model {model_id} with {delay:.2f}s delay")
        
        # Check if model exists
        if model_id not in _models:
            return {'error': 'Model not found'}, 404
            
        # Update model
        model = _models[model_id]
        for key, value in data.items():
            if key != 'id' and key != 'createdAt':  # Don't allow changing ID or creation date
                model[key] = value
                
        # Update the updated timestamp
        model['updatedAt'] = datetime.now().isoformat()
        
        return jsonify(model)
    
    def delete(self, model_id):
        """Delete a model"""
        # Handle string IDs
        if isinstance(model_id, str) and model_id.isdigit():
            model_id = int(model_id)
            
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Deleting model {model_id} with {delay:.2f}s delay")
        
        # Check if model exists
        if model_id not in _models:
            return {'error': 'Model not found'}, 404
            
        # Check if any agents are using this model
        from ..api.agents import _agents
        for agent_id, agent in _agents.items():
            if agent.get('modelId') == model_id:
                return {
                    'error': f'Cannot delete model: it is in use by agent {agent_id} ({agent["name"]})'
                }, 400
            
        # Delete model
        del _models[model_id]
        
        return {'message': f'Model {model_id} deleted successfully'}, 200

class ModelExecuteResource(Resource):
    """Resource for executing a model directly"""
    
    def post(self, model_id):
        """Execute a model with provided inputs"""
        data = request.get_json() or {}
        
        # Handle string IDs
        if isinstance(model_id, str) and model_id.isdigit():
            model_id = int(model_id)
            
        # Validate request
        if 'input' not in data:
            return {'error': 'Input text is required'}, 400
            
        # Simulate network delay (longer for execution)
        delay = random.uniform(
            current_app.config['MIN_LATENCY'] * 2,
            current_app.config['MAX_LATENCY'] * 3
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Executing model {model_id} with {delay:.2f}s delay")
        
        # Check if model exists
        if model_id not in _models:
            return {'error': 'Model not found'}, 404
            
        # Get the model
        model = _models[model_id]
        
        # Extract inputs
        input_text = data['input']
        parameters = data.get('parameters', {})
        
        # Merge with default parameters from the model config
        merged_parameters = {**model.get('parameters', {}), **parameters}
        
        # Generate a response 
        response = {
            'id': f"resp-{uuid.uuid4().hex[:8]}",
            'modelId': model_id,
            'model': model['modelId'],
            'provider': model['provider'],
            'timestamp': datetime.now().isoformat(),
            'input': input_text[:100] + ('...' if len(input_text) > 100 else ''),
            'output': f"This is a simulated response from {model['name']} by {model['provider']}.\n\nThe model would process the input: '{input_text[:50]}...' and generate a coherent response based on its capabilities.",
            'usage': {
                'promptTokens': len(input_text.split()),
                'completionTokens': 50,  # Simulated
                'totalTokens': len(input_text.split()) + 50
            },
            'parameters': merged_parameters
        }
        
        return jsonify(response)

# Register API resources
api.add_resource(ModelListResource, '/models')
api.add_resource(ModelResource, '/models/<model_id>')
api.add_resource(ModelExecuteResource, '/models/<model_id>/execute')