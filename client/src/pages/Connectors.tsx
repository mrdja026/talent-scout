import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, RefreshCw, AlertTriangle, Database, Cloud } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Connector, CreateConnectorPayload, createConnector, deleteConnector, getConnectors, updateConnector } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Form validation schema for creating and editing connectors
const connectorFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  config: z.record(z.any()),
  status: z.string().optional(),
});

// Helper function to get icon based on connector type
const getTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'database':
      return <Database className="text-blue-500" />;
    case 'storage':
      return <Cloud className="text-purple-500" />;
    default:
      return <Database className="text-gray-500" />;
  }
};

// Helper function to format config object to display in the UI
const formatConfigValue = (key: string, value: any): string => {
  if (key.toLowerCase().includes('password') || key.toLowerCase().includes('token') || key.toLowerCase().includes('key')) {
    return '********'; // Mask sensitive information
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }
  
  return String(value);
};

export default function Connectors() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingConnector, setEditingConnector] = useState<Connector | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [connectorToDelete, setConnectorToDelete] = useState<Connector | null>(null);

  // Fetch connectors
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/connectors'],
    queryFn: () => getConnectors(),
  });
  
  // Ensure connectors is always an array
  const connectors = Array.isArray(data) ? data : [];

  // Create connector mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateConnectorPayload) => createConnector(data),
    onSuccess: () => {
      toast({
        title: "Connector created",
        description: "The connector has been created successfully",
      });
      setIsCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/connectors'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create connector",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update connector mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateConnectorPayload> }) => 
      updateConnector(id, data),
    onSuccess: () => {
      toast({
        title: "Connector updated",
        description: "The connector has been updated successfully",
      });
      setEditingConnector(null);
      queryClient.invalidateQueries({ queryKey: ['/api/connectors'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update connector",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete connector mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteConnector(id),
    onSuccess: () => {
      toast({
        title: "Connector deleted",
        description: "The connector has been deleted successfully",
      });
      setConnectorToDelete(null);
      setDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/connectors'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete connector",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create connector form
  const createForm = useForm<z.infer<typeof connectorFormSchema>>({
    resolver: zodResolver(connectorFormSchema),
    defaultValues: {
      name: "",
      type: "",
      config: {},
      status: "configured",
    },
  });

  // Edit connector form
  const editForm = useForm<z.infer<typeof connectorFormSchema>>({
    resolver: zodResolver(connectorFormSchema),
    defaultValues: {
      name: editingConnector?.name || "",
      type: editingConnector?.type || "",
      config: editingConnector?.config || {},
      status: editingConnector?.status || "configured",
    },
  });

  // Reset and set up edit form when editing connector changes
  useState(() => {
    if (editingConnector) {
      editForm.reset({
        name: editingConnector.name,
        type: editingConnector.type,
        config: editingConnector.config,
        status: editingConnector.status || "configured",
      });
    }
  });

  // Handle create form submission
  const onCreateSubmit = (data: z.infer<typeof connectorFormSchema>) => {
    createMutation.mutate({
      name: data.name,
      type: data.type,
      config: data.config,
      description: "", // Add a description field if needed
    });
  };

  // Handle edit form submission
  const onEditSubmit = (data: z.infer<typeof connectorFormSchema>) => {
    if (editingConnector) {
      updateMutation.mutate({
        id: editingConnector.id,
        data: {
          name: data.name,
          type: data.type,
          config: data.config,
          description: "", // Add a description field if needed
        },
      });
    }
  };

  // Handle connector delete
  const handleDelete = (connector: Connector) => {
    setConnectorToDelete(connector);
    setDeleteDialogOpen(true);
  };

  // Confirm deletion
  const confirmDelete = () => {
    if (connectorToDelete) {
      deleteMutation.mutate(connectorToDelete.id);
    }
  };

  // Handle closing edit dialog
  const handleCloseEdit = () => {
    setEditingConnector(null);
    editForm.reset();
  };

  // Handle closing create dialog
  const handleCloseCreate = () => {
    setIsCreateOpen(false);
    createForm.reset();
  };

  // Handle opening edit dialog
  const handleEdit = (connector: Connector) => {
    setEditingConnector(connector);
    editForm.reset({
      name: connector.name,
      type: connector.type,
      config: connector.config,
      status: connector.status || "configured",
    });
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 py-3 px-6 flex items-center justify-between">
          <h2 className="text-xl font-medium">Data Connectors</h2>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary-dark text-white flex items-center gap-1">
                <Plus size={16} />
                Add Connector
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add New Connector</DialogTitle>
                <DialogDescription>
                  Create a new connector to an external system or data source
                </DialogDescription>
              </DialogHeader>
              
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter connector name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a connector type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="database">Database</SelectItem>
                            <SelectItem value="storage">Storage</SelectItem>
                            <SelectItem value="api">API</SelectItem>
                            <SelectItem value="communication">Communication</SelectItem>
                            <SelectItem value="file">File System</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                      <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
                    </TabsList>
                    <TabsContent value="basic" className="space-y-4">
                      {createForm.watch("type") === "database" && (
                        <>
                          <FormItem>
                            <FormLabel>Host</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter database host" 
                                onChange={(e) => {
                                  const config = { ...createForm.getValues().config, host: e.target.value };
                                  createForm.setValue("config", config);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                          
                          <FormItem>
                            <FormLabel>Port</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter database port" 
                                type="number" 
                                onChange={(e) => {
                                  const config = { ...createForm.getValues().config, port: parseInt(e.target.value) };
                                  createForm.setValue("config", config);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                          
                          <FormItem>
                            <FormLabel>Database Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter database name" 
                                onChange={(e) => {
                                  const config = { ...createForm.getValues().config, database: e.target.value };
                                  createForm.setValue("config", config);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        </>
                      )}
                      
                      {createForm.watch("type") === "storage" && (
                        <>
                          <FormItem>
                            <FormLabel>Client ID</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter client ID" 
                                onChange={(e) => {
                                  const config = { ...createForm.getValues().config, clientId: e.target.value };
                                  createForm.setValue("config", config);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                          
                          <FormItem>
                            <FormLabel>Redirect URI</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter redirect URI" 
                                onChange={(e) => {
                                  const config = { ...createForm.getValues().config, redirectUri: e.target.value };
                                  createForm.setValue("config", config);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        </>
                      )}
                      
                      {createForm.watch("type") === "api" && (
                        <>
                          <FormItem>
                            <FormLabel>API Endpoint</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter API endpoint" 
                                onChange={(e) => {
                                  const config = { ...createForm.getValues().config, endpoint: e.target.value };
                                  createForm.setValue("config", config);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                          
                          <FormItem>
                            <FormLabel>API Key</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter API key" 
                                type="password" 
                                onChange={(e) => {
                                  const config = { ...createForm.getValues().config, apiKey: e.target.value };
                                  createForm.setValue("config", config);
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              This will be stored securely
                            </FormDescription>
                          </FormItem>
                        </>
                      )}
                      
                      {createForm.watch("type") === "communication" && (
                        <>
                          <FormItem>
                            <FormLabel>Token</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter access token" 
                                type="password" 
                                onChange={(e) => {
                                  const config = { ...createForm.getValues().config, token: e.target.value };
                                  createForm.setValue("config", config);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                          
                          <FormItem>
                            <FormLabel>Channels</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter channel names (comma separated)" 
                                onChange={(e) => {
                                  const channels = e.target.value.split(',').map(c => c.trim());
                                  const config = { ...createForm.getValues().config, channels };
                                  createForm.setValue("config", config);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        </>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="advanced" className="space-y-4">
                      <FormItem>
                        <FormLabel>Advanced Configuration</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter JSON configuration" 
                            rows={8}
                            onChange={(e) => {
                              try {
                                const config = JSON.parse(e.target.value);
                                createForm.setValue("config", config);
                              } catch (error) {
                                // Ignore invalid JSON for now
                              }
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter a valid JSON object with your connector configuration
                        </FormDescription>
                      </FormItem>
                    </TabsContent>
                  </Tabs>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleCloseCreate}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Creating..." : "Create Connector"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </header>
        
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">Loading connectors...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64 flex-col">
              <AlertTriangle className="h-12 w-12 text-amber-500 mb-2" />
              <h3 className="text-lg font-medium">Failed to load connectors</h3>
              <p className="text-gray-500">{(error as Error).message}</p>
            </div>
          ) : connectors.length === 0 ? (
            <div className="flex justify-center items-center h-64 flex-col">
              <Database className="h-12 w-12 text-gray-400 mb-2" />
              <h3 className="text-lg font-medium">No connectors found</h3>
              <p className="text-gray-500 mb-4">Create your first connector to get started</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-1 h-4 w-4" /> Add Connector
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {connectors.map(connector => (
                <Card key={connector.id}>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                      {getTypeIcon(connector.type)}
                      {connector.name}
                    </CardTitle>
                    <Badge className={
                      connector.status === 'configured' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
                      connector.status === 'error' ? 'bg-red-100 text-red-800 hover:bg-red-100' : 
                      'bg-gray-100 text-gray-800 hover:bg-gray-100'
                    }>
                      {connector.status || 'unconfigured'}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-medium text-gray-500">Type</div>
                        <div className="capitalize">{connector.type}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-gray-500">Configuration</div>
                        <div className="text-xs space-y-1 mt-1">
                          {Object.entries(connector.config).slice(0, 3).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="font-medium">{key}:</span>
                              <span>{formatConfigValue(key, value)}</span>
                            </div>
                          ))}
                          {Object.keys(connector.config).length > 3 && (
                            <div className="text-gray-400 italic text-right">
                              +{Object.keys(connector.config).length - 3} more fields
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleEdit(connector)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleDelete(connector)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Test
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Connector Dialog */}
      {editingConnector && (
        <Dialog open={!!editingConnector} onOpenChange={(open) => !open && handleCloseEdit()}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Connector</DialogTitle>
              <DialogDescription>
                Update the connector configuration
              </DialogDescription>
            </DialogHeader>
            
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter connector name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a connector type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="database">Database</SelectItem>
                          <SelectItem value="storage">Storage</SelectItem>
                          <SelectItem value="api">API</SelectItem>
                          <SelectItem value="communication">Communication</SelectItem>
                          <SelectItem value="file">File System</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
                  </TabsList>
                  <TabsContent value="basic" className="space-y-4">
                    {editForm.watch("type") === "database" && (
                      <>
                        <FormItem>
                          <FormLabel>Host</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter database host" 
                              defaultValue={editingConnector.config.host || ""}
                              onChange={(e) => {
                                const config = { ...editForm.getValues().config, host: e.target.value };
                                editForm.setValue("config", config);
                              }}
                            />
                          </FormControl>
                        </FormItem>
                        
                        <FormItem>
                          <FormLabel>Port</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter database port" 
                              type="number" 
                              defaultValue={editingConnector.config.port || ""}
                              onChange={(e) => {
                                const config = { ...editForm.getValues().config, port: parseInt(e.target.value) };
                                editForm.setValue("config", config);
                              }}
                            />
                          </FormControl>
                        </FormItem>
                        
                        <FormItem>
                          <FormLabel>Database Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter database name" 
                              defaultValue={editingConnector.config.database || ""}
                              onChange={(e) => {
                                const config = { ...editForm.getValues().config, database: e.target.value };
                                editForm.setValue("config", config);
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      </>
                    )}
                    
                    {editForm.watch("type") === "storage" && (
                      <>
                        <FormItem>
                          <FormLabel>Client ID</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter client ID" 
                              defaultValue={editingConnector.config.clientId || ""}
                              onChange={(e) => {
                                const config = { ...editForm.getValues().config, clientId: e.target.value };
                                editForm.setValue("config", config);
                              }}
                            />
                          </FormControl>
                        </FormItem>
                        
                        <FormItem>
                          <FormLabel>Redirect URI</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter redirect URI" 
                              defaultValue={editingConnector.config.redirectUri || ""}
                              onChange={(e) => {
                                const config = { ...editForm.getValues().config, redirectUri: e.target.value };
                                editForm.setValue("config", config);
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      </>
                    )}
                    
                    {editForm.watch("type") === "api" && (
                      <>
                        <FormItem>
                          <FormLabel>API Endpoint</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter API endpoint" 
                              defaultValue={editingConnector.config.endpoint || ""}
                              onChange={(e) => {
                                const config = { ...editForm.getValues().config, endpoint: e.target.value };
                                editForm.setValue("config", config);
                              }}
                            />
                          </FormControl>
                        </FormItem>
                        
                        <FormItem>
                          <FormLabel>API Key</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter API key" 
                              type="password" 
                              defaultValue={editingConnector.config.apiKey || ""}
                              onChange={(e) => {
                                const config = { ...editForm.getValues().config, apiKey: e.target.value };
                                editForm.setValue("config", config);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            This will be stored securely
                          </FormDescription>
                        </FormItem>
                      </>
                    )}
                    
                    {editForm.watch("type") === "communication" && (
                      <>
                        <FormItem>
                          <FormLabel>Token</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter access token" 
                              type="password" 
                              defaultValue={editingConnector.config.token || ""}
                              onChange={(e) => {
                                const config = { ...editForm.getValues().config, token: e.target.value };
                                editForm.setValue("config", config);
                              }}
                            />
                          </FormControl>
                        </FormItem>
                        
                        <FormItem>
                          <FormLabel>Channels</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter channel names (comma separated)" 
                              defaultValue={Array.isArray(editingConnector.config.channels) ? editingConnector.config.channels.join(', ') : ''}
                              onChange={(e) => {
                                const channels = e.target.value.split(',').map(c => c.trim());
                                const config = { ...editForm.getValues().config, channels };
                                editForm.setValue("config", config);
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      </>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="advanced" className="space-y-4">
                    <FormItem>
                      <FormLabel>Advanced Configuration</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter JSON configuration" 
                          rows={8}
                          defaultValue={JSON.stringify(editingConnector.config, null, 2)}
                          onChange={(e) => {
                            try {
                              const config = JSON.parse(e.target.value);
                              editForm.setValue("config", config);
                            } catch (error) {
                              // Ignore invalid JSON for now
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter a valid JSON object with your connector configuration
                      </FormDescription>
                    </FormItem>
                  </TabsContent>
                </Tabs>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseEdit}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Updating..." : "Update Connector"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the connector
              "{connectorToDelete?.name}" and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
