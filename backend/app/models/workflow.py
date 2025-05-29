import time
from datetime import datetime
import uuid

class Workflow:
    """Workflow model representing a process flow in the system"""
    
    def __init__(self, id=None, name=None, description=None, nodes=None, connections=None, 
                 status="draft", version="1.0", created_at=None, updated_at=None, metadata=None):
        """
        Initialize a workflow instance
        
        Args:
            id: Unique identifier for the workflow
            name: User-friendly name for the workflow
            description: Detailed description of the workflow
            nodes: List of nodes in the workflow
            connections: List of connections between nodes
            status: Current status of the workflow (draft, published, archived)
            version: Version number of the workflow
            created_at: Timestamp when the workflow was created
            updated_at: Timestamp when the workflow was last updated
            metadata: Additional metadata about the workflow
        """
        self.id = id or str(uuid.uuid4())
        self.name = name or "Untitled Workflow"
        self.description = description or ""
        self.nodes = nodes or []
        self.connections = connections or []
        self.status = status
        self.version = version
        self.created_at = created_at or datetime.now().isoformat()
        self.updated_at = updated_at or self.created_at
        self.metadata = metadata or {}
    
    def to_dict(self):
        """Convert workflow to dictionary representation"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'nodes': self.nodes,
            'connections': self.connections,
            'status': self.status,
            'version': self.version,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'metadata': self.metadata
        }
    
    @classmethod
    def create_from_dict(cls, data):
        """
        Create a new workflow from dictionary data
        
        Args:
            data: Dictionary containing workflow data
            
        Returns:
            New Workflow instance
        """
        # Generate a new ID
        workflow_id = str(uuid.uuid4())
        
        # Set timestamps
        now = datetime.now().isoformat()
        
        return {
            'id': workflow_id,
            'name': data.get('name', 'Untitled Workflow'),
            'description': data.get('description', ''),
            'nodes': data.get('nodes', []),
            'connections': data.get('connections', []),
            'status': data.get('status', 'draft'),
            'version': data.get('version', '1.0'),
            'created_at': now,
            'updated_at': now,
            'metadata': data.get('metadata', {})
        }
    
    @classmethod
    def update_from_dict(cls, workflow, data):
        """
        Update an existing workflow from dictionary data
        
        Args:
            workflow: Existing workflow dictionary
            data: Dictionary containing updated workflow data
            
        Returns:
            Updated workflow dictionary
        """
        # Update fields that are present in the data
        for key, value in data.items():
            if key in workflow and key not in ['id', 'created_at']:
                workflow[key] = value
        
        # Update timestamp
        workflow['updated_at'] = datetime.now().isoformat()
        
        return workflow