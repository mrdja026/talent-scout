"""
Agent model for AI agents in the workflow system
"""
from datetime import datetime
import uuid
from typing import Dict, List, Any, Optional

class Agent:
    """Agent model for AI agents that can be used in workflows"""
    
    @staticmethod
    def create_from_dict(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new agent from dictionary data
        
        Args:
            data: Dictionary containing agent data
            
        Returns:
            Agent dictionary with additional defaults
        """
        # Generate default ID if not provided
        if 'id' not in data:
            # Generate a numeric ID (preferred in our system)
            data['id'] = int(datetime.now().timestamp() * 1000) % 10000
            
        # Add default values for required fields
        if 'name' not in data:
            data['name'] = f"Agent-{data['id']}"
            
        if 'capabilities' not in data:
            data['capabilities'] = ['textProcessing']
            
        # Add timestamps
        now = datetime.now().isoformat()
        data['createdAt'] = now
        data['updatedAt'] = now
        
        # Add default values for optional fields
        if 'description' not in data:
            data['description'] = ''
            
        if 'personality' not in data:
            data['personality'] = {
                'creativity': 0.5,
                'precision': 0.5,
                'helpfulness': 0.7,
                'empathy': 0.5,
                'formality': 0.5
            }
            
        if 'knowledgeDomains' not in data:
            data['knowledgeDomains'] = ['general']
            
        if 'systemPrompt' not in data:
            data['systemPrompt'] = ''
            
        if 'status' not in data:
            data['status'] = 'active'
            
        return data
    
    @staticmethod
    def update_from_dict(agent: Dict[str, Any], data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing agent with new data
        
        Args:
            agent: Existing agent dictionary
            data: New data to update the agent with
            
        Returns:
            Updated agent dictionary
        """
        # Make a copy of the original
        updated = agent.copy()
        
        # Update with new data, excluding protected fields
        for key, value in data.items():
            if key != 'id' and key != 'createdAt':
                updated[key] = value
                
        # Update the updated timestamp
        updated['updatedAt'] = datetime.now().isoformat()
        
        return updated