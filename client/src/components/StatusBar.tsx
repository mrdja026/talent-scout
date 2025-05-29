import { useWorkflow } from "@/contexts/WorkflowContext";

export default function StatusBar() {
  const { systemStatus, workflowMeta } = useWorkflow();
  
  const { apiConnected, modelsLoaded, mockMode } = systemStatus;
  const { version, status, lastSaved } = workflowMeta;
  
  const formattedLastSaved = lastSaved 
    ? new Date(lastSaved).toLocaleString() 
    : 'Never';

  return (
    <div className="bg-white border-t border-gray-200 py-2 px-6 flex items-center justify-between text-xs text-gray-500">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <div className={`w-2 h-2 ${apiConnected ? 'bg-status-success' : 'bg-status-error'} rounded-full mr-2`}></div>
          <span>API {apiConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <div className="flex items-center">
          <div className={`w-2 h-2 ${modelsLoaded > 0 ? 'bg-status-success' : 'bg-status-error'} rounded-full mr-2`}></div>
          <span>{modelsLoaded} Models Loaded</span>
        </div>
        <div className="flex items-center">
          <div className={`w-2 h-2 ${mockMode ? 'bg-status-warning' : 'bg-status-success'} rounded-full mr-2`}></div>
          <span>{mockMode ? 'Mock API Mode' : 'Production Mode'}</span>
        </div>
      </div>
      
      <div>
        <span>
          Workflow Version: {version} ({status}) • Last Saved: {formattedLastSaved}
        </span>
      </div>
    </div>
  );
}
