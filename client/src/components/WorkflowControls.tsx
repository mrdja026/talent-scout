import { useWorkflow } from '@/contexts/WorkflowContext';

export default function WorkflowControls() {
  const { 
    executionState, 
    runWorkflow, 
    stopWorkflow,
    pauseWorkflow,
    resumeWorkflow 
  } = useWorkflow();

  // Time elapsed since workflow start
  const getElapsedTime = () => {
    if (!executionState.startTime) return '0:00';
    
    const elapsed = executionState.endTime 
      ? executionState.endTime - executionState.startTime 
      : Date.now() - executionState.startTime;
    
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Execution progress percentage
  const getProgressPercentage = () => {
    const totalNodes = Object.keys(executionState.nodeStates).length;
    if (totalNodes === 0) return 0;
    
    const completedNodes = Object.values(executionState.nodeStates).filter(
      state => state === 'complete' || state === 'error'
    ).length;
    
    return Math.round((completedNodes / totalNodes) * 100);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-md font-medium">Workflow Execution</h3>
        <div className="flex items-center text-sm text-gray-500">
          <span className="material-icons text-sm mr-1">timer</span>
          <span>{getElapsedTime()}</span>
        </div>
      </div>
      
      {/* Progress bar */}
      {executionState.workflowState !== 'idle' && (
        <div className="mb-3">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                executionState.workflowState === 'error' 
                  ? 'bg-red-500' 
                  : executionState.workflowState === 'complete' 
                  ? 'bg-green-500' 
                  : 'bg-blue-500'
              }`}
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Progress: {getProgressPercentage()}%</span>
            <span className="capitalize">Status: {executionState.workflowState}</span>
          </div>
        </div>
      )}
      
      {/* Execution stats */}
      {executionState.workflowState !== 'idle' && (
        <div className="grid grid-cols-4 gap-2 mb-3 text-center text-xs">
          <div className="bg-gray-100 p-2 rounded">
            <div className="font-medium">Total</div>
            <div>{Object.keys(executionState.nodeStates).length}</div>
          </div>
          <div className="bg-blue-100 p-2 rounded">
            <div className="font-medium">Running</div>
            <div>{Object.values(executionState.nodeStates).filter(state => state === 'running').length}</div>
          </div>
          <div className="bg-green-100 p-2 rounded">
            <div className="font-medium">Complete</div>
            <div>{Object.values(executionState.nodeStates).filter(state => state === 'complete').length}</div>
          </div>
          <div className="bg-yellow-100 p-2 rounded">
            <div className="font-medium">Waiting</div>
            <div>{Object.values(executionState.nodeStates).filter(state => state === 'waiting').length}</div>
          </div>
        </div>
      )}
      
      {/* Control buttons */}
      <div className="flex space-x-2">
        {executionState.workflowState === 'idle' && (
          <button
            onClick={runWorkflow}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center"
          >
            <span className="material-icons text-sm mr-1">play_arrow</span>
            Run Workflow
          </button>
        )}
        
        {(executionState.workflowState === 'running' || executionState.workflowState === 'paused') && (
          <>
            <button
              onClick={stopWorkflow}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded flex items-center justify-center"
            >
              <span className="material-icons text-sm mr-1">stop</span>
              Stop
            </button>
            
            {executionState.workflowState === 'running' ? (
              <button
                onClick={pauseWorkflow}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded flex items-center justify-center"
              >
                <span className="material-icons text-sm mr-1">pause</span>
                Pause
              </button>
            ) : (
              <button
                onClick={resumeWorkflow}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center"
              >
                <span className="material-icons text-sm mr-1">play_arrow</span>
                Resume
              </button>
            )}
          </>
        )}
        
        {(executionState.workflowState === 'complete' || executionState.workflowState === 'error') && (
          <button
            onClick={runWorkflow}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center"
          >
            <span className="material-icons text-sm mr-1">replay</span>
            Run Again
          </button>
        )}
      </div>
    </div>
  );
}