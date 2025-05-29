import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function ApiTest() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("workflows");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [workflowId, setWorkflowId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [modelId, setModelId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [executionId, setExecutionId] = useState("");
  const [nodeId, setNodeId] = useState("");
  const [requestBody, setRequestBody] = useState("{}");

  // API base url
  const apiBase = "";

  // Helper function to format JSON output
  const formatJson = (json: any) => {
    try {
      return JSON.stringify(json, null, 2);
    } catch (e) {
      return json;
    }
  };

  // Generic API call function
  const callApi = async (url: string, method: string = "GET", body: any = null) => {
    setLoading(true);
    setResult("");

    try {
      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (body && (method === "POST" || method === "PUT")) {
        options.body = typeof body === "string" ? body : JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const data = await response.json();
      
      setResult(formatJson({
        status: response.status,
        statusText: response.statusText,
        data
      }));

      toast({
        title: `${response.status} ${response.statusText}`,
        description: "API request completed successfully"
      });

    } catch (error) {
      console.error("API Error:", error);
      setResult(String(error));
      
      toast({
        title: "Error",
        description: "Failed to call API. See console for details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission based on active tab and operation
  const handleSubmit = (e: React.FormEvent, operation: string) => {
    e.preventDefault();
    
    let url = apiBase;
    let method = "GET";
    let body = null;
    
    try {
      body = requestBody ? JSON.parse(requestBody) : null;
    } catch (error) {
      toast({
        title: "JSON Parse Error",
        description: "The request body is not valid JSON",
        variant: "destructive"
      });
      return;
    }
    
    // Build the URL and set method based on the active tab and operation
    switch (activeTab) {
      case "workflows":
        url += "/api/workflows";
        if (operation === "get-one" && workflowId) {
          url += `/${workflowId}`;
        } else if (operation === "create") {
          method = "POST";
        } else if (operation === "update" && workflowId) {
          url += `/${workflowId}`;
          method = "PUT";
        } else if (operation === "delete" && workflowId) {
          url += `/${workflowId}`;
          method = "DELETE";
        } else if (operation === "execute" && workflowId) {
          url += `/${workflowId}/execute`;
          method = "POST";
        }
        break;
        
      case "templates":
        url += "/api/templates";
        if (operation === "get-one" && templateId) {
          url += `/${templateId}`;
        } else if (operation === "create") {
          method = "POST";
        } else if (operation === "apply" && templateId) {
          url += `/${templateId}/apply`;
          method = "POST";
        }
        break;
        
      case "agents":
        url += "/api/agents";
        if (operation === "get-one" && agentId) {
          url += `/${agentId}`;
        } else if (operation === "create") {
          method = "POST";
        } else if (operation === "execute" && agentId) {
          url += `/${agentId}/execute`;
          method = "POST";
        }
        break;
        
      case "models":
        url += "/api/models";
        if (operation === "get-one" && modelId) {
          url += `/${modelId}`;
        } else if (operation === "create") {
          method = "POST";
        } else if (operation === "execute" && modelId) {
          url += `/${modelId}/execute`;
          method = "POST";
        }
        break;
        
      case "executions":
        url += "/api/executions";
        if (operation === "get" && executionId) {
          url += `/${executionId}`;
        } else if (operation === "update-node" && executionId && nodeId) {
          url += `/${executionId}/nodes/${nodeId}`;
          method = "PUT";
        } else if (operation === "manual-node" && executionId && nodeId) {
          url += `/${executionId}/manual/${nodeId}`;
          method = "POST";
        }
        break;
    }
    
    callApi(url, method, body);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">API Testing Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
            <CardDescription>Select an API endpoint to test</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="workflows">Workflows</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="agents">Agents</TabsTrigger>
                <TabsTrigger value="models">Models</TabsTrigger>
                <TabsTrigger value="executions">Executions</TabsTrigger>
              </TabsList>
              
              {/* Workflows Tab */}
              <TabsContent value="workflows" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="workflow-id">Workflow ID (for single item operations)</Label>
                  <Input
                    id="workflow-id"
                    placeholder="Enter workflow ID"
                    value={workflowId}
                    onChange={(e) => setWorkflowId(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="request-body">Request Body (for POST/PUT)</Label>
                  <Textarea
                    id="request-body"
                    placeholder="JSON request body"
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={(e) => handleSubmit(e, "get-all")}
                    disabled={loading}
                  >
                    Get All Workflows
                  </Button>
                  <Button 
                    onClick={(e) => handleSubmit(e, "get-one")}
                    disabled={loading || !workflowId}
                    variant="outline"
                  >
                    Get Single Workflow
                  </Button>
                  <Button 
                    onClick={(e) => handleSubmit(e, "create")}
                    disabled={loading}
                    variant="secondary"
                  >
                    Create Workflow
                  </Button>
                  <Button 
                    onClick={(e) => handleSubmit(e, "update")}
                    disabled={loading || !workflowId}
                    variant="secondary"
                  >
                    Update Workflow
                  </Button>
                  <Button 
                    onClick={(e) => handleSubmit(e, "delete")}
                    disabled={loading || !workflowId}
                    variant="destructive"
                  >
                    Delete Workflow
                  </Button>
                  <Button 
                    onClick={(e) => handleSubmit(e, "execute")}
                    disabled={loading || !workflowId}
                    variant="default"
                  >
                    Execute Workflow
                  </Button>
                </div>
              </TabsContent>
              
              {/* Templates Tab */}
              <TabsContent value="templates" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template-id">Template ID</Label>
                  <Input
                    id="template-id"
                    placeholder="Enter template ID"
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="request-body">Request Body (for POST/PUT)</Label>
                  <Textarea
                    id="request-body"
                    placeholder="JSON request body"
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={(e) => handleSubmit(e, "get-all")}
                    disabled={loading}
                  >
                    Get All Templates
                  </Button>
                  <Button 
                    onClick={(e) => handleSubmit(e, "get-one")}
                    disabled={loading || !templateId}
                    variant="outline"
                  >
                    Get Single Template
                  </Button>
                  <Button 
                    onClick={(e) => handleSubmit(e, "create")}
                    disabled={loading}
                    variant="secondary"
                  >
                    Create Template
                  </Button>
                  <Button 
                    onClick={(e) => handleSubmit(e, "apply")}
                    disabled={loading || !templateId}
                    variant="default"
                  >
                    Apply Template
                  </Button>
                </div>
              </TabsContent>
              
              {/* Agents Tab */}
              <TabsContent value="agents" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agent-id">Agent ID</Label>
                  <Input
                    id="agent-id"
                    placeholder="Enter agent ID"
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="request-body">Request Body (for POST/PUT)</Label>
                  <Textarea
                    id="request-body"
                    placeholder="JSON request body"
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={(e) => handleSubmit(e, "get-all")}
                    disabled={loading}
                  >
                    Get All Agents
                  </Button>
                  <Button 
                    onClick={(e) => handleSubmit(e, "get-one")}
                    disabled={loading || !agentId}
                    variant="outline"
                  >
                    Get Single Agent
                  </Button>
                  <Button 
                    onClick={(e) => handleSubmit(e, "create")}
                    disabled={loading}
                    variant="secondary"
                  >
                    Create Agent
                  </Button>
                  <Button 
                    onClick={(e) => handleSubmit(e, "execute")}
                    disabled={loading || !agentId}
                    variant="default"
                  >
                    Execute Agent
                  </Button>
                </div>
              </TabsContent>
              
              {/* Models Tab */}
              <TabsContent value="models" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="model-id">Model ID</Label>
                  <Input
                    id="model-id"
                    placeholder="Enter model ID"
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="request-body">Request Body (for POST/PUT)</Label>
                  <Textarea
                    id="request-body"
                    placeholder="JSON request body"
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={(e) => handleSubmit(e, "get-all")}
                    disabled={loading}
                  >
                    Get All Models
                  </Button>
                  <Button 
                    onClick={(e) => handleSubmit(e, "get-one")}
                    disabled={loading || !modelId}
                    variant="outline"
                  >
                    Get Single Model
                  </Button>
                  <Button 
                    onClick={(e) => handleSubmit(e, "create")}
                    disabled={loading}
                    variant="secondary"
                  >
                    Create Model
                  </Button>
                  <Button 
                    onClick={(e) => handleSubmit(e, "execute")}
                    disabled={loading || !modelId}
                    variant="default"
                  >
                    Execute Model
                  </Button>
                </div>
              </TabsContent>
              
              {/* Executions Tab */}
              <TabsContent value="executions" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="execution-id">Execution ID</Label>
                    <Input
                      id="execution-id"
                      placeholder="Enter execution ID"
                      value={executionId}
                      onChange={(e) => setExecutionId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="node-id">Node ID</Label>
                    <Input
                      id="node-id"
                      placeholder="Enter node ID"
                      value={nodeId}
                      onChange={(e) => setNodeId(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="request-body">Request Body (for POST/PUT)</Label>
                  <Textarea
                    id="request-body"
                    placeholder="JSON request body"
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={(e) => handleSubmit(e, "get")}
                    disabled={loading || !executionId}
                  >
                    Get Execution State
                  </Button>
                  <Button 
                    onClick={(e) => handleSubmit(e, "update-node")}
                    disabled={loading || !executionId || !nodeId}
                    variant="secondary"
                  >
                    Update Node Status
                  </Button>
                  <Button 
                    onClick={(e) => handleSubmit(e, "manual-node")}
                    disabled={loading || !executionId || !nodeId}
                    variant="default"
                  >
                    Manual Node Interaction
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>API Response</CardTitle>
            <CardDescription>Results from API call</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
              <pre className="bg-muted p-4 rounded-md overflow-auto h-[500px] text-sm font-mono">
                {result || "Response will appear here..."}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}