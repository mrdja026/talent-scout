import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 py-3 px-6">
          <h2 className="text-xl font-medium">Settings</h2>
        </header>
        
        <div className="flex-1 overflow-auto p-6">
          <Tabs defaultValue="general">
            <div className="flex">
              <div className="w-48 flex-shrink-0">
                <TabsList className="flex flex-col space-y-1 items-start h-auto bg-transparent p-0">
                  <TabsTrigger value="general" className="w-full justify-start px-3">
                    <span className="material-icons text-sm mr-2">settings</span>
                    General
                  </TabsTrigger>
                  <TabsTrigger value="api" className="w-full justify-start px-3">
                    <span className="material-icons text-sm mr-2">api</span>
                    API Configuration
                  </TabsTrigger>
                  <TabsTrigger value="llm" className="w-full justify-start px-3">
                    <span className="material-icons text-sm mr-2">model_training</span>
                    LLM Settings
                  </TabsTrigger>
                  <TabsTrigger value="agent" className="w-full justify-start px-3">
                    <span className="material-icons text-sm mr-2">smart_toy</span>
                    Agent Defaults
                  </TabsTrigger>
                  <TabsTrigger value="storage" className="w-full justify-start px-3">
                    <span className="material-icons text-sm mr-2">storage</span>
                    Storage
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="w-full justify-start px-3">
                    <span className="material-icons text-sm mr-2">notifications</span>
                    Notifications
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex-1 ml-6">
                <TabsContent value="general">
                  <Card>
                    <CardHeader>
                      <CardTitle>General Settings</CardTitle>
                      <CardDescription>Configure general platform settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="platform-name">Platform Name</Label>
                        <Input id="platform-name" defaultValue="LocalAgentFlow" />
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Development Mode</div>
                            <div className="text-sm text-gray-500">Enable mock APIs and simplified workflows</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Auto-save Workflows</div>
                            <div className="text-sm text-gray-500">Periodically save workflow changes</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Detailed Logging</div>
                            <div className="text-sm text-gray-500">Enable verbose logging for debugging</div>
                          </div>
                          <Switch />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button>Save Changes</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="api">
                  <Card>
                    <CardHeader>
                      <CardTitle>API Configuration</CardTitle>
                      <CardDescription>Configure API integrations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="base-url">API Base URL</Label>
                        <Input id="base-url" defaultValue="http://localhost:8000" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="api-key">API Key</Label>
                        <Input id="api-key" type="password" defaultValue="••••••••••••••••" />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button>Save Changes</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="llm">
                  <Card>
                    <CardHeader>
                      <CardTitle>LLM Settings</CardTitle>
                      <CardDescription>Configure language model settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="default-model">Default Model</Label>
                        <Input id="default-model" defaultValue="Llama2 7B" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="model-folder">Models Directory</Label>
                        <Input id="model-folder" defaultValue="./models" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">GPU Acceleration</div>
                            <div className="text-sm text-gray-500">Use GPU for model inference</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Model Caching</div>
                            <div className="text-sm text-gray-500">Cache model outputs for improved performance</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button>Save Changes</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="agent">
                  <Card>
                    <CardHeader>
                      <CardTitle>Agent Defaults</CardTitle>
                      <CardDescription>Configure default agent settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="memory-size">Default Memory Size</Label>
                        <Input id="memory-size" defaultValue="4KB" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="agent-model">Default Agent Model</Label>
                        <Input id="agent-model" defaultValue="Llama2 7B" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Multi-agent Communication</div>
                            <div className="text-sm text-gray-500">Allow agents to communicate</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Agent Memory Persistence</div>
                            <div className="text-sm text-gray-500">Save agent memory between sessions</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button>Save Changes</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="storage">
                  <Card>
                    <CardHeader>
                      <CardTitle>Storage Settings</CardTitle>
                      <CardDescription>Configure data storage settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="storage-location">Storage Location</Label>
                        <Input id="storage-location" defaultValue="./data" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Auto Backups</div>
                            <div className="text-sm text-gray-500">Automatically backup data</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Encryption</div>
                            <div className="text-sm text-gray-500">Encrypt stored data</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button>Save Changes</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                      <CardDescription>Configure system notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Workflow Notifications</div>
                            <div className="text-sm text-gray-500">Get notified when workflows complete</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Error Notifications</div>
                            <div className="text-sm text-gray-500">Get notified about system errors</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">System Updates</div>
                            <div className="text-sm text-gray-500">Get notified about system updates</div>
                          </div>
                          <Switch />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button>Save Changes</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
