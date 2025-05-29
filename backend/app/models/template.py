"""
Template model for workflow templates
"""
from datetime import datetime
import uuid
from typing import Dict, List, Any, Optional

class Template:
    """Template model for reusable workflow templates"""
    
    @staticmethod
    def create_from_dict(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new template from dictionary data
        
        Args:
            data: Dictionary containing template data
            
        Returns:
            Template dictionary with additional defaults
        """
        # Generate default ID if not provided
        if 'id' not in data:
            # Generate a numeric ID (preferred in our system)
            data['id'] = int(datetime.now().timestamp() * 1000) % 10000
            
        # Add default values for required fields
        if 'name' not in data:
            data['name'] = f"Template-{data['id']}"
            
        if 'nodes' not in data:
            data['nodes'] = []
            
        if 'connections' not in data:
            data['connections'] = []
            
        # Add timestamps
        now = datetime.now().isoformat()
        data['createdAt'] = now
        data['updatedAt'] = now
        
        # Add default values for optional fields
        if 'description' not in data:
            data['description'] = ''
            
        if 'category' not in data:
            data['category'] = 'general'
            
        if 'tags' not in data:
            data['tags'] = []
            
        if 'version' not in data:
            data['version'] = '1.0'
            
        return data
    
    @staticmethod
    def update_from_dict(template: Dict[str, Any], data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing template with new data
        
        Args:
            template: Existing template dictionary
            data: New data to update the template with
            
        Returns:
            Updated template dictionary
        """
        # Make a copy of the original
        updated = template.copy()
        
        # Update with new data, excluding protected fields
        for key, value in data.items():
            if key != 'id' and key != 'createdAt':
                updated[key] = value
                
        # Update the updated timestamp
        updated['updatedAt'] = datetime.now().isoformat()
        
        return updated