"""
Mock data generators for development and testing
"""
import random
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Union

# Cache for mock data
_mock_workflows = None
_mock_templates = None
_mock_agents = None
_mock_models = None

def get_mock_workflows(count: int = 5) -> List[Dict[str, Any]]:
    """
    Generate mock workflows
    
    Args:
        count: Number of workflows to generate
        
    Returns:
        List of workflow dictionaries
    """
    global _mock_workflows
    
    # Return cached workflows if available
    if _mock_workflows is not None:
        return _mock_workflows
    
    workflows = []
    
    # Generate workflows
    for i in range(1, count + 1):
        # Generate nodes
        node_count = random.randint(3, 8)
        nodes = []
        
        for j in range(1, node_count + 1):
            node_type = random.choice([
                'agent', 'llm', 'dataSource', 'transform', 
                'manualStep', 'fileUpload', 'conditional'
            ])
            
            node = {
                'id': f'node-{i}-{j}',
                'type': node_type,
                'position': {
                    'x': random.randint(50, 800),
                    'y': random.randint(50, 600)
                },
                'data': {
                    'name': f'{node_type.capitalize()} {j}',
                    'description': f'Mock {node_type} node'
                }
            }
            
            # Add type-specific data
            if node_type == 'agent':
                node['data']['agentId'] = random.randint(1, 3)
            elif node_type == 'llm':
                node['data']['modelId'] = random.randint(1, 4)
            elif node_type == 'manualStep':
                node['data']['instructions'] = 'Please review and approve this step'
                node['data']['options'] = ['Approve', 'Reject', 'Request changes']
            
            nodes.append(node)
        
        # Generate connections between nodes
        connections = []
        for j in range(1, node_count):
            # Connect most nodes sequentially
            if random.random() < 0.8:  # 80% chance of connection
                connection = {
                    'id': f'conn-{i}-{j}',
                    'source': f'node-{i}-{j}',
                    'target': f'node-{i}-{j+1}'
                }
                connections.append(connection)
            
            # Add some random connections
            if random.random() < 0.3 and j > 1:  # 30% chance of extra connection
                target = random.randint(j+1, node_count)
                if target != j and target <= node_count:
                    connection = {
                        'id': f'conn-{i}-{j}-extra',
                        'source': f'node-{i}-{j}',
                        'target': f'node-{i}-{target}'
                    }
                    connections.append(connection)
        
        # Generate workflow
        workflow = {
            'id': i,
            'name': f'Workflow {i}',
            'description': f'Mock workflow {i} for testing',
            'nodes': nodes,
            'connections': connections,
            'status': random.choice(['draft', 'active', 'archived']),
            'version': '1.0',
            'createdAt': (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat(),
            'updatedAt': datetime.now().isoformat(),
            'createdBy': 1
        }
        
        workflows.append(workflow)
    
    # Cache the workflows
    _mock_workflows = workflows
    
    return workflows

def get_mock_workflow(workflow_id: Union[int, str]) -> Optional[Dict[str, Any]]:
    """
    Get a mock workflow by ID
    
    Args:
        workflow_id: ID of the workflow to retrieve
        
    Returns:
        Workflow dictionary or None if not found
    """
    # Convert ID to int if it's a string
    if isinstance(workflow_id, str) and workflow_id.isdigit():
        workflow_id = int(workflow_id)
    
    workflows = get_mock_workflows()
    
    # Find workflow with matching ID
    for workflow in workflows:
        if workflow['id'] == workflow_id:
            return workflow
    
    return None

def generate_templates(count: int = 3) -> List[Dict[str, Any]]:
    """
    Generate mock workflow templates
    
    Args:
        count: Number of templates to generate
        
    Returns:
        List of template dictionaries
    """
    global _mock_templates
    
    # Return cached templates if available
    if _mock_templates is not None:
        return _mock_templates
    
    templates = []
    
    # Template categories
    categories = ['general', 'document-processing', 'customer-service', 'data-analysis']
    
    # Generate templates
    for i in range(1, count + 1):
        # Get a workflow to use as a base
        workflow = get_mock_workflow(i)
        
        # Create template from workflow
        template = {
            'id': i,
            'name': f'Template {i}',
            'description': f'Mock template {i} for {categories[i % len(categories)]} workflows',
            'category': categories[i % len(categories)],
            'nodes': workflow['nodes'],
            'connections': workflow['connections'],
            'tags': ['mock', categories[i % len(categories)]],
            'version': '1.0',
            'createdAt': (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat(),
            'updatedAt': datetime.now().isoformat(),
            'popularity': random.randint(1, 100)
        }
        
        templates.append(template)
    
    # Cache the templates
    _mock_templates = templates
    
    return templates

def generate_agents(count: int = 3) -> List[Dict[str, Any]]:
    """
    Generate mock agents
    
    Args:
        count: Number of agents to generate
        
    Returns:
        List of agent dictionaries
    """
    global _mock_agents
    
    # Return cached agents if available
    if _mock_agents is not None:
        return _mock_agents
    
    agents = []
    
    # Agent types
    agent_types = [
        {
            'name': 'Customer Service Agent',
            'capabilities': ['textProcessing', 'questionAnswering', 'sentiment'],
            'knowledgeDomains': ['customerService', 'productKnowledge'],
            'personality': {
                'empathy': 0.8,
                'formality': 0.6,
                'creativity': 0.4,
                'precision': 0.7,
                'helpfulness': 0.9
            }
        },
        {
            'name': 'Data Analysis Agent',
            'capabilities': ['textProcessing', 'dataExtraction', 'summarization'],
            'knowledgeDomains': ['dataAnalysis', 'statistics'],
            'personality': {
                'empathy': 0.3,
                'formality': 0.7,
                'creativity': 0.3,
                'precision': 0.9,
                'helpfulness': 0.6
            }
        },
        {
            'name': 'Creative Writing Agent',
            'capabilities': ['textProcessing', 'textGeneration', 'sentiment'],
            'knowledgeDomains': ['creativeWriting', 'marketing'],
            'personality': {
                'empathy': 0.6,
                'formality': 0.4,
                'creativity': 0.9,
                'precision': 0.5,
                'helpfulness': 0.7
            }
        }
    ]
    
    # Generate agents
    for i in range(1, count + 1):
        # Get an agent type
        agent_type = agent_types[(i - 1) % len(agent_types)]
        
        # Create agent
        agent = {
            'id': i,
            'name': agent_type['name'],
            'description': f'A {agent_type["name"].lower()} designed for {", ".join(agent_type["knowledgeDomains"])}',
            'capabilities': agent_type['capabilities'],
            'knowledgeDomains': agent_type['knowledgeDomains'],
            'personality': agent_type['personality'],
            'modelId': random.randint(1, 4),
            'systemPrompt': f'You are a helpful {agent_type["name"].lower()}. Assist the user with their tasks related to {", ".join(agent_type["knowledgeDomains"])}.',
            'createdAt': (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat(),
            'updatedAt': datetime.now().isoformat(),
            'status': 'active'
        }
        
        agents.append(agent)
    
    # Cache the agents
    _mock_agents = agents
    
    return agents

def generate_LLM_models(count: int = 4) -> List[Dict[str, Any]]:
    """
    Generate mock LLM models
    
    Args:
        count: Number of models to generate
        
    Returns:
        List of model dictionaries
    """
    global _mock_models
    
    # Return cached models if available
    if _mock_models is not None:
        return _mock_models
    
    models = []
    
    # Model types
    model_types = [
        {
            'name': 'GPT-3.5 Turbo',
            'provider': 'openai',
            'modelId': 'gpt-3.5-turbo',
            'capabilities': ['textCompletion', 'chatCompletion'],
            'contextWindow': 4000,
            'maxTokens': 2000,
            'parameters': {
                'temperature': 0.7,
                'topP': 1.0,
                'frequencyPenalty': 0.0,
                'presencePenalty': 0.0
            }
        },
        {
            'name': 'GPT-4',
            'provider': 'openai',
            'modelId': 'gpt-4',
            'capabilities': ['textCompletion', 'chatCompletion'],
            'contextWindow': 8000,
            'maxTokens': 4000,
            'parameters': {
                'temperature': 0.7,
                'topP': 1.0,
                'frequencyPenalty': 0.0,
                'presencePenalty': 0.0
            }
        },
        {
            'name': 'Claude 2',
            'provider': 'anthropic',
            'modelId': 'claude-2',
            'capabilities': ['textCompletion', 'chatCompletion'],
            'contextWindow': 100000,
            'maxTokens': 8000,
            'parameters': {
                'temperature': 0.7,
                'topK': 40,
                'topP': 0.9
            }
        },
        {
            'name': 'Mistral 7B',
            'provider': 'mistral',
            'modelId': 'mistral-7b',
            'capabilities': ['textCompletion'],
            'contextWindow': 8000,
            'maxTokens': 4000,
            'parameters': {
                'temperature': 0.7,
                'topP': 0.9,
                'repetitionPenalty': 1.1
            }
        }
    ]
    
    # Generate models
    for i in range(1, min(count, len(model_types)) + 1):
        # Get a model type
        model_type = model_types[i - 1]
        
        # Create model
        model = {
            'id': i,
            'name': model_type['name'],
            'description': f'A language model from {model_type["provider"]}',
            'provider': model_type['provider'],
            'modelId': model_type['modelId'],
            'capabilities': model_type['capabilities'],
            'contextWindow': model_type['contextWindow'],
            'maxTokens': model_type['maxTokens'],
            'parameters': model_type['parameters'],
            'apiEndpoint': f'https://api.{model_type["provider"]}.com/v1/completions',
            'version': '1.0',
            'createdAt': (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat(),
            'updatedAt': datetime.now().isoformat(),
            'status': 'active'
        }
        
        models.append(model)
    
    # Cache the models
    _mock_models = models
    
    return models