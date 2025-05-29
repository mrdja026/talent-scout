import { Link } from "wouter";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkflow } from "@/contexts/WorkflowContext";
import { defaultNodeConfigs } from "@/lib/mockNodes";

export default function Dashboard() {
  const { nodes, connections } = useWorkflow();
  const [nodeStats, setNodeStats] = useState({
    totalNodes: 0,
    totalConnections: 0,
    nodeTypes: {} as Record<string, number>,
    dataFlow: 0
  });
  
  // Calculate dashboard statistics based on workflow data
  useEffect(() => {
    // Count node types and connections
    const typeCount: Record<string, number> = {};
    
    nodes.forEach(node => {
      typeCount[node.type] = (typeCount[node.type] || 0) + 1;
    });
    
    // Calculate data flow (input/output connections)
    const dataFlowCount = connections.length;
    
    // Update stats
    setNodeStats({
      totalNodes: nodes.length,
      totalConnections: connections.length,
      nodeTypes: typeCount,
      dataFlow: dataFlowCount
    });
  }, [nodes, connections]);
  
  // Helper function to get the outputs of a node
  const getNodeOutputs = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return [];
    
    const outputs = defaultNodeConfigs[node.type]?.outputs || [];
    return outputs;
  };
  
  // Helper function to get the inputs of a node
  const getNodeInputs = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return [];
    
    const inputs = defaultNodeConfigs[node.type]?.inputs || [];
    return inputs;
  };
  
  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 py-3 px-6">
          <h2 className="text-xl font-medium">Dashboard</h2>
        </header>
        
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Active Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">3</div>
                <div className="text-sm text-gray-500 mt-2">2 running • 1 scheduled</div>
                <Link href="/workflows">
                  <div className="text-sm text-primary hover:underline mt-4 inline-block cursor-pointer">
                    View all workflows
                  </div>
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Active Models</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">5</div>
                <div className="text-sm text-gray-500 mt-2">3 local • 2 API connected</div>
                <Link href="/models">
                  <div className="text-sm text-primary hover:underline mt-4 inline-block cursor-pointer">
                    Manage models
                  </div>
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Agent Fleet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">8</div>
                <div className="text-sm text-gray-500 mt-2">2 active • 6 idle</div>
                <Link href="/agents">
                  <div className="text-sm text-primary hover:underline mt-4 inline-block cursor-pointer">
                    Configure agents
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
          
          {/* Data Flow Section */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Current Workflow Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Workflow Components</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Total Nodes</span>
                      <span className="font-medium">{nodeStats.totalNodes}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Connections</span>
                      <span className="font-medium">{nodeStats.totalConnections}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Data Flows</span>
                      <span className="font-medium">{nodeStats.dataFlow}</span>
                    </div>
                    <div className="h-px bg-gray-200 my-2"></div>
                    {Object.entries(nodeStats.nodeTypes).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="flex items-center">
                          <div className={`w-3 h-3 rounded-full bg-${defaultNodeConfigs[type]?.color || 'gray-500'} mr-2`}></div>
                          {type} nodes
                        </span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">I/O Connections</CardTitle>
                </CardHeader>
                <CardContent className="max-h-80 overflow-auto">
                  {connections.length === 0 ? (
                    <div className="text-gray-500 text-center py-4">
                      No connections in current workflow
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {connections.map((connection, i) => {
                        const sourceNode = nodes.find(n => n.id === connection.source);
                        const targetNode = nodes.find(n => n.id === connection.target);
                        const sourceOutputs = getNodeOutputs(connection.source);
                        const targetInputs = getNodeInputs(connection.target);
                        
                        return (
                          <div key={i} className="p-3 border border-gray-200 rounded-md">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-medium">{sourceNode?.data?.label || 'Source'}</div>
                              <div className="text-xs text-gray-500">→</div>
                              <div className="text-sm font-medium">{targetNode?.data?.label || 'Target'}</div>
                            </div>
                            <div className="flex justify-between text-xs">
                              <div className="bg-green-100 text-green-800 rounded-full px-2 py-1">
                                Output: {sourceOutputs[0] || 'data'}
                              </div>
                              <div className="bg-blue-100 text-blue-800 rounded-full px-2 py-1">
                                Input: {targetInputs[0] || 'data'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {[
                    { action: "Workflow executed", name: "Customer Analysis", time: "5 min ago", status: "success" },
                    { action: "Agent updated", name: "Research Assistant", time: "30 min ago", status: "info" },
                    { action: "Model loaded", name: "Llama2 13B", time: "1 hour ago", status: "info" },
                    { action: "Workflow created", name: "Data Processing Pipeline", time: "2 hours ago", status: "info" },
                    { action: "Workflow failed", name: "API Integration Test", time: "3 hours ago", status: "error" },
                  ].map((item, i) => (
                    <div key={i} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{item.action}</div>
                        <div className="text-sm text-gray-500">{item.name}</div>
                      </div>
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-2 ${
                          item.status === 'success' ? 'bg-secondary' :
                          item.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                        }`}></div>
                        <span className="text-sm text-gray-500">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/workflows">
                <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-primary transition-colors cursor-pointer">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mr-3">
                      <span className="material-icons text-primary">add</span>
                    </div>
                    <div>
                      <div className="font-medium">New Workflow</div>
                      <div className="text-sm text-gray-500">Create from scratch</div>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link href="/models">
                <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-primary transition-colors cursor-pointer">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mr-3">
                      <span className="material-icons text-primary">download</span>
                    </div>
                    <div>
                      <div className="font-medium">Download Model</div>
                      <div className="text-sm text-gray-500">Add a new LLM</div>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link href="/documentation">
                <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-primary transition-colors cursor-pointer">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mr-3">
                      <span className="material-icons text-primary">school</span>
                    </div>
                    <div>
                      <div className="font-medium">Tutorials</div>
                      <div className="text-sm text-gray-500">Learn platform basics</div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
