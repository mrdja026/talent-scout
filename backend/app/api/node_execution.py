"""
Node execution API endpoints
Handles requests related to node execution status, data transfer, and control flow
"""
import time
import random
import logging
import json
from datetime import datetime
from flask import request, jsonify, current_app
from flask_restful import Resource, Api
from . import api_bp

# Set up API resources
api = Api(api_bp)

# In-memory store for execution states
# In production, this would be stored in a database or Redis
execution_states = {}

class NodeStatusResource(Resource):
    """Resource for managing node execution status"""
    
    def get(self, execution_id, node_id):
        """Get status of a specific node in a workflow execution"""
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Getting node {node_id} status for execution {execution_id}")
        
        # Check if execution exists
        if execution_id not in execution_states:
            return {'error': 'Execution not found'}, 404
            
        # Check if node exists in this execution
        if node_id not in execution_states[execution_id]['nodes']:
            return {'error': 'Node not found in this execution'}, 404
            
        # Return node status
        return jsonify(execution_states[execution_id]['nodes'][node_id])
        
    def put(self, execution_id, node_id):
        """Update status of a specific node in a workflow execution"""
        data = request.get_json() or {}
        
        # Validate required fields
        if 'status' not in data:
            return {'error': 'Node status is required'}, 400
            
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Updating node {node_id} status for execution {execution_id}")
        
        # Check if execution exists, create if not
        if execution_id not in execution_states:
            execution_states[execution_id] = {
                'executionId': execution_id,
                'status': 'running',
                'startTime': datetime.now().isoformat(),
                'nodes': {}
            }
            
        # Update or create node status
        if node_id in execution_states[execution_id]['nodes']:
            # Update existing node
            node_data = execution_states[execution_id]['nodes'][node_id]
            node_data.update(data)
            
            # Add timestamp for the status change
            node_data['lastUpdated'] = datetime.now().isoformat()
        else:
            # Create new node status entry
            execution_states[execution_id]['nodes'][node_id] = {
                'nodeId': node_id,
                'status': data['status'],
                'lastUpdated': datetime.now().isoformat()
            }
            # Add any additional data provided
            execution_states[execution_id]['nodes'][node_id].update(data)
            
        # Return updated node status
        return jsonify(execution_states[execution_id]['nodes'][node_id])

class ExecutionStateResource(Resource):
    """Resource for overall workflow execution state"""
    
    def get(self, execution_id):
        """Get the state of an entire workflow execution"""
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Getting execution state for {execution_id}")
        
        # Check if execution exists
        if execution_id not in execution_states:
            return {'error': 'Execution not found'}, 404
            
        # Return the entire execution state
        return jsonify(execution_states[execution_id])
        
    def put(self, execution_id):
        """Update the overall state of a workflow execution"""
        data = request.get_json() or {}
        
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Updating execution state for {execution_id}")
        
        # Check if execution exists, if not create it
        if execution_id not in execution_states:
            execution_states[execution_id] = {
                'executionId': execution_id,
                'status': data.get('status', 'running'),
                'startTime': datetime.now().isoformat(),
                'nodes': {}
            }
        else:
            # Update status if provided
            if 'status' in data:
                execution_states[execution_id]['status'] = data['status']
                
            # If completing or failing, add end time
            if data.get('status') in ['completed', 'failed']:
                execution_states[execution_id]['endTime'] = datetime.now().isoformat()
                
        # Update with any other provided data
        for key, value in data.items():
            if key != 'nodes':  # Handle nodes separately
                execution_states[execution_id][key] = value
                
        # Handle node updates if provided
        if 'nodes' in data and isinstance(data['nodes'], dict):
            for node_id, node_data in data['nodes'].items():
                if node_id in execution_states[execution_id]['nodes']:
                    # Update existing node
                    execution_states[execution_id]['nodes'][node_id].update(node_data)
                else:
                    # Create new node entry
                    execution_states[execution_id]['nodes'][node_id] = {
                        'nodeId': node_id,
                        'status': node_data.get('status', 'pending'),
                        'lastUpdated': datetime.now().isoformat()
                    }
                    execution_states[execution_id]['nodes'][node_id].update(node_data)
        
        # Return updated execution state
        return jsonify(execution_states[execution_id])

class NodeDataTransferResource(Resource):
    """Resource for handling data transfer between nodes"""
    
    def post(self, execution_id, source_node_id, target_node_id):
        """Transfer data from source node to target node"""
        data = request.get_json() or {}
        
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        current_app.logger.debug(
            f"Transferring data from node {source_node_id} to {target_node_id} in execution {execution_id}"
        )
        
        # Validate payload
        if 'data' not in data:
            return {'error': 'Data payload is required'}, 400
            
        # Check if execution exists
        if execution_id not in execution_states:
            return {'error': 'Execution not found'}, 404
            
        # Ensure both nodes exist in the execution state
        nodes = execution_states[execution_id]['nodes']
        if source_node_id not in nodes:
            return {'error': f'Source node {source_node_id} not found'}, 404
        if target_node_id not in nodes:
            return {'error': f'Target node {target_node_id} not found'}, 404
            
        # Record the data transfer
        transfer_id = f"transfer-{int(time.time())}"
        transfer_record = {
            'id': transfer_id,
            'executionId': execution_id,
            'sourceNodeId': source_node_id,
            'targetNodeId': target_node_id,
            'timestamp': datetime.now().isoformat(),
            'status': 'completed'
        }
        
        # Update source node to show output sent
        if 'outputs' not in nodes[source_node_id]:
            nodes[source_node_id]['outputs'] = {}
        nodes[source_node_id]['outputs'][target_node_id] = {
            'transferId': transfer_id,
            'timestamp': datetime.now().isoformat(),
            'status': 'sent'
        }
        
        # Update target node to show input received
        if 'inputs' not in nodes[target_node_id]:
            nodes[target_node_id]['inputs'] = {}
        nodes[target_node_id]['inputs'][source_node_id] = {
            'transferId': transfer_id,
            'timestamp': datetime.now().isoformat(),
            'status': 'received',
            'data': data['data']
        }
        
        return jsonify({
            'transferId': transfer_id,
            'status': 'completed',
            'message': f'Data transferred from {source_node_id} to {target_node_id}'
        })

class ManualNodeInteractionResource(Resource):
    """Resource for manual interaction with nodes that require human input"""
    
    def post(self, execution_id, node_id):
        """Handle manual interaction with a node (approval, rejection, input)"""
        data = request.get_json() or {}
        
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Manual interaction with node {node_id} in execution {execution_id}")
        
        # Validate action
        if 'action' not in data:
            return {'error': 'Action is required (approve, reject, or input)'}, 400
        
        action = data['action'].lower()
        if action not in ['approve', 'reject', 'input']:
            return {'error': 'Invalid action. Must be approve, reject, or input'}, 400
            
        # Check if execution exists
        if execution_id not in execution_states:
            return {'error': 'Execution not found'}, 404
            
        # Check if node exists
        nodes = execution_states[execution_id]['nodes']
        if node_id not in nodes:
            return {'error': 'Node not found'}, 404
            
        # Process action based on type
        node = nodes[node_id]
        timestamp = datetime.now().isoformat()
        
        if action == 'approve':
            node['status'] = 'approved'
            node['userAction'] = {
                'type': 'approval',
                'timestamp': timestamp,
                'comment': data.get('comment', '')
            }
            message = f"Node {node_id} has been approved"
            
        elif action == 'reject':
            node['status'] = 'rejected'
            node['userAction'] = {
                'type': 'rejection',
                'timestamp': timestamp,
                'reason': data.get('reason', ''),
                'comment': data.get('comment', '')
            }
            message = f"Node {node_id} has been rejected"
            
        elif action == 'input':
            if 'input' not in data:
                return {'error': 'Input data is required for input action'}, 400
                
            node['status'] = 'running'
            node['userAction'] = {
                'type': 'input',
                'timestamp': timestamp,
                'input': data['input']
            }
            message = f"Input provided for node {node_id}"
        
        # Update last updated timestamp
        node['lastUpdated'] = timestamp
        
        return jsonify({
            'status': 'success',
            'message': message,
            'node': node
        })

# Register API resources
api.add_resource(NodeStatusResource, '/executions/<execution_id>/nodes/<node_id>')
api.add_resource(ExecutionStateResource, '/executions/<execution_id>')
api.add_resource(
    NodeDataTransferResource, 
    '/executions/<execution_id>/transfer/<source_node_id>/<target_node_id>'
)
api.add_resource(
    ManualNodeInteractionResource,
    '/executions/<execution_id>/manual/<node_id>'
)