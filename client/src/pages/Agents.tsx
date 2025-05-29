import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Agent, 
  getAgents, 
  createAgent, 
  updateAgent, 
  deleteAgent, 
  runAgent 
} from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function Agents() {
  const { toast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [runDialogOpen, setRunDialogOpen] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    goals: "",
    memory: 4096,
    modelId: 1,
  });
  const [runInput, setRunInput] = useState("");
  const [runResult, setRunResult] = useState("");
  const [runLoading, setRunLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch agents on component mount
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const data = await getAgents();
      // Add a default status to each agent
      const agentsWithStatus = data.map(agent => ({
        ...agent,
        status: agent.status || "idle"
      }));
      setAgents(agentsWithStatus);
    } catch (error) {
      console.error("Error fetching agents:", error);
      toast({
        title: "Error",
        description: "Failed to fetch agents. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setFormData({
      name: "",
      role: "",
      goals: "",
      memory: 4096,
      modelId: 1,
    });
    setCreateDialogOpen(true);
  };

  const handleEditClick = (agent: Agent) => {
    setCurrentAgent(agent);
    setFormData({
      name: agent.name,
      role: agent.role,
      goals: agent.goals.join("\\n"),
      memory: agent.memory,
      modelId: agent.modelId,
    });
    setEditDialogOpen(true);
  };

  const handleRunClick = (agent: Agent) => {
    setCurrentAgent(agent);
    setRunInput("");
    setRunResult("");
    setRunDialogOpen(true);
  };

  const handleSubmitCreate = async () => {
    setActionLoading(true);
    try {
      const goalsArray = formData.goals.split("\\n").filter(goal => goal.trim() !== "");
      
      const newAgent = await createAgent({
        name: formData.name,
        role: formData.role,
        goals: goalsArray,
        memory: formData.memory,
        modelId: formData.modelId,
      });
      
      setAgents([...agents, { ...newAgent, status: "idle" }]);
      
      toast({
        title: "Success",
        description: "Agent created successfully!",
      });
      
      setCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating agent:", error);
      toast({
        title: "Error",
        description: "Failed to create agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!currentAgent) return;
    
    setActionLoading(true);
    try {
      const goalsArray = formData.goals.split("\\n").filter(goal => goal.trim() !== "");
      
      const updatedAgent = await updateAgent(currentAgent.id, {
        name: formData.name,
        role: formData.role,
        goals: goalsArray,
        memory: formData.memory,
        modelId: formData.modelId,
      });
      
      // Update the agents list with the updated agent
      setAgents(agents.map(agent => 
        agent.id === currentAgent.id 
          ? { ...updatedAgent, status: agent.status } 
          : agent
      ));
      
      toast({
        title: "Success",
        description: "Agent updated successfully!",
      });
      
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating agent:", error);
      toast({
        title: "Error",
        description: "Failed to update agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this agent?")) return;
    
    try {
      await deleteAgent(id);
      
      // Remove the deleted agent from the list
      setAgents(agents.filter(agent => agent.id !== id));
      
      toast({
        title: "Success",
        description: "Agent deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast({
        title: "Error",
        description: "Failed to delete agent. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRun = async () => {
    if (!currentAgent) return;
    
    setRunLoading(true);
    setRunResult("");
    
    try {
      const result = await runAgent(currentAgent.id, { input: runInput });
      setRunResult(JSON.stringify(result, null, 2));
      
      // Update agent status to "active" temporarily
      setAgents(agents.map(agent => 
        agent.id === currentAgent.id 
          ? { ...agent, status: "active" } 
          : agent
      ));
      
      // Set it back to idle after 5 seconds
      setTimeout(() => {
        setAgents(agents.map(agent => 
          agent.id === currentAgent.id 
            ? { ...agent, status: "idle" } 
            : agent
        ));
      }, 5000);
      
      toast({
        title: "Success",
        description: "Agent executed successfully!",
      });
    } catch (error) {
      console.error("Error running agent:", error);
      setRunResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: "Error",
        description: "Failed to run agent. See result for details.",
        variant: "destructive",
      });
    } finally {
      setRunLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 py-3 px-6 flex items-center justify-between">
          <h2 className="text-xl font-medium">Agent Management</h2>
          
          <Button onClick={handleCreateClick} className="bg-primary hover:bg-primary-dark text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            Create Agent
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
          ) : agents.length === 0 ? (
            // Empty state
            <div className="text-center py-10">
              <h3 className="text-lg font-medium mb-2">No agents available</h3>
              <p className="text-gray-500 mb-4">Create your first agent to get started.</p>
              <Button onClick={handleCreateClick}>Create Agent</Button>
            </div>
          ) : (
            // Agent list
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {agents.map(agent => (
                <Card key={agent.id} className="relative">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-lg font-medium">{agent.name}</CardTitle>
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {agent.status}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-medium text-gray-500">Role</div>
                        <div>{agent.role}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-gray-500">Goals</div>
                        <div className="text-sm">
                          {agent.goals.map((goal, index) => (
                            <div key={index} className="mb-1">{goal}</div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditClick(agent)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleRunClick(agent)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                          Run
                        </Button>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute top-2 right-2 p-1" 
                        onClick={() => handleDelete(agent.id)}
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

      {/* Create Agent Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Agent</DialogTitle>
            <DialogDescription>
              Create a new agent to automate tasks and process data.
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
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="goals" className="text-right">
                Goals
              </Label>
              <Textarea
                id="goals"
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                className="col-span-3"
                placeholder="Enter goals, one per line"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="memory" className="text-right">
                Memory
              </Label>
              <Input
                id="memory"
                type="number"
                value={formData.memory}
                onChange={(e) => setFormData({ ...formData, memory: parseInt(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="modelId" className="text-right">
                Model ID
              </Label>
              <Input
                id="modelId"
                type="number"
                value={formData.modelId}
                onChange={(e) => setFormData({ ...formData, modelId: parseInt(e.target.value) })}
                className="col-span-3"
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
              {actionLoading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Agent Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
            <DialogDescription>
              Update agent details and capabilities.
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
              <Label htmlFor="edit-role" className="text-right">
                Role
              </Label>
              <Input
                id="edit-role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-goals" className="text-right">
                Goals
              </Label>
              <Textarea
                id="edit-goals"
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                className="col-span-3"
                placeholder="Enter goals, one per line"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-memory" className="text-right">
                Memory
              </Label>
              <Input
                id="edit-memory"
                type="number"
                value={formData.memory}
                onChange={(e) => setFormData({ ...formData, memory: parseInt(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-modelId" className="text-right">
                Model ID
              </Label>
              <Input
                id="edit-modelId"
                type="number"
                value={formData.modelId}
                onChange={(e) => setFormData({ ...formData, modelId: parseInt(e.target.value) })}
                className="col-span-3"
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
              {actionLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Run Agent Dialog */}
      <Dialog open={runDialogOpen} onOpenChange={setRunDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Run Agent: {currentAgent?.name}</DialogTitle>
            <DialogDescription>
              Enter input for the agent to process.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <Label htmlFor="run-input">
                Input
              </Label>
              <Textarea
                id="run-input"
                value={runInput}
                onChange={(e) => setRunInput(e.target.value)}
                className="col-span-1"
                placeholder="Enter input for the agent"
                rows={3}
              />
            </div>
            
            {runResult && (
              <div className="grid grid-cols-1 gap-4">
                <Label htmlFor="run-result">
                  Result
                </Label>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-[200px]">
                  {runResult}
                </pre>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRunDialogOpen(false)}
              disabled={runLoading}
            >
              Close
            </Button>
            <Button 
              onClick={handleRun}
              disabled={runLoading}
            >
              {runLoading ? "Running..." : "Run Agent"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
