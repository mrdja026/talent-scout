import time
import random
from flask import request, jsonify, current_app
from flask_restful import Resource, Api
from . import api_bp

# Set up API resources
api = Api(api_bp)

class WorkflowConnectionsResource(Resource):
    """Resource for managing connections in a workflow"""
    
    def post(self, workflow_id):
        """Create a new connection between nodes"""
        data = request.get_json() or {}
        
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        # Create a mock connection
        connection = {
            'id': f"conn_{workflow_id}_{random.randint(1000, 9999)}",
            'source': data.get('source'),
            'target': data.get('target'),
            'sourcePort': data.get('sourcePort', 'output'),
            'targetPort': data.get('targetPort', 'input'),
            'created_at': time.time()
        }
        
        return jsonify(connection), 201

class ConnectionResource(Resource):
    """Resource for individual connection operations"""
    
    def delete(self, workflow_id, connection_id):
        """Delete a connection between nodes"""
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        # Return success
        return {'message': f'Connection {connection_id} deleted successfully'}, 200

# Register API resources
api.add_resource(WorkflowConnectionsResource, '/workflows/<int:workflow_id>/connections')
api.add_resource(ConnectionResource, '/workflows/<int:workflow_id>/connections/<string:connection_id>')