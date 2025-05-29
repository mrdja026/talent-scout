import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ToolsPanel from "@/components/ToolsPanel";
import WorkflowCanvas from "@/components/WorkflowCanvas";
import PropertiesPanel from "@/components/PropertiesPanel";
import StatusBar from "@/components/StatusBar";
import { WorkflowProvider } from "@/contexts/WorkflowContext";

export default function WorkflowDesigner() {
  return (
    <WorkflowProvider>
      <div className="flex h-screen">
        {/* Left Sidebar Navigation */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <Header />
          
          {/* Main Content - Workflow Designer */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Workflow Tools Panel */}
            <ToolsPanel />
            
            {/* Workflow Canvas */}
            <WorkflowCanvas />
            
            {/* Right Properties Panel */}
            <PropertiesPanel />
          </div>
          
          {/* Footer Status Bar */}
          <StatusBar />
        </div>
      </div>
    </WorkflowProvider>
  );
}
