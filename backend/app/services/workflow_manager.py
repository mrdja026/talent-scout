"""
Workflow management service
Handles workflow CRUD operations and provides data access functionality
"""
import os
import json
import uuid
from datetime import datetime
from ..models.workflow import Workflow
from ..utils.mock_data import get_mock_workflows, get_mock_workflow
from typing import Dict, List, Optional, Any, Union, cast

# Storage for workflows (in-memory for development)
# In production, this would be replaced by a database
_workflows: Dict[Union[int, str], Dict] = {}
_next_id = 1

# Initialize with sample data
def _initialize_sample_data():
    """Initialize sample data from mock data generator"""
    global _next_id
    
    # Get sample workflows from mock data
    sample_workflows = get_mock_workflows(5)
    
    # Add to in-memory storage
    for workflow in sample_workflows:
        _workflows[workflow['id']] = workflow
        # Update next ID if needed
        if isinstance(workflow['id'], int) and workflow['id'] >= _next_id:
            _next_id = workflow['id'] + 1

def get_all_workflows() -> List[Dict]:
    """
    Get all workflows
    
    Returns:
        List of workflow dictionaries
    """
    # Ensure we have sample data
    if not _workflows:
        _initialize_sample_data()
    
    # Return all workflows as a list
    return list(_workflows.values())

def get_workflow_by_id(workflow_id: Union[int, str]) -> Optional[Dict]:
    """
    Get a workflow by ID
    
    Args:
        workflow_id: ID of the workflow to retrieve
        
    Returns:
        Workflow dictionary or None if not found
    """
    # Ensure we have sample data
    if not _workflows:
        _initialize_sample_data()
    
    # Convert ID to correct type if needed
    if isinstance(workflow_id, str) and workflow_id.isdigit():
        workflow_id = int(workflow_id)
    
    # Try to get workflow from storage
    return _workflows.get(workflow_id)

def create_workflow(workflow_data: Dict) -> Dict:
    """
    Create a new workflow
    
    Args:
        workflow_data: Workflow data
        
    Returns:
        Created workflow dictionary
    """
    global _next_id
    
    # Ensure we have sample data initialized
    if not _workflows:
        _initialize_sample_data()
    
    # Use the Workflow model to create a new workflow
    created_workflow = Workflow.create_from_dict(workflow_data)
    
    # If ID wasn't provided, use the next available ID
    if 'id' not in created_workflow:
        created_workflow['id'] = _next_id
        _next_id += 1
    
    # Store in memory
    _workflows[created_workflow['id']] = created_workflow
    
    return created_workflow

def update_workflow(workflow_id: Union[int, str], workflow_data: Dict) -> Optional[Dict]:
    """
    Update an existing workflow
    
    Args:
        workflow_id: ID of the workflow to update
        workflow_data: Updated workflow data
        
    Returns:
        Updated workflow dictionary or None if not found
    """
    # Ensure we have sample data
    if not _workflows:
        _initialize_sample_data()
    
    # Convert ID to correct type if needed
    if isinstance(workflow_id, str) and workflow_id.isdigit():
        workflow_id = int(workflow_id)
    
    # Check if workflow exists
    if workflow_id not in _workflows:
        return None
    
    # Get existing workflow
    existing_workflow = _workflows[workflow_id]
    
    # Update workflow using the Workflow model
    updated_workflow = Workflow.update_from_dict(existing_workflow, workflow_data)
    
    # Update storage
    _workflows[workflow_id] = updated_workflow
    
    return updated_workflow

def delete_workflow(workflow_id: Union[int, str]) -> bool:
    """
    Delete a workflow
    
    Args:
        workflow_id: ID of the workflow to delete
        
    Returns:
        True if deleted, False if not found
    """
    # Ensure we have sample data
    if not _workflows:
        _initialize_sample_data()
    
    # Convert ID to correct type if needed
    if isinstance(workflow_id, str) and workflow_id.isdigit():
        workflow_id = int(workflow_id)
    
    # Check if workflow exists
    if workflow_id not in _workflows:
        return False
    
    # Delete workflow
    del _workflows[workflow_id]
    
    return True

def search_workflows(query: Optional[str] = None, status: Optional[str] = None, tags: Optional[List[str]] = None) -> List[Dict]:
    """
    Search workflows based on criteria
    
    Args:
        query: Search query for name or description
        status: Filter by workflow status
        tags: Filter by tags
        
    Returns:
        List of matching workflow dictionaries
    """
    # Ensure we have sample data
    if not _workflows:
        _initialize_sample_data()
    
    # Start with all workflows
    results = list(_workflows.values())
    
    # Apply query filter
    if query:
        query = query.lower()
        results = [
            wf for wf in results 
            if query in wf.get('name', '').lower() or 
               query in wf.get('description', '').lower()
        ]
    
    # Apply status filter
    if status:
        results = [wf for wf in results if wf.get('status') == status]
    
    # Apply tags filter
    if tags:
        results = [
            wf for wf in results 
            if any(tag in wf.get('metadata', {}).get('tags', []) for tag in tags)
        ]
    
    return results

def clone_workflow(workflow_id: Union[int, str]) -> Optional[Dict]:
    """
    Clone a workflow
    
    Args:
        workflow_id: ID of the workflow to clone
        
    Returns:
        Cloned workflow dictionary or None if original not found
    """
    global _next_id
    
    # Get the original workflow
    original = get_workflow_by_id(workflow_id)
    if not original:
        return None
    
    # Create a deep copy
    cloned = json.loads(json.dumps(original))
    
    # Update properties
    cloned['id'] = _next_id
    _next_id += 1
    cloned['name'] = f"Copy of {original['name']}"
    cloned['created_at'] = datetime.now().isoformat()
    cloned['updated_at'] = datetime.now().isoformat()
    cloned['status'] = 'draft'
    
    # Add to storage
    _workflows[cloned['id']] = cloned
    
    return cloned

def export_workflow(workflow_id: Union[int, str]) -> Optional[Dict]:
    """
    Export a workflow to a portable format
    
    Args:
        workflow_id: ID of the workflow to export
        
    Returns:
        Exportable workflow dictionary or None if not found
    """
    # Get the workflow
    workflow = get_workflow_by_id(workflow_id)
    if not workflow:
        return None
    
    # Create export format (could include version info, etc.)
    export_data = {
        'format_version': '1.0',
        'exported_at': datetime.now().isoformat(),
        'workflow': workflow
    }
    
    return export_data

def import_workflow(export_data: Dict) -> Optional[Dict]:
    """
    Import a workflow from an exported format
    
    Args:
        export_data: Exported workflow data
        
    Returns:
        Imported workflow dictionary or None if invalid
    """
    global _next_id
    
    # Validate export format
    if 'workflow' not in export_data or not isinstance(export_data['workflow'], dict):
        return None
    
    # Extract workflow data
    workflow_data = export_data['workflow']
    
    # Assign a new ID
    workflow_data['id'] = _next_id
    _next_id += 1
    
    # Update timestamps
    workflow_data['imported_at'] = datetime.now().isoformat()
    workflow_data['updated_at'] = datetime.now().isoformat()
    
    # Add to storage
    _workflows[workflow_data['id']] = workflow_data
    
    return workflow_data