import { useMemo, useState, useEffect } from "react";
import DraggableNode from "./DraggableNode";
import { nodeTypes } from "@/lib/mockNodes";
import { Agent, Model, Connector, getAgents, getModels, getConnectors } from "@/services/api";

export default function ToolsPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real entities from the backend
  useEffect(() => {
    const fetchEntities = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch all entity types in parallel
        const [agentsData, modelsData, connectorsData] = await Promise.all([
          getAgents(),
          getModels(),
          getConnectors()
        ]);
        
        setAgents(agentsData);
        setModels(modelsData);
        setConnectors(connectorsData);
      } catch (err) {
        console.error("Error fetching entities:", err);
        setError("Failed to load nodes. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEntities();
  }, []);

  // Transform API entities into node types for the workflow designer
  const realAgentNodes = useMemo(() => {
    return agents.map(agent => ({
      type: "agent",
      entityType: "agent",
      entityId: agent.id,
      label: agent.name,
      icon: "smart_toy",
      color: "accent",
      lightColor: "accent-light",
      darkColor: "accent-dark",
      entityData: agent
    }));
  }, [agents]);

  const realModelNodes = useMemo(() => {
    return models.map(model => ({
      type: "modelRunner",
      entityType: "model",
      entityId: model.id,
      label: model.name,
      icon: "model_training",
      color: "primary",
      lightColor: "primary-light",
      darkColor: "primary-dark",
      entityData: model
    }));
  }, [models]);

  const realConnectorNodes = useMemo(() => {
    return connectors.map(connector => ({
      type: "dataSource",
      entityType: "connector",
      entityId: connector.id,
      label: connector.name,
      icon: "storage",
      color: "secondary",
      lightColor: "secondary-light",
      darkColor: "secondary-dark",
      entityData: connector
    }));
  }, [connectors]);

  // Create a combined node type structure with both real entities and standard nodes
  const combinedNodeTypes = useMemo(() => {
    // Start with the base categories from mock nodes
    const baseCategories = nodeTypes.filter(category => 
      !["Agent Nodes", "LLM Nodes", "Data Nodes"].includes(category.category)
    );

    // Create real entity categories
    const realEntityCategories = [
      {
        category: "Agents",
        nodes: realAgentNodes
      },
      {
        category: "Models",
        nodes: realModelNodes
      },
      {
        category: "Data Connectors",
        nodes: realConnectorNodes
      }
    ];

    return [...realEntityCategories, ...baseCategories];
  }, [realAgentNodes, realModelNodes, realConnectorNodes]);

  const filteredNodes = useMemo(() => {
    let filtered = combinedNodeTypes;
    
    // Filter by search term if provided
    if (searchTerm) {
      filtered = filtered.map(category => ({
        ...category,
        nodes: category.nodes.filter(node => 
          node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.type.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.nodes.length > 0);
    }
    
    // Filter by selected category if provided
    if (selectedCategory) {
      filtered = filtered.filter(category => category.category === selectedCategory);
    }
    
    return filtered;
  }, [searchTerm, selectedCategory, combinedNodeTypes]);

  return (
    <div className="w-56 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold">Node Library</h3>
        <div className="relative mt-2">
          <input
            type="text"
            placeholder="Search nodes..."
            className="w-full px-3 py-1.5 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="material-icons absolute right-2 top-1.5 text-gray-400 text-sm">search</span>
        </div>
      </div>
      
      <div className="border-b border-gray-200 px-4 py-2">
        <div className="flex flex-wrap gap-1">
          <button 
            className={`text-xs px-2 py-1 rounded-md ${selectedCategory === null ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </button>
          {combinedNodeTypes.map(category => (
            <button 
              key={category.category}
              className={`text-xs px-2 py-1 rounded-md ${selectedCategory === category.category ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => setSelectedCategory(prev => prev === category.category ? null : category.category)}
            >
              {category.category}
            </button>
          ))}
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1 px-4 py-2">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-20 mt-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            <span className="material-icons mb-2">error</span>
            <p className="text-sm">{error}</p>
            <button 
              className="mt-3 px-3 py-1 text-xs bg-gray-200 rounded-md hover:bg-gray-300"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {filteredNodes.map((category, index) => (
              <div key={index} className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  {category.category}
                </h4>
                
                {category.nodes.length === 0 ? (
                  <div className="text-center py-2 text-gray-400 text-xs">
                    No {category.category.toLowerCase()} available
                  </div>
                ) : (
                  category.nodes.map((node, nodeIndex) => (
                    <DraggableNode key={`${category.category}-${nodeIndex}`} node={node} />
                  ))
                )}
              </div>
            ))}
            
            {filteredNodes.length === 0 && (
              <div className="text-center py-4 text-gray-400">
                No nodes match your search
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}