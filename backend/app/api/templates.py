"""
Workflow template API endpoints
Handles template CRUD operations and related functionality
"""
import time
import random
import logging
import uuid
from datetime import datetime
from flask import request, jsonify, current_app
from flask_restful import Resource, Api
from . import api_bp
from ..models.template import Template

# Set up API resources
api = Api(api_bp)

# In-memory storage for templates
# In production, this would be stored in a database
_templates = {}
_next_template_id = 1

def _initialize_sample_templates():
    """Initialize with sample templates"""
    global _next_template_id
    
    # Import here to avoid circular imports
    from ..utils.mock_data import generate_templates
    
    sample_templates = generate_templates(3)
    for template in sample_templates:
        _templates[template['id']] = template
        
        # Update next ID counter if needed
        template_id = template['id']
        if isinstance(template_id, int) and template_id >= _next_template_id:
            _next_template_id = template_id + 1

class TemplateListResource(Resource):
    """Resource for template collection operations"""
    
    def get(self):
        """Get all templates"""
        # Initialize if empty
        if not _templates:
            _initialize_sample_templates()
            
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Getting all templates with {delay:.2f}s delay")
        
        # Return templates
        templates = list(_templates.values())
        return jsonify({
            'templates': templates,
            'count': len(templates)
        })
    
    def post(self):
        """Create a new template"""
        data = request.get_json() or {}
        
        # Validate required fields
        if 'name' not in data:
            return {'error': 'Template name is required'}, 400
            
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Creating new template with {delay:.2f}s delay")
        
        # Create new template
        template = Template.create_from_dict(data)
        
        # Generate ID if not provided
        global _next_template_id
        if 'id' not in template:
            template['id'] = _next_template_id
            _next_template_id += 1
            
        # Add to storage
        _templates[template['id']] = template
        
        return jsonify(template), 201

class TemplateResource(Resource):
    """Resource for individual template operations"""
    
    def get(self, template_id):
        """Get a specific template"""
        # Initialize if empty
        if not _templates:
            _initialize_sample_templates()
            
        # Handle string IDs
        if isinstance(template_id, str) and template_id.isdigit():
            template_id = int(template_id)
            
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Getting template {template_id} with {delay:.2f}s delay")
        
        # Check if template exists
        if template_id not in _templates:
            return {'error': 'Template not found'}, 404
            
        return jsonify(_templates[template_id])
    
    def put(self, template_id):
        """Update a template"""
        data = request.get_json() or {}
        
        # Handle string IDs
        if isinstance(template_id, str) and template_id.isdigit():
            template_id = int(template_id)
            
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Updating template {template_id} with {delay:.2f}s delay")
        
        # Check if template exists
        if template_id not in _templates:
            return {'error': 'Template not found'}, 404
            
        # Update template
        template = Template.update_from_dict(_templates[template_id], data)
        _templates[template_id] = template
        
        return jsonify(template)
    
    def delete(self, template_id):
        """Delete a template"""
        # Handle string IDs
        if isinstance(template_id, str) and template_id.isdigit():
            template_id = int(template_id)
            
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Deleting template {template_id} with {delay:.2f}s delay")
        
        # Check if template exists
        if template_id not in _templates:
            return {'error': 'Template not found'}, 404
            
        # Delete template
        del _templates[template_id]
        
        return {'message': f'Template {template_id} deleted successfully'}, 200

class TemplateApplyResource(Resource):
    """Resource for applying templates to create workflows"""
    
    def post(self, template_id):
        """Apply a template to create a new workflow"""
        data = request.get_json() or {}
        
        # Handle string IDs
        if isinstance(template_id, str) and template_id.isdigit():
            template_id = int(template_id)
            
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY']
        )
        time.sleep(delay)
        
        current_app.logger.debug(f"Applying template {template_id} with {delay:.2f}s delay")
        
        # Check if template exists
        if template_id not in _templates:
            return {'error': 'Template not found'}, 404
            
        # Get the template
        template = _templates[template_id]
        
        # Import workflow creation function
        from ..services.workflow_manager import create_workflow
        
        # Create a new workflow from the template
        workflow_data = {
            'name': data.get('name', f"Workflow from {template['name']}"),
            'description': data.get('description', template.get('description', '')),
            'nodes': template.get('nodes', []),
            'connections': template.get('connections', []),
            'status': 'draft',
            'version': '1.0',
            'templateId': template_id
        }
        
        # Add any provided customizations
        workflow_data.update(data.get('customizations', {}))
        
        # Create the workflow
        workflow = create_workflow(workflow_data)
        
        return jsonify({
            'message': 'Template applied successfully',
            'workflow': workflow
        }), 201

# Register API resources
api.add_resource(TemplateListResource, '/templates')
api.add_resource(TemplateResource, '/templates/<template_id>')
api.add_resource(TemplateApplyResource, '/templates/<template_id>/apply')