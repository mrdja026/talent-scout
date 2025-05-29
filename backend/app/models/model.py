"""
Model definition for LLM (Large Language Model) models
"""
from datetime import datetime
import uuid
from typing import Dict, List, Any, Optional

class Model:
    """Model class for LLM models that can be used in workflows"""
    
    @staticmethod
    def create_from_dict(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new model from dictionary data
        
        Args:
            data: Dictionary containing model data
            
        Returns:
            Model dictionary with additional defaults
        """
        # Generate default ID if not provided
        if 'id' not in data:
            # Generate a numeric ID (preferred in our system)
            data['id'] = int(datetime.now().timestamp() * 1000) % 10000
            
        # Add default values for required fields
        if 'name' not in data:
            data['name'] = f"Model-{data['id']}"
            
        if 'provider' not in data:
            data['provider'] = 'openai'
            
        if 'modelId' not in data:
            data['modelId'] = 'gpt-3.5-turbo'
            
        # Add timestamps
        now = datetime.now().isoformat()
        data['createdAt'] = now
        data['updatedAt'] = now
        
        # Add default values for optional fields
        if 'description' not in data:
            data['description'] = ''
            
        if 'version' not in data:
            data['version'] = '1.0'
            
        if 'capabilities' not in data:
            data['capabilities'] = ['textCompletion', 'chatCompletion']
            
        if 'contextWindow' not in data:
            data['contextWindow'] = 4000
            
        if 'maxTokens' not in data:
            data['maxTokens'] = 1000
            
        if 'parameters' not in data:
            data['parameters'] = {
                'temperature': 0.7,
                'topP': 1.0,
                'frequencyPenalty': 0.0,
                'presencePenalty': 0.0
            }
            
        if 'status' not in data:
            data['status'] = 'active'
            
        return data
    
    @staticmethod
    def update_from_dict(model: Dict[str, Any], data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing model with new data
        
        Args:
            model: Existing model dictionary
            data: New data to update the model with
            
        Returns:
            Updated model dictionary
        """
        # Make a copy of the original
        updated = model.copy()
        
        # Update with new data, excluding protected fields
        for key, value in data.items():
            if key != 'id' and key != 'createdAt':
                updated[key] = value
                
        # Update the updated timestamp
        updated['updatedAt'] = datetime.now().isoformat()
        
        return updated