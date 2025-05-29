import time
import random
from flask import request, jsonify, current_app
from flask_restful import Resource, Api
from . import api_bp

# Set up API resources
api = Api(api_bp)

class NodeListResource(Resource):
    """Resource for getting node types and node operations"""
    
    def get(self):
        """Get all available node types"""
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        # Return mock node types
        node_types = [
            {
                'type': 'agent',
                'label': 'Agent',
                'icon': 'robot',
                'color': '#4F46E5',
                'description': 'Autonomous agent that can perform tasks',
                'inputs': ['input'],
                'outputs': ['output']
            },
            {
                'type': 'llm',
                'label': 'LLM',
                'icon': 'cpu',
                'color': '#0EA5E9',
                'description': 'Large Language Model processor',
                'inputs': ['prompt'],
                'outputs': ['completion']
            },
            {
                'type': 'dataSource',
                'label': 'Data Source',
                'icon': 'database',
                'color': '#10B981',
                'description': 'External data source connector',
                'inputs': [],
                'outputs': ['data']
            },
            {
                'type': 'transform',
                'label': 'Transform',
                'icon': 'filter',
                'color': '#F59E0B',
                'description': 'Data transformation processor',
                'inputs': ['input'],
                'outputs': ['output']
            },
            {
                'type': 'manualStep',
                'label': 'Manual Step',
                'icon': 'user',
                'color': '#EC4899',
                'description': 'Human-in-the-loop approval step',
                'inputs': ['input'],
                'outputs': ['output']
            },
            {
                'type': 'fileUpload',
                'label': 'File Upload',
                'icon': 'file-upload',
                'color': '#8B5CF6',
                'description': 'File upload and processing',
                'inputs': [],
                'outputs': ['files']
            }
        ]
        
        return jsonify({
            'node_types': node_types,
            'count': len(node_types)
        })

# Register API resources
api.add_resource(NodeListResource, '/node-types')