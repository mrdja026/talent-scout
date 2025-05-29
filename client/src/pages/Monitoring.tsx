import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function Monitoring() {
  // Sample performance data
  const performanceData = [
    { time: "00:00", llmLatency: 250, apiLatency: 120, agentLatency: 450, workflowCount: 5 },
    { time: "02:00", llmLatency: 300, apiLatency: 140, agentLatency: 480, workflowCount: 8 },
    { time: "04:00", llmLatency: 280, apiLatency: 130, agentLatency: 470, workflowCount: 10 },
    { time: "06:00", llmLatency: 350, apiLatency: 150, agentLatency: 520, workflowCount: 15 },
    { time: "08:00", llmLatency: 420, apiLatency: 190, agentLatency: 580, workflowCount: 25 },
    { time: "10:00", llmLatency: 500, apiLatency: 220, agentLatency: 650, workflowCount: 30 },
    { time: "12:00", llmLatency: 580, apiLatency: 250, agentLatency: 720, workflowCount: 28 },
    { time: "14:00", llmLatency: 550, apiLatency: 240, agentLatency: 700, workflowCount: 26 },
    { time: "16:00", llmLatency: 520, apiLatency: 230, agentLatency: 650, workflowCount: 22 },
    { time: "18:00", llmLatency: 480, apiLatency: 210, agentLatency: 600, workflowCount: 18 },
    { time: "20:00", llmLatency: 420, apiLatency: 190, agentLatency: 550, workflowCount: 15 },
    { time: "22:00", llmLatency: 350, apiLatency: 160, agentLatency: 500, workflowCount: 12 },
  ];

  // Sample resource utilization data
  const resourceData = [
    { time: "00:00", cpu: 35, memory: 45, gpu: 25 },
    { time: "02:00", cpu: 38, memory: 48, gpu: 28 },
    { time: "04:00", cpu: 40, memory: 50, gpu: 30 },
    { time: "06:00", cpu: 45, memory: 55, gpu: 35 },
    { time: "08:00", cpu: 60, memory: 65, gpu: 50 },
    { time: "10:00", cpu: 75, memory: 75, gpu: 65 },
    { time: "12:00", cpu: 85, memory: 80, gpu: 75 },
    { time: "14:00", cpu: 80, memory: 78, gpu: 70 },
    { time: "16:00", cpu: 75, memory: 75, gpu: 65 },
    { time: "18:00", cpu: 65, memory: 70, gpu: 55 },
    { time: "20:00", cpu: 55, memory: 65, gpu: 45 },
    { time: "22:00", cpu: 45, memory: 55, gpu: 35 },
  ];

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 py-3 px-6">
          <h2 className="text-xl font-medium">System Monitoring</h2>
        </header>
        
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Active Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">12</div>
                <div className="text-sm text-green-500 mt-1">+3 from yesterday</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Avg. Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">450ms</div>
                <div className="text-sm text-red-500 mt-1">+50ms from yesterday</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">Good</div>
                <div className="text-sm text-gray-500 mt-1">All services operational</div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="performance">
            <TabsList className="mb-4">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="resources">Resource Utilization</TabsTrigger>
              <TabsTrigger value="logs">System Logs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Latency Metrics (Last 24 Hours)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={performanceData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="llmLatency" name="LLM Latency (ms)" stroke="#3B82F6" />
                        <Line type="monotone" dataKey="apiLatency" name="API Latency (ms)" stroke="#10B981" />
                        <Line type="monotone" dataKey="agentLatency" name="Agent Latency (ms)" stroke="#8B5CF6" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Executions (Last 24 Hours)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={performanceData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="workflowCount" name="Workflow Count" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="resources" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resource Utilization (Last 24 Hours)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={resourceData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="cpu" name="CPU Usage (%)" stroke="#3B82F6" />
                        <Line type="monotone" dataKey="memory" name="Memory Usage (%)" stroke="#10B981" />
                        <Line type="monotone" dataKey="gpu" name="GPU Usage (%)" stroke="#8B5CF6" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="logs">
              <Card>
                <CardHeader>
                  <CardTitle>System Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-gray-100 font-mono p-4 rounded-md h-96 overflow-auto">
                    {[...Array(20)].map((_, i) => (
                      <div key={i} className="mb-2">
                        <span className="text-gray-500">[{new Date(Date.now() - i * 300000).toISOString()}]</span>{" "}
                        <span className={
                          i % 10 === 0 ? 'text-red-400' : 
                          i % 5 === 0 ? 'text-yellow-400' : 
                          'text-green-400'
                        }>
                          {i % 10 === 0 ? 'ERROR' : i % 5 === 0 ? 'WARN' : 'INFO'}
                        </span>{" "}
                        <span>
                          {i % 10 === 0 ? 'Failed to connect to external API' : 
                           i % 5 === 0 ? 'High resource utilization detected' : 
                           `Workflow #${Math.floor(Math.random() * 1000)} executed successfully`}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
