import { useState, useMemo, useEffect } from "react";
import { useWorkflow } from "@/contexts/WorkflowContext";
import { getAgent, getModel, getConnector } from "@/services/api";

export default function PropertiesPanel() {
  const { selectedNode, updateNode } = useWorkflow();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoadingEntity, setIsLoadingEntity] = useState(false);
  const [entityError, setEntityError] = useState<string | null>(null);
  
  // Update form data when selected node changes
  useEffect(() => {
    if (selectedNode) {
      setFormData(selectedNode.data || {});
      
      // If this is an entity node and we don't have full entity data yet, fetch it
      if (selectedNode.data?.entityType && selectedNode.data?.entityId && !selectedNode.data?.entityLoaded) {
        fetchEntityDetails(selectedNode.data.entityType, selectedNode.data.entityId);
      }
    } else {
      setFormData({});
    }
  }, [selectedNode]);
  
  // Fetch detailed entity data if needed
  const fetchEntityDetails = async (entityType: string, entityId: number) => {
    setIsLoadingEntity(true);
    setEntityError(null);
    
    try {
      let entityData;
      
      switch(entityType) {
        case 'agent':
          entityData = await getAgent(entityId);
          break;
        case 'model':
          entityData = await getModel(entityId);
          break;
        case 'connector':
          entityData = await getConnector(entityId);
          break;
        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }
      
      if (selectedNode) {
        // Store only necessary fields as strings to avoid rendering issues
        const updatedData = {
          ...selectedNode.data,
          entityLoaded: true,
          // Store entity reference information instead of the full object
          entityReferenceId: String(entityId),
          entityReferenceType: String(entityType)
        };
        
        // Update specific fields based on entity type, ensuring all are strings or primitive types
        if (entityType === 'agent' && 'role' in entityData) {
          updatedData.role = String(entityData.role || '');
          updatedData.goals = Array.isArray(entityData.goals) ? entityData.goals : [];
          updatedData.memory = Number(entityData.memory || 0);
          updatedData.modelId = Number(entityData.modelId || 0);
        } else if (entityType === 'model' && 'provider' in entityData) {
          updatedData.provider = String(entityData.provider || '');
          updatedData.modelType = String(entityData.parameters?.modelType || '');
          updatedData.contextSize = Number(entityData.parameters?.contextSize || 0);
          updatedData.capabilities = Array.isArray(entityData.parameters?.capabilities) 
            ? entityData.parameters.capabilities 
            : [];
        } else if (entityType === 'connector' && 'type' in entityData) {
          updatedData.connectorType = String(entityData.type || '');
          updatedData.description = String(entityData.description || '');
          // Store config as a JSON string instead of object
          updatedData.configStr = typeof entityData.config === 'object' 
            ? JSON.stringify(entityData.config) 
            : '{}';
        }
        
        // Update the node data
        updateNode(selectedNode.id, { data: updatedData });
        setFormData(updatedData);
      }
    } catch (err) {
      console.error(`Error fetching ${entityType} details:`, err);
      setEntityError(`Failed to load ${entityType} details`);
    } finally {
      setIsLoadingEntity(false);
    }
  };
  
  // Get the appropriate fields based on node type and entity data
  const fields = useMemo(() => {
    if (!selectedNode) return [];
    
    // For entity nodes, show entity-specific fields
    if (selectedNode.data?.entityType) {
      switch (selectedNode.data.entityType) {
        case 'agent':
          return [
            { name: 'role', label: 'Role', type: 'text', readonly: true },
            { 
              name: 'goals', 
              label: 'Goals', 
              type: 'list',
              readonly: true
            },
            { name: 'memory', label: 'Memory (KB)', type: 'number', readonly: true },
            { name: 'modelId', label: 'Model ID', type: 'text', readonly: true },
            { name: 'customPrompt', label: 'Custom Prompt', type: 'textarea' },
          ];
        case 'model':
          return [
            { name: 'provider', label: 'Provider', type: 'text', readonly: true },
            { name: 'modelType', label: 'Model Type', type: 'text', readonly: true },
            { name: 'contextSize', label: 'Context Size', type: 'number', readonly: true },
            { 
              name: 'capabilities', 
              label: 'Capabilities',
              type: 'list',
              readonly: true
            },
            { name: 'temperature', label: 'Temperature', type: 'range', min: 0, max: 1, step: 0.1 },
            { name: 'maxTokens', label: 'Max Tokens', type: 'number' },
            { name: 'systemPrompt', label: 'System Prompt', type: 'textarea' },
          ];
        case 'connector':
          return [
            { name: 'connectorType', label: 'Type', type: 'text', readonly: true },
            { name: 'description', label: 'Description', type: 'text', readonly: true },
            { name: 'query', label: 'Query', type: 'textarea' },
          ];
        default:
          return [];
      }
    }
    
    // For regular nodes, use standard fields based on node type
    switch (selectedNode.type) {
      case 'agent':
        return [
          { name: 'role', label: 'Role', type: 'text' },
          { name: 'goal', label: 'Goal', type: 'text' },
          { name: 'memory', label: 'Memory', type: 'text' },
        ];
      case 'modelRunner':
        return [
          { 
            name: 'model', 
            label: 'Model', 
            type: 'select',
            options: ['Llama2 7B', 'Llama2 13B', 'Mistral 7B', 'Phi-2']
          },
          {
            name: 'mode',
            label: 'Operation Mode',
            type: 'select',
            options: ['Text Generation', 'Chat Completion', 'Embeddings']
          },
          { name: 'temperature', label: 'Temperature', type: 'range', min: 0, max: 1, step: 0.1 },
          { name: 'maxTokens', label: 'Max Tokens', type: 'number' },
          { name: 'systemPrompt', label: 'System Prompt', type: 'textarea' },
        ];
      case 'dataSource':
        return [
          { name: 'connection', label: 'Connection', type: 'text' },
          { name: 'query', label: 'Query', type: 'text' },
        ];
      case 'transform':
        return [
          { name: 'action', label: 'Action', type: 'text' },
          { name: 'format', label: 'Format', type: 'text' },
        ];
      case 'output':
        return [
          { name: 'format', label: 'Format', type: 'text' },
          { name: 'output', label: 'Output', type: 'text' },
        ];
      default:
        return [];
    }
  }, [selectedNode]);
  
  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update the node data
    if (selectedNode) {
      updateNode(selectedNode.id, {
        data: {
          ...selectedNode.data,
          [name]: value
        }
      });
    }
  };
  
  const renderField = (field: { 
    name: string; 
    label: string; 
    type: string; 
    options?: string[]; 
    min?: number; 
    max?: number; 
    step?: number;
    readonly?: boolean;
  }) => {
    const isReadOnly = field.readonly === true;
    
    switch (field.type) {
      case 'select':
        return (
          <select
            className={`w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            disabled={isReadOnly}
          >
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'range':
        return (
          <div className="flex items-center">
            <input
              type="range"
              min={field.min}
              max={field.max}
              step={field.step}
              value={formData[field.name] || 0.7}
              className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${isReadOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
              onChange={(e) => handleChange(field.name, parseFloat(e.target.value))}
              disabled={isReadOnly}
            />
            <span className="ml-2 text-xs text-gray-500">{formData[field.name] || 0.7}</span>
          </div>
        );
      case 'textarea':
        return (
          <textarea
            rows={3}
            className={`w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            readOnly={isReadOnly}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            className={`w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            readOnly={isReadOnly}
          />
        );
      case 'list':
        const items = Array.isArray(formData[field.name]) ? formData[field.name] : [];
        return (
          <div className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md ${isReadOnly ? 'bg-gray-100' : ''}`}>
            {items.length > 0 ? (
              <ul className="list-disc pl-4 space-y-1">
                {items.map((item: string, index: number) => (
                  <li key={index} className="text-xs">{item}</li>
                ))}
              </ul>
            ) : (
              <span className="text-gray-400 text-xs">No items</span>
            )}
          </div>
        );
      default:
        return (
          <input
            type="text"
            className={`w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            readOnly={isReadOnly}
          />
        );
    }
  };

  // Determine if this is an entity node
  const isEntityNode = selectedNode?.data?.entityType && selectedNode?.data?.entityId;
  
  return (
    <div className="properties-panel w-72 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold">Properties</h3>
      </div>
      
      <div className="p-4">
        {selectedNode ? (
          <>
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Selected Node</h4>
              
              <div className="bg-white border border-gray-300 rounded-md p-3">
                <div className="flex items-center mb-3">
                  <div className={`w-6 h-6 bg-${selectedNode.data?.color || 'primary'} rounded-md flex items-center justify-center`}>
                    <span className="material-icons text-white text-xs">{selectedNode.data?.icon || 'widgets'}</span>
                  </div>
                  <div className="ml-2">
                    <span className="font-medium">{selectedNode.data?.label || 'Node'}</span>
                    {isEntityNode && (
                      <div className="text-xs text-gray-500">
                        {selectedNode.data.entityType} ID: {selectedNode.data.entityId}
                      </div>
                    )}
                  </div>
                </div>
                
                {isLoadingEntity ? (
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2 text-sm text-gray-500">Loading entity data...</span>
                  </div>
                ) : entityError ? (
                  <div className="text-center py-3 text-red-500 text-sm">
                    <span className="material-icons text-red-500 mb-1">error</span>
                    <p>{entityError}</p>
                    <button 
                      className="mt-2 px-3 py-1 text-xs bg-gray-200 rounded-md hover:bg-gray-300"
                      onClick={() => {
                        if (selectedNode?.data?.entityType && selectedNode?.data?.entityId) {
                          fetchEntityDetails(selectedNode.data.entityType, selectedNode.data.entityId);
                        }
                      }}
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {fields.map(field => (
                      <div key={field.name}>
                        <label className="block text-xs font-medium text-gray-700 mb-1">{field.label}</label>
                        {renderField(field)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Display Connection Information section */}
            {selectedNode?.data?.connected && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Node Connections</h4>
                
                <div className="bg-white border border-gray-300 rounded-md p-3">
                  {/* Input Connections */}
                  {selectedNode.data?.inputConnections?.length > 0 && (
                    <div className="mb-3">
                      <span className="text-xs font-medium block mb-2">Input Connections:</span>
                      <ul className="space-y-2">
                        {selectedNode.data.inputConnections.map((conn: any, idx: number) => (
                          <li key={`in-${idx}`} className="bg-blue-50 p-2 rounded text-xs">
                            <div className="font-medium text-blue-700">
                              From: {typeof conn.sourceNode === 'string' ? conn.sourceNode : 'Node'}
                            </div>
                            <div className="text-gray-600 mt-1">
                              Port: {typeof conn.sourcePort === 'string' ? conn.sourcePort : 'output'} → {typeof conn.targetPort === 'string' ? conn.targetPort : 'input'}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Output Connections */}
                  {selectedNode.data?.outputConnections?.length > 0 && (
                    <div>
                      <span className="text-xs font-medium block mb-2">Output Connections:</span>
                      <ul className="space-y-2">
                        {selectedNode.data.outputConnections.map((conn: any, idx: number) => (
                          <li key={`out-${idx}`} className="bg-green-50 p-2 rounded text-xs">
                            <div className="font-medium text-green-700">
                              To: {typeof conn.targetNode === 'string' ? conn.targetNode : 'Node'}
                            </div>
                            <div className="text-gray-600 mt-1">
                              Port: {typeof conn.sourcePort === 'string' ? conn.sourcePort : 'output'} → {typeof conn.targetPort === 'string' ? conn.targetPort : 'input'}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Node Status</h4>
              
              <div className="bg-white border border-gray-300 rounded-md p-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium">Last Run</span>
                  <span className="text-xs text-gray-500">Never</span>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium">Status</span>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">Not Run</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Run Time</span>
                  <span className="text-xs text-gray-500">-</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-gray-400">
            Select a node to view or edit its properties
          </div>
        )}
      </div>
    </div>
  );
}
