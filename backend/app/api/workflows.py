import time
import random
import logging
import uuid
from datetime import datetime
from flask import request, jsonify, current_app
from flask_restful import Resource, Api
from . import api_bp
from ..models.workflow import Workflow
from ..utils.mock_data import get_mock_workflow
from ..services.workflow_manager import (
    get_all_workflows, 
    get_workflow_by_id,
    create_workflow,
    update_workflow,
    delete_workflow,
    search_workflows,
    clone_workflow
)

# Set up API resources
api = Api(api_bp)

class WorkflowListResource(Resource):
    """Resource for getting all workflows and creating new ones"""
    
    def get(self):
        """Get all workflows"""
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Getting all workflows with {delay:.2f}s delay")
        
        # Get query parameters for filtering
        query = request.args.get('query')
        status = request.args.get('status')
        tags = request.args.getlist('tag')
        
        # If filters are provided, use search function
        if query or status or tags:
            workflows = search_workflows(query, status, tags)
        else:
            # Otherwise, get all workflows
            workflows = get_all_workflows()
            
        return jsonify({
            'workflows': workflows,
            'count': len(workflows)
        })
    
    def post(self):
        """Create a new workflow"""
        data = request.get_json() or {}
        
        # Validate required fields
        if 'name' not in data:
            return jsonify({'error': 'Workflow name is required'}), 400
            
        # Ensure we have empty lists for nodes and connections if not provided
        if 'nodes' not in data:
            data['nodes'] = []
        if 'connections' not in data:
            data['connections'] = []
            
        # Set default values if not provided
        if 'status' not in data:
            data['status'] = 'draft'
        if 'version' not in data:
            data['version'] = '1.0'
        
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Creating new workflow with {delay:.2f}s delay")
        
        # Create new workflow using the workflow manager service
        workflow = create_workflow(data)
        
        # Return the created workflow with 201 Created status
        return jsonify(workflow), 201

class WorkflowResource(Resource):
    """Resource for individual workflow operations"""
    
    def get(self, workflow_id):
        """Get a specific workflow"""
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Getting workflow {workflow_id} with {delay:.2f}s delay")
        
        # Get workflow by ID using the workflow manager service
        workflow = get_workflow_by_id(workflow_id)
        if not workflow:
            return {'error': 'Workflow not found'}, 404
            
        return jsonify(workflow)
    
    def put(self, workflow_id):
        """Update a workflow"""
        data = request.get_json() or {}
        
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Updating workflow {workflow_id} with {delay:.2f}s delay")
        
        # Update the workflow using the workflow manager service
        updated_workflow = update_workflow(workflow_id, data)
        if not updated_workflow:
            return {'error': 'Workflow not found'}, 404
            
        return jsonify(updated_workflow)
    
    def delete(self, workflow_id):
        """Delete a workflow"""
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Deleting workflow {workflow_id} with {delay:.2f}s delay")
        
        # Delete the workflow using workflow manager service
        success = delete_workflow(workflow_id)
        if not success:
            return {'error': 'Workflow not found'}, 404
            
        # Return success
        return {'message': f'Workflow {workflow_id} deleted successfully'}, 200

class WorkflowExecuteResource(Resource):
    """Resource for workflow execution"""
    
    def post(self, workflow_id):
        """Execute a workflow"""
        # Get execution parameters from request
        data = request.get_json() or {}
        inputs = data.get('inputs', {})
        
        # Simulate network delay (longer for execution)
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY'] * 2
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Executing workflow {workflow_id} with {delay:.2f}s delay")
        
        # Check if workflow exists
        workflow = get_workflow_by_id(workflow_id)
        if not workflow:
            return {'error': 'Workflow not found'}, 404
        
        # Generate a unique execution ID
        execution_id = f"exec-{int(time.time())}-{uuid.uuid4().hex[:8]}"
        
        # In a real implementation, we would start the actual workflow execution here
        # For now, we'll just return mock execution data
        
        # Return execution details
        return {
            'executionId': execution_id,
            'workflowId': workflow_id,
            'status': 'running',
            'startTime': datetime.now().isoformat(),
            'message': 'Workflow execution started',
            'nodes': {
                node['id']: {
                    'nodeId': node['id'],
                    'status': 'pending'
                } for node in workflow.get('nodes', [])
            }
        }

# Register API resources
api.add_resource(WorkflowListResource, '/workflows')
api.add_resource(WorkflowResource, '/workflows/<workflow_id>')
api.add_resource(WorkflowExecuteResource, '/workflows/<workflow_id>/execute')