import { useRef, useState, useEffect } from "react";
import { useWorkflow, NodeExecutionState } from "@/contexts/WorkflowContext";
import { Node } from "@shared/schema";
import { defaultNodeConfigs } from "@/lib/mockNodes";
import NodePort from "./NodePort";
import { usePortPosition } from "@/hooks/usePortPosition";
import ManualStepControls from "./ManualStepControls";

interface WorkflowNodeProps {
  node: Node;
}

export default function WorkflowNode({ node }: WorkflowNodeProps) {
  const { 
    selectNode, 
    selectedNode, 
    updateNodePosition, 
    removeNode, 
    updateNode,
    executionState,
    approveManualStep,
    rejectManualStep
  } = useWorkflow();
  const { registerPort } = usePortPosition();
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const isSelected = selectedNode?.id === node.id;
  
  // Determine if the node should be draggable based on workflow execution state
  const isWorkflowRunning = executionState.workflowState === "running" || 
                           executionState.workflowState === "paused";
  
  // Set up direct DOM dragging without the hook
  useEffect(() => {
    const element = nodeRef.current;
    if (!element) return;
    
    // Debug element properties on mount
    console.log("NODE DEBUG: Element mounted", {
      nodeId: node.id,
      position: element.style.position,
      left: element.style.left,
      top: element.style.top,
    });
    
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;
    
    // Ensure the node is absolutely positioned
    if (element.style.position !== 'absolute') {
      element.style.position = 'absolute';
    }
    
    // Set initial position from node data if not already set
    if (!element.style.left) {
      element.style.left = `${node.position?.x || 0}px`;
    }
    if (!element.style.top) {
      element.style.top = `${node.position?.y || 0}px`;
    }
    
    const handleMouseDown = (e: MouseEvent) => {
      if (isWorkflowRunning) return;
      
      // Get the target element
      const target = e.target as HTMLElement;
      
      // NEVER allow dragging if clicking on port elements
      // Check if we clicked on a port circle or port container
      if (
        target.dataset.portId || 
        target.getAttribute('data-port-id') || 
        target.closest('[data-port-id]')
      ) {
        console.log("NODE DEBUG: Click on port, blocking node drag", target);
        return;
      }
      
      // Skip clicks on other interactive elements
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('button')
      ) {
        console.log("NODE DEBUG: Click on interactive element, blocking node drag");
        return;
      }
      
      console.log("NODE DEBUG: Mouse down on node body", node.id);
      
      // Select the node
      selectNode(node.id);
      
      // Get current position
      initialLeft = parseFloat(element.style.left || '0');
      initialTop = parseFloat(element.style.top || '0');
      
      // Set starting coordinates
      startX = e.clientX;
      startY = e.clientY;
      
      setIsDragging(true);
      
      // Add document-level event listeners
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      e.preventDefault();
      e.stopPropagation();
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      // Calculate displacement
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      // Update element position
      const newLeft = initialLeft + dx;
      const newTop = initialTop + dy;
      
      console.log("NODE DEBUG: Moving node", { 
        nodeId: node.id, 
        newLeft, 
        newTop 
      });
      
      element.style.left = `${newLeft}px`;
      element.style.top = `${newTop}px`;
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;
      
      setIsDragging(false);
      
      // Get final position from the element's style
      const finalLeft = parseFloat(element.style.left || '0');
      const finalTop = parseFloat(element.style.top || '0');
      
      console.log("NODE DEBUG: Drag ended", { 
        nodeId: node.id, 
        finalLeft, 
        finalTop 
      });
      
      // Update node position in application state
      updateNodePosition(node.id, { x: finalLeft, y: finalTop });
      
      // Force canvas to refresh connections
      const event = new CustomEvent('node-moved', { detail: { nodeId: node.id } });
      document.dispatchEvent(event);
      
      // Clean up event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    // Attach the mouse down handler to begin drag
    element.addEventListener('mousedown', handleMouseDown);
    
    // Clean up all event listeners on unmount
    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [node.id, node.position?.x, node.position?.y, isDragging, isWorkflowRunning, selectNode, updateNodePosition]);

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(node.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    // This would open a modal or update the properties panel
    selectNode(node.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeNode(node.id);
  };
  
  const handlePortMouseDown = (portId: string, nodeId: string, type: "input" | "output", portLabel: string, position: {x: number, y: number}) => {
    // Extract the port index from the portId (format: nodeId-type-index)
    const portIdParts = portId.split('-');
    const portIndex = parseInt(portIdParts[portIdParts.length - 1]);
    
    if (type === "output") {
      // Find the SVG element to get proper coordinate space
      const svgElement = document.querySelector('.workflow-canvas svg');
      let svgRect = { left: 0, top: 0 };
      
      if (svgElement) {
        svgRect = svgElement.getBoundingClientRect();
      }
      
      // Adjust the position to be relative to the SVG coordinate space
      const adjustedPosition = {
        x: position.x - svgRect.left,
        y: position.y - svgRect.top
      };
      
      // Notify the parent component (WorkflowCanvas) that we're starting a connection
      const event = new CustomEvent('connection-start', { 
        detail: { 
          nodeId, 
          portId, 
          type, 
          portLabel, 
          portIndex, 
          position: adjustedPosition
        } 
      });
      document.dispatchEvent(event);
      
      console.log("Starting connection from:", { 
        nodeId, portId, type, portLabel, portIndex, 
        position: adjustedPosition,
        originalPosition: position
      });
    } else {
      console.log("Cannot start connection from input port");
    }
  };
  
  const handlePortMouseUp = (portId: string, nodeId: string, type: "input" | "output", portLabel: string) => {
    console.log("Port mouse up:", { portId, nodeId, type, portLabel });
    
    // Notify the parent we're ending a connection
    const event = new CustomEvent('connection-end', { 
      detail: { 
        nodeId, 
        portId, 
        type, 
        portLabel 
      } 
    });
    document.dispatchEvent(event);
  };
  
  const getPortPosition = (portId: string, nodeId: string): { x: number, y: number } => {
    const portElement = document.querySelector(`[data-port-id="${portId}"][data-node-id="${nodeId}"]`);
    if (!portElement) return { x: 0, y: 0 };
    
    // Get the position relative to the viewport
    const rect = portElement.getBoundingClientRect();
    
    // Adjust for scroll position
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Get the center of the port element in absolute position
    return {
      x: rect.left + rect.width / 2 + scrollLeft,
      y: rect.top + rect.height / 2 + scrollTop
    };
  };

  // Default values if not specified
  const nodeType = node.type || "default";
  const nodeConfig = defaultNodeConfigs[nodeType] || {};
  
  const icon = node.data?.icon || nodeConfig.icon || "widgets";
  const label = node.data?.label || nodeConfig.label || "Node";
  const color = node.data?.color || nodeConfig.color || "blue-500";
  const lightColor = node.data?.lightColor || nodeConfig.lightColor || "blue-100";
  
  // Get input and output ports
  const inputs = node.data?.inputs || nodeConfig.inputs || [];
  const outputs = node.data?.outputs || nodeConfig.outputs || [];
  
  return (
    <div
      ref={nodeRef}
      className={`
        workflow-node absolute bg-white rounded-lg shadow-md border-2 
        ${isSelected ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-gray-200'} 
        select-none min-w-[220px] overflow-hidden transition-shadow
        ${isDragging ? 'cursor-grabbing opacity-80' : isWorkflowRunning ? 'cursor-default' : 'cursor-grab'}
      `}
      style={{ 
        left: node.position?.x || 0, 
        top: node.position?.y || 0,
      }}
      onClick={handleNodeClick}
    >
      {/* Node header */}
      <div 
        className={`flex items-center p-2 text-white bg-${color}`}
        style={{ backgroundColor: node.data?.darkColor || `var(--${color})` }}
      >
        <div className={`w-6 h-6 rounded-md flex items-center justify-center bg-${color} relative`}>
          <span className="material-icons text-sm">{icon}</span>
          
          {/* Execution state indicator */}
          {executionState.nodeStates[node.id] && (
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white ${
              executionState.nodeStates[node.id] === "running" ? "bg-blue-500 animate-pulse" : 
              executionState.nodeStates[node.id] === "complete" ? "bg-green-500" : 
              executionState.nodeStates[node.id] === "error" ? "bg-red-500" : 
              executionState.nodeStates[node.id] === "waiting" ? "bg-yellow-500" : 
              "bg-gray-500"
            }`}></div>
          )}
        </div>
        <span className="ml-2 font-medium text-sm truncate flex-1">{label}</span>
        
        <div className="flex space-x-1">
          {/* Display execution state as text */}
          {executionState.nodeStates[node.id] && (
            <span className="text-xs mr-1 bg-white bg-opacity-20 px-1 rounded">
              {executionState.nodeStates[node.id] === "running" ? "Running" : 
               executionState.nodeStates[node.id] === "complete" ? "Complete" : 
               executionState.nodeStates[node.id] === "error" ? "Error" : 
               executionState.nodeStates[node.id] === "waiting" ? "Waiting" : 
               "Idle"}
            </span>
          )}
          
          <button 
            onClick={handleEdit}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-white hover:bg-opacity-20"
          >
            <span className="material-icons text-xs">edit</span>
          </button>
          <button 
            onClick={handleDelete}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-white hover:bg-opacity-20"
          >
            <span className="material-icons text-xs">delete</span>
          </button>
        </div>
      </div>
      
      {/* Node body with input and output ports */}
      <div className="p-2 flex">
        {/* Input ports on the left */}
        {inputs.length > 0 && (
          <div className="w-1/3 pr-2 space-y-2">
            {inputs.map((input: string, index: number) => (
              <NodePort 
                key={`input-${index}`}
                id={`${node.id}-input-${index}`}
                nodeId={node.id}
                type="input"
                label={input}
                onPortMouseDown={handlePortMouseDown}
                onPortMouseUp={handlePortMouseUp}
                registerPort={registerPort}
              />
            ))}
          </div>
        )}
        
        {/* Node content in the middle */}
        <div className={`${inputs.length > 0 || outputs.length > 0 ? 'w-1/3' : 'w-full'} px-2`}>
          {/* Special handling for manual step nodes */}
          {(node.type === "manualStep" || node.type === "fileUpload") ? (
            <ManualStepControls
              nodeId={node.id}
              nodeType={node.type as "manualStep" | "fileUpload"}
              prompt={node.data?.prompt}
              instructions={node.data?.instructions}
              status={executionState.nodeStates[node.id] === "waiting" ? "waiting" : 
                     executionState.nodeStates[node.id] === "complete" ? "complete" : 
                     node.data?.status || "idle"}
              acceptedTypes={node.data?.acceptedTypes}
              onContinue={(nodeId, data) => {
                // Get any incoming data for this node
                const nodeExecution = executionState.nodeExecutions.find(
                  ne => ne.nodeId === nodeId && ne.output
                );
                
                // Combine the incoming data with user input
                const combinedData = {
                  ...nodeExecution?.output,  // Include any data that came into this node
                  ...data,                   // Add the user's input/response data
                  timestamp: new Date().toISOString()
                };
                
                // Use the workflow context to approve the manual step with the combined data
                approveManualStep(nodeId, combinedData);
              }}
            />
          ) : (
            <>
              {/* Display asynchronous processing indicators for AI/LLM nodes */}
              {(executionState.nodeStates[node.id] === "processing" || 
                executionState.nodeStates[node.id] === "waiting") && 
                (node.type === "agent" || node.type === "llm" || 
                 node.type.includes("agent") || node.type.includes("model")) && (
                <>
                  <div className="mb-2 text-xs flex flex-col space-y-2">
                    {/* Get the node execution details */}
                    {(() => {
                      const nodeExecution = executionState.nodeExecutions.find(ne => ne.nodeId === node.id);
                      if (!nodeExecution) return null;
                      
                      return (
                        <>
                          {/* Show processing message */}
                          <div className="text-center font-medium text-gray-600">
                            {nodeExecution.processingMessage || 
                             (executionState.nodeStates[node.id] === "waiting" 
                              ? "Waiting for dependencies..." 
                              : "Processing...")}
                          </div>
                          
                          {/* Show progress bar */}
                          {nodeExecution.processingProgress !== undefined && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-in-out"
                                style={{ width: `${nodeExecution.processingProgress}%` }}
                              ></div>
                            </div>
                          )}
                          
                          {/* Show dependencies if waiting */}
                          {executionState.nodeStates[node.id] === "waiting" && nodeExecution.dependencies && (
                            <div className="text-xs text-gray-500 mt-1">
                              <span>Waiting for: </span>
                              {nodeExecution.dependencies.map((depId, idx) => {
                                const depNode = nodes.find(n => n.id === depId);
                                return (
                                  <span key={depId} className="inline-block bg-gray-100 px-1 rounded mx-1">
                                    {depNode?.data?.label || `Node ${idx + 1}`}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                          
                          {/* Show estimated completion time */}
                          {nodeExecution.estimatedCompletionTime && (
                            <div className="text-xs text-gray-500 mt-1 text-center">
                              Estimated completion: {new Date(nodeExecution.estimatedCompletionTime).toLocaleTimeString()}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </>
              )}
              
              {/* Show loading spinner for running non-AI/LLM nodes */}
              {executionState.nodeStates[node.id] === "running" && (
                <div className="flex justify-center items-center py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-xs text-gray-600">Running...</span>
                </div>
              )}
              
              {/* Show result indicator for completed nodes */}
              {executionState.nodeStates[node.id] === "complete" && (
                <div className="flex items-center justify-center text-xs text-green-600 py-1">
                  <span className="material-icons text-sm mr-1">check_circle</span>
                  <span>Completed</span>
                </div>
              )}
              
              {/* Show error indicator for failed nodes */}
              {executionState.nodeStates[node.id] === "error" && (
                <div className="flex items-center justify-center text-xs text-red-600 py-1">
                  <span className="material-icons text-sm mr-1">error</span>
                  <span>Error</span>
                </div>
              )}
              
              {/* Display standard node properties when not in special execution states */}
              {(!executionState.nodeStates[node.id] || 
                (executionState.nodeStates[node.id] !== "processing" && 
                 executionState.nodeStates[node.id] !== "waiting")) && 
                node.data && Object.entries(node.data)
                .filter(([key]) => !['label', 'icon', 'color', 'lightColor', 'darkColor', 'connected', 'connectionType', 'connectionSource', 'connectionTarget', 'dataFlow', 'inputConnections', 'outputConnections', 'status', 'requiresAttention'].includes(key))
                .map(([key, value]) => (
                  <div key={key} className="text-xs text-gray-500 mb-2">
                    <span>{key.charAt(0).toUpperCase() + key.slice(1)}: {value as string}</span>
                  </div>
                ))}
                
              {/* Simple connection indicator */}
              {node.data?.connected && !executionState.nodeStates[node.id] && (
                <div className="mt-3 flex items-center text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  <p className="text-gray-600">Connected</p>
                  <p className="text-gray-400 ml-1">(Select to view details)</p>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Output ports on the right */}
        {outputs.length > 0 && (
          <div className="w-1/3 pl-2 space-y-2 flex flex-col items-end">
            {outputs.map((output: string, index: number) => (
              <NodePort 
                key={`output-${index}`}
                id={`${node.id}-output-${index}`}
                nodeId={node.id}
                type="output"
                label={output}
                onPortMouseDown={handlePortMouseDown}
                onPortMouseUp={handlePortMouseUp}
                registerPort={registerPort}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}