import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Model, 
  getModels, 
  createModel, 
  updateModel,
  deleteModel,
  generateText
} from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function Models() {
  const { toast } = useToast();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState<Model | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    provider: "OpenAI",
    parameters: {
      modelType: "text-generation",
      capabilities: [] as string[],
      contextSize: 4096,
      apiKey: "",
      endpoint: "",
    },
    status: "available",
  });
  const [generateInput, setGenerateInput] = useState({
    prompt: "",
    maxTokens: 100,
    temperature: 0.7
  });
  const [generateResult, setGenerateResult] = useState("");
  const [generateLoading, setGenerateLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Provider options
  const providers = ["OpenAI", "Anthropic", "Cohere", "Meta", "Mistral", "Google", "Local"];
  
  // Model type options
  const modelTypes = ["text-generation", "chat-completion", "embedding", "image-generation", "audio-transcription"];
  
  // Capability options
  const capabilityOptions = [
    { id: "text-generation", label: "Text Generation" },
    { id: "chat-completion", label: "Chat Completion" },
    { id: "embedding", label: "Embedding" },
    { id: "function-calling", label: "Function Calling" },
    { id: "json-mode", label: "JSON Mode" },
    { id: "vision", label: "Vision" }
  ];

  // Fetch models on component mount
  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const data = await getModels();
      // Add a default status to each model
      const modelsWithStatus = data.map(model => ({
        ...model,
        status: model.status || "ready"
      }));
      setModels(modelsWithStatus);
    } catch (error) {
      console.error("Error fetching models:", error);
      toast({
        title: "Error",
        description: "Failed to fetch models. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setFormData({
      name: "",
      provider: "OpenAI",
      parameters: {
        modelType: "text-generation",
        capabilities: [],
        contextSize: 4096,
        apiKey: "",
        endpoint: "",
      },
      status: "available",
    });
    setCreateDialogOpen(true);
  };

  const handleEditClick = (model: Model) => {
    setCurrentModel(model);
    setFormData({
      name: model.name,
      provider: model.provider,
      parameters: {
        modelType: model.parameters?.modelType || "text-generation",
        capabilities: model.parameters?.capabilities || [],
        contextSize: model.parameters?.contextSize || 4096,
        apiKey: model.parameters?.apiKey || "",
        endpoint: model.parameters?.endpoint || "",
      },
      status: model.status || "available",
    });
    setEditDialogOpen(true);
  };

  const handleGenerateClick = (model: Model) => {
    setCurrentModel(model);
    setGenerateInput({
      prompt: "",
      maxTokens: 100,
      temperature: 0.7
    });
    setGenerateResult("");
    setGenerateDialogOpen(true);
  };

  const handleSubmitCreate = async () => {
    setActionLoading(true);
    try {
      const newModel = await createModel({
        name: formData.name,
        provider: formData.provider,
        parameters: {
          modelType: formData.parameters.modelType,
          capabilities: formData.parameters.capabilities,
          contextSize: formData.parameters.contextSize,
          apiKey: formData.parameters.apiKey || undefined,
          endpoint: formData.parameters.endpoint || undefined,
        },
        status: formData.status,
      });
      
      setModels([...models, newModel]);
      
      toast({
        title: "Success",
        description: "Model created successfully!",
      });
      
      setCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating model:", error);
      toast({
        title: "Error",
        description: "Failed to create model. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!currentModel) return;
    
    setActionLoading(true);
    try {
      const updatedModel = await updateModel(currentModel.id, {
        name: formData.name,
        provider: formData.provider,
        parameters: {
          modelType: formData.parameters.modelType,
          capabilities: formData.parameters.capabilities,
          contextSize: formData.parameters.contextSize,
          apiKey: formData.parameters.apiKey || undefined,
          endpoint: formData.parameters.endpoint || undefined,
        },
        status: formData.status,
      });
      
      // Update the models list with the updated model
      setModels(models.map(model => 
        model.id === currentModel.id 
          ? updatedModel
          : model
      ));
      
      toast({
        title: "Success",
        description: "Model updated successfully!",
      });
      
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating model:", error);
      toast({
        title: "Error",
        description: "Failed to update model. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this model?")) return;
    
    try {
      await deleteModel(id);
      
      // Remove the deleted model from the list
      setModels(models.filter(model => model.id !== id));
      
      toast({
        title: "Success",
        description: "Model deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting model:", error);
      toast({
        title: "Error",
        description: "Failed to delete model. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateSubmit = async () => {
    if (!currentModel) return;
    
    setGenerateLoading(true);
    setGenerateResult("");
    
    try {
      const result = await generateText(currentModel.id, generateInput);
      setGenerateResult(typeof result === 'object' ? JSON.stringify(result, null, 2) : result);
      
      toast({
        title: "Success",
        description: "Text generated successfully!",
      });
    } catch (error) {
      console.error("Error generating text:", error);
      setGenerateResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: "Error",
        description: "Failed to generate text. See result for details.",
        variant: "destructive",
      });
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleToggleCapability = (capability: string) => {
    setFormData({
      ...formData,
      parameters: {
        ...formData.parameters,
        capabilities: formData.parameters.capabilities.includes(capability)
          ? formData.parameters.capabilities.filter(c => c !== capability)
          : [...formData.parameters.capabilities, capability]
      }
    });
  };

  // Function to get display string for capabilities
  const getCapabilitiesDisplay = (capabilities: string[] | undefined) => {
    if (!capabilities || capabilities.length === 0) return "None";
    
    if (capabilities.length <= 2) {
      return capabilities.map(c => {
        const option = capabilityOptions.find(opt => opt.id === c);
        return option ? option.label : c;
      }).join(", ");
    }
    
    return `${capabilities.length} capabilities`;
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 py-3 px-6 flex items-center justify-between">
          <h2 className="text-xl font-medium">Model Management</h2>
          
          <Button onClick={handleCreateClick} className="bg-primary hover:bg-primary-dark text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            Add Model
          </Button>
        </header>
        
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            // Skeleton loading UI
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-[200px]" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Skeleton className="h-4 w-[100px] mb-2" />
                        <Skeleton className="h-4 w-[150px]" />
                      </div>
                      <div>
                        <Skeleton className="h-4 w-[100px] mb-2" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : models.length === 0 ? (
            // Empty state
            <div className="text-center py-10">
              <h3 className="text-lg font-medium mb-2">No models available</h3>
              <p className="text-gray-500 mb-4">Add your first model to get started.</p>
              <Button onClick={handleCreateClick}>Add Model</Button>
            </div>
          ) : (
            // Model list
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {models.map(model => (
                <Card key={model.id} className="relative">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-lg font-medium">{model.name}</CardTitle>
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      model.status === 'ready' ? 'bg-green-100 text-green-800' : 
                      model.status === 'loading' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {model.status || 'ready'}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-medium text-gray-500">Provider</div>
                        <div>{model.provider}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-gray-500">Type</div>
                        <div className="capitalize">{model.parameters?.modelType || "Not specified"}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-gray-500">Context Size</div>
                        <div>{model.parameters?.contextSize?.toLocaleString() || "Not specified"} tokens</div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-gray-500">Capabilities</div>
                        <div className="text-sm">{getCapabilitiesDisplay(model.parameters?.capabilities)}</div>
                      </div>
                      
                      <div className="flex space-x-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleGenerateClick(model)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                          </svg>
                          Generate
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleEditClick(model)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                          Edit
                        </Button>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute top-2 right-2 p-1" 
                        onClick={() => handleDelete(model.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Model Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Model</DialogTitle>
            <DialogDescription>
              Add a new language model to use in your workflows.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                placeholder="e.g. GPT-4"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="provider" className="text-right">
                Provider
              </Label>
              <Select
                value={formData.provider}
                onValueChange={(value) => setFormData({ ...formData, provider: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map(provider => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model-type" className="text-right">
                Model Type
              </Label>
              <Select
                value={formData.parameters.modelType}
                onValueChange={(value) => setFormData({ ...formData, parameters: { ...formData.parameters, modelType: value } })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select model type" />
                </SelectTrigger>
                <SelectContent>
                  {modelTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                Capabilities
              </Label>
              <div className="col-span-3 space-y-2">
                {capabilityOptions.map((capability) => (
                  <div key={capability.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`capability-${capability.id}`} 
                      checked={formData.parameters.capabilities.includes(capability.id)}
                      onCheckedChange={() => handleToggleCapability(capability.id)}
                    />
                    <label
                      htmlFor={`capability-${capability.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {capability.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="context-size" className="text-right">
                Context Size
              </Label>
              <Input
                id="context-size"
                type="number"
                value={formData.parameters.contextSize}
                onChange={(e) => setFormData({ ...formData, parameters: { ...formData.parameters, contextSize: parseInt(e.target.value) } })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="api-key" className="text-right">
                API Key
              </Label>
              <Input
                id="api-key"
                type="password"
                value={formData.parameters.apiKey}
                onChange={(e) => setFormData({ ...formData, parameters: { ...formData.parameters, apiKey: e.target.value } })}
                className="col-span-3"
                placeholder="Optional for remote models"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endpoint" className="text-right">
                Endpoint
              </Label>
              <Input
                id="endpoint"
                value={formData.parameters.endpoint}
                onChange={(e) => setFormData({ ...formData, parameters: { ...formData.parameters, endpoint: e.target.value } })}
                className="col-span-3"
                placeholder="Optional API endpoint"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCreateDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitCreate}
              disabled={actionLoading}
            >
              {actionLoading ? "Adding..." : "Add Model"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Model Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Model</DialogTitle>
            <DialogDescription>
              Update model settings and configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-provider" className="text-right">
                Provider
              </Label>
              <Select
                value={formData.provider}
                onValueChange={(value) => setFormData({ ...formData, provider: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map(provider => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-model-type" className="text-right">
                Model Type
              </Label>
              <Select
                value={formData.parameters.modelType}
                onValueChange={(value) => setFormData({ ...formData, parameters: { ...formData.parameters, modelType: value } })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select model type" />
                </SelectTrigger>
                <SelectContent>
                  {modelTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                Capabilities
              </Label>
              <div className="col-span-3 space-y-2">
                {capabilityOptions.map((capability) => (
                  <div key={capability.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`edit-capability-${capability.id}`} 
                      checked={formData.parameters.capabilities.includes(capability.id)}
                      onCheckedChange={() => handleToggleCapability(capability.id)}
                    />
                    <label
                      htmlFor={`edit-capability-${capability.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {capability.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-context-size" className="text-right">
                Context Size
              </Label>
              <Input
                id="edit-context-size"
                type="number"
                value={formData.parameters.contextSize}
                onChange={(e) => setFormData({ ...formData, parameters: { ...formData.parameters, contextSize: parseInt(e.target.value) } })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-api-key" className="text-right">
                API Key
              </Label>
              <Input
                id="edit-api-key"
                type="password"
                value={formData.parameters.apiKey}
                onChange={(e) => setFormData({ ...formData, parameters: { ...formData.parameters, apiKey: e.target.value } })}
                className="col-span-3"
                placeholder="Optional for remote models"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-endpoint" className="text-right">
                Endpoint
              </Label>
              <Input
                id="edit-endpoint"
                value={formData.parameters.endpoint}
                onChange={(e) => setFormData({ ...formData, parameters: { ...formData.parameters, endpoint: e.target.value } })}
                className="col-span-3"
                placeholder="Optional API endpoint"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitEdit}
              disabled={actionLoading}
            >
              {actionLoading ? "Updating..." : "Update Model"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Text Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Generate Text with {currentModel?.name}</DialogTitle>
            <DialogDescription>
              Enter a prompt to generate text using this model.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                value={generateInput.prompt}
                onChange={(e) => setGenerateInput({ ...generateInput, prompt: e.target.value })}
                placeholder="Enter your prompt here..."
                rows={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max-tokens">Max Tokens</Label>
                <Input
                  id="max-tokens"
                  type="number"
                  value={generateInput.maxTokens}
                  onChange={(e) => setGenerateInput({ ...generateInput, maxTokens: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={generateInput.temperature}
                  onChange={(e) => setGenerateInput({ ...generateInput, temperature: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            
            {generateResult && (
              <div className="mt-4">
                <Label>Generated Text</Label>
                <div className="p-4 border rounded-md bg-gray-50 mt-2 max-h-[300px] overflow-auto">
                  <pre className="whitespace-pre-wrap text-sm">{generateResult}</pre>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setGenerateDialogOpen(false)}
              disabled={generateLoading}
            >
              Close
            </Button>
            <Button 
              onClick={handleGenerateSubmit}
              disabled={generateLoading || !generateInput.prompt}
            >
              {generateLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}