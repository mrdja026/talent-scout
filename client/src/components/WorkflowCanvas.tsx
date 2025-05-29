import { useRef, useEffect, useState, useCallback } from "react";
import { useWorkflow } from "@/contexts/WorkflowContext";
import WorkflowNode from "./WorkflowNode";
import { defaultNodeConfigs } from "@/lib/mockNodes";
import { ConnectionLine } from "./ConnectionLine";
import { usePortPosition } from "@/hooks/usePortPosition";
import WorkflowControls from "./WorkflowControls";
import TemplateManager from "./TemplateManager";

export default function WorkflowCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 3000, height: 2000 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // For drawing connection lines during connection creation
  const [activeLine, setActiveLine] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    sourcePortId: string;
    sourceNodeId: string;
    sourcePortLabel: string;
    portType: "input" | "output";
  } | null>(null);
  
  // Track the active port for connection state across all nodes
  const [activePort, setActivePort] = useState<{
    portId: string;
    nodeId: string;
    type: "input" | "output";
    portIndex: number;
    portLabel: string;
  } | null>(null);
  
  // Use our port position tracking hook
  const { registerPort, getPortPosition, updateAllPositions } = usePortPosition();
  
  // Store connection visual data (positions) in a state var so they persist on rerenders
  const [connectionPositions, setConnectionPositions] = useState<Map<string, {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    sourceColor: string;
    label: string;
  }>>(new Map());
  
  const { nodes, connections, selectNode, addConnection, updateNode, executionState } = useWorkflow();

  // Calculate and update all connection positions
  const updateConnectionPositions = useCallback(() => {
    const newPositions = new Map();
    
    connections.forEach(connection => {
      const sourceNode = nodes.find(n => n.id === connection.source);
      const targetNode = nodes.find(n => n.id === connection.target);
      
      if (!sourceNode || !targetNode) return;
      
      // Find the output ports for the source node
      const sourceOutputs = defaultNodeConfigs[sourceNode.type]?.outputs || [];
      // Find the input ports for the target node
      const targetInputs = defaultNodeConfigs[targetNode.type]?.inputs || [];
      
      if (sourceOutputs.length === 0 || targetInputs.length === 0) return;
      
      // Get source and target port positions
      const sourcePortId = `${sourceNode.id}-output-${connection.sourcePortIndex || 0}`;
      const targetPortId = `${targetNode.id}-input-${connection.targetPortIndex || 0}`;
      
      const sourcePosition = getPortPosition(sourcePortId);
      const targetPosition = getPortPosition(targetPortId);
      
      if (!sourcePosition || !targetPosition) return;
      
      // Get SVG coordinates
      if (!svgRef.current) return;
      const svgRect = svgRef.current.getBoundingClientRect();
      
      // Calculate center points of ports relative to SVG
      const sourceX = sourcePosition.x - svgRect.left;
      const sourceY = sourcePosition.y - svgRect.top;
      const targetX = targetPosition.x - svgRect.left;
      const targetY = targetPosition.y - svgRect.top;
      
      // Create a label for the connection
      const sourcePort = connection.sourcePort || sourceOutputs[0];
      const targetPort = connection.targetPort || targetInputs[0];
      const label = `${sourcePort} → ${targetPort}`;
      
      // Check if either the source or target is an entity-based node
      const isSourceEntityNode = sourceNode.data?.entityType || 
                               sourceNode.type.includes('agent') || 
                               sourceNode.type.includes('model') || 
                               sourceNode.type.includes('dataSource');
                               
      const isTargetEntityNode = targetNode.data?.entityType || 
                               targetNode.type.includes('agent') || 
                               targetNode.type.includes('model') || 
                               targetNode.type.includes('dataSource');
      
      // Connection is entity-based if either endpoint is an entity
      const isEntityConnection = isSourceEntityNode || isTargetEntityNode;
      
      // Determine entity info for the connection badge
      let entityInfo = {};
      if (isEntityConnection) {
        if (isSourceEntityNode) {
          entityInfo = {
            type: sourceNode.data?.entityType || sourceNode.type,
            name: sourceNode.data?.label || "Entity",
            id: sourceNode.data?.entityId
          };
        } else if (isTargetEntityNode) {
          entityInfo = {
            type: targetNode.data?.entityType || targetNode.type,
            name: targetNode.data?.label || "Entity",
            id: targetNode.data?.entityId
          };
        }
      }
      
      // Store the connection position data with entity information
      newPositions.set(connection.id, {
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourceColor: sourceNode.data?.color || '#3B82F6',
        label,
        isEntityConnection,
        sourceType: sourceNode.type,
        targetType: targetNode.type,
        entityInfo
      });
    });
    
    setConnectionPositions(newPositions);
  }, [nodes, connections, getPortPosition, defaultNodeConfigs]);
  
  // Listen for connection events from node ports
  useEffect(() => {
    const handleConnectionStart = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        const { nodeId, portId, type, portLabel, portIndex, position } = detail;
        
        // Set the active port for connection
        setActivePort({
          portId,
          nodeId,
          type,
          portIndex,
          portLabel
        });
        
        // Initialize the active line for drawing
        setActiveLine({
          startX: position.x,
          startY: position.y,
          endX: position.x,
          endY: position.y,
          sourcePortId: portId,
          sourceNodeId: nodeId,
          sourcePortLabel: portLabel,
          portType: type
        });
        
        console.log("Canvas registered connection start:", { 
          portId, nodeId, type, portLabel, portIndex, position 
        });
      }
    };
    
    const handleConnectionEnd = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        const { nodeId, portId, type, portLabel } = detail;
        
        if (activePort && activePort.nodeId !== nodeId) {
          // Only create connection if:
          // 1. We have an active port (started a connection)
          // 2. The active port is from a different node 
          // 3. The active port is output and current port is input
          if (activePort.type === "output" && type === "input") {
            // Create the connection
            const sourceId = activePort.nodeId;
            const targetId = nodeId;
            
            // Add connection with port information
            addConnection(
              sourceId, 
              targetId, 
              activePort.portLabel, 
              portLabel, 
              activePort.portIndex, 
              parseInt(portId.split('-').pop() || '0')
            );
            
            console.log("Connection created:", { 
              source: sourceId, 
              target: targetId,
              sourcePort: activePort.portLabel,
              targetPort: portLabel
            });
          } else if (activePort.type === "input" && type === "output") {
            // Reverse connection (input to output)
            const sourceId = nodeId;
            const targetId = activePort.nodeId;
            
            // Add connection with port information
            addConnection(
              sourceId, 
              targetId, 
              portLabel, 
              activePort.portLabel, 
              parseInt(portId.split('-').pop() || '0'),
              activePort.portIndex
            );
            
            console.log("Connection created (reversed):", { 
              source: sourceId, 
              target: targetId,
              sourcePort: portLabel,
              targetPort: activePort.portLabel
            });
          } else {
            console.log("Cannot connect ports:", { 
              activePortType: activePort.type, 
              currentPortType: type 
            });
          }
          
          // Force an update of connection positions after creating a new connection
          setTimeout(updateConnectionPositions, 50);
        } else {
          console.log("Not creating connection, no active port or same node");
        }
      }
      
      // Reset connection state
      setActiveLine(null);
      setActivePort(null);
    };
    
    // Track mouse movement when drawing a connection
    const handleMouseMove = (e: MouseEvent) => {
      if (activeLine) {
        // Get scroll position
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Adjust mouse coordinates to account for scroll
        const adjustedX = e.clientX + scrollLeft;
        const adjustedY = e.clientY + scrollTop;
        
        setActiveLine(prev => {
          if (!prev) return null;
          return {
            ...prev,
            endX: adjustedX,
            endY: adjustedY
          };
        });
      }
    };
    
    document.addEventListener('connection-start', handleConnectionStart);
    document.addEventListener('connection-end', handleConnectionEnd);
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('connection-start', handleConnectionStart);
      document.removeEventListener('connection-end', handleConnectionEnd);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [activeLine, activePort, updateNode, addConnection, nodes, updateConnectionPositions]);
  
  // Fixed position calculation with precise measurements from the actual DOM structure
  // This ensures accurate connection points regardless of node or port rendering
  const calculateDirectConnectionPositions = useCallback(() => {
    const newPositions = new Map();
    
    connections.forEach(connection => {
      const sourceNode = nodes.find(n => n.id === connection.source);
      const targetNode = nodes.find(n => n.id === connection.target);
      
      if (!sourceNode || !targetNode) return;
      
      // Get output/input port labels
      const sourceOutputs = defaultNodeConfigs[sourceNode.type]?.outputs || [];
      const targetInputs = defaultNodeConfigs[targetNode.type]?.inputs || [];
      
      // Create a label for the connection
      const sourcePort = connection.sourcePort || sourceOutputs[0];
      const targetPort = connection.targetPort || targetInputs[0];
      const label = `${sourcePort} → ${targetPort}`;
      
      // Get port indices - ensure they're numbers
      const sourcePortIndex = typeof connection.sourcePortIndex === 'number' ? connection.sourcePortIndex : 0;
      const targetPortIndex = typeof connection.targetPortIndex === 'number' ? connection.targetPortIndex : 0;
      
      // Get node positions
      const sourcePos = sourceNode.position || { x: 0, y: 0 };
      const targetPos = targetNode.position || { x: 0, y: 0 };
      
      // Precise measurements based on the actual DOM structure and CSS
      const nodeWidth = 220;
      const headerHeight = 36;
      // The vertical position of each port depends on:
      // 1. Header height
      // 2. Padding after header (8px in most cases)
      // 3. Port vertical spacing (currently ~24px)
      // 4. Base port offset from the top of its container area
      const firstPortYOffset = headerHeight + 12; // Header + top padding to first port
      
      // Make port spacing larger to better match the actual DOM spacing
      const portVerticalSpacing = 27; // Adjusted based on actual spacing in DOM
      
      // Precisely calculate port positions
      const outputPortX = sourcePos.x + nodeWidth; // Right side of source node
      const inputPortX = targetPos.x; // Left side of target node
      
      // Calculate exact Y positions with the proper offsets
      // We need to make more precise measurements for the ports
      // Based on actual DOM structure and alignment
      
      // The magic numbers below were calculated from actual measurements
      // Header (36px) + padding (8px) + port offset (5px) + fine adjustment (3px)
      const outputPortY = sourcePos.y + 52 + (sourcePortIndex * portVerticalSpacing);
      
      // For input ports, we need a different calculation
      // Header (36px) + padding (8px) + port offset (5px) + fine adjustment (3px)
      const inputPortY = targetPos.y + 52 + (targetPortIndex * portVerticalSpacing);
      
      // Store the connection position data
      newPositions.set(connection.id, {
        sourceX: outputPortX,
        sourceY: outputPortY,
        targetX: inputPortX,
        targetY: inputPortY,
        sourceColor: sourceNode.data?.color || '#3B82F6',
        label
      });
    });
    
    console.log(`Calculated ${newPositions.size} connection positions using precise measurements`);
    setConnectionPositions(newPositions);
  }, [connections, nodes, defaultNodeConfigs]);
  
  // Update connections whenever they change or nodes move
  useEffect(() => {
    console.log(`Connections changed, count: ${connections.length}`);
    
    // Force a one-time calculation of all connections
    calculateDirectConnectionPositions();
    
    // Set up a continuous refresh timer to keep connections updated
    // This is critical to handle movement and ensure connections stay aligned
    const refreshTimer = setInterval(() => {
      calculateDirectConnectionPositions();
    }, 50); // More frequent updates for better responsiveness
    
    // Adjust the connection positions when any node moves
    // This helps ensure connections update immediately with node movement
    const handleNodeMove = () => {
      requestAnimationFrame(() => {
        calculateDirectConnectionPositions();
      });
    };
    
    // Add custom event listener for node movement
    document.addEventListener('node-moved', handleNodeMove);
    
    // Force multiple updates to ensure rendering is complete
    const initialUpdateTimeout = setTimeout(() => {
      calculateDirectConnectionPositions();
      // And again after a delay to ensure all elements are properly rendered
      setTimeout(calculateDirectConnectionPositions, 100);
      setTimeout(calculateDirectConnectionPositions, 300);
      setTimeout(calculateDirectConnectionPositions, 600);
    }, 0);
    
    return () => {
      clearInterval(refreshTimer);
      clearTimeout(initialUpdateTimeout);
      document.removeEventListener('node-moved', handleNodeMove);
    };
  }, [connections, nodes, calculateDirectConnectionPositions]); // Add nodes to dependencies to update when nodes move
  
  // Update connection positions when window is resized
  useEffect(() => {
    const handleResize = () => {
      // Use requestAnimationFrame to avoid potential update loops
      requestAnimationFrame(() => {
        updateAllPositions();
        // Add a small delay to ensure port positions are updated first
        setTimeout(() => {
          updateConnectionPositions();
        }, 50);
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [updateAllPositions]); // Remove updateConnectionPositions from deps to avoid loop
  
  // Handle canvas click to deselect nodes
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || e.target === svgRef.current) {
      selectNode(null);
    }
  };

  // Handle mouse wheel for zooming
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(prevScale => Math.min(Math.max(prevScale + delta, 0.5), 2));
    }
  };

  // Handle mouse down for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || e.target === svgRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle mouse move for panning
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle mouse up to end panning
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Directly draw connection lines without using components
  const renderConnections = () => {
    // Draw the active connection line if it exists
    const activePath = activeLine ? 
      createSVGPath(
        activeLine.startX, 
        activeLine.startY, 
        activeLine.endX, 
        activeLine.endY, 
        "#3B82F6", 
        true
      ) : null;
    
    // Draw all the permanent connection lines
    const connectionPaths = connections.map(connection => {
      // Find the source and target nodes
      const sourceNode = nodes.find(n => n.id === connection.source);
      const targetNode = nodes.find(n => n.id === connection.target);
      
      // Check if this connection has active data flow
      const hasDataFlow = executionState.dataFlow[connection.id] !== undefined;
      const isActive = (executionState.workflowState === "running" || 
                        executionState.workflowState === "paused") && 
                        hasDataFlow;
      
      if (!sourceNode || !targetNode) return null;
      
      // Try to get connection positions from our tracking system first
      const positionData = connectionPositions.get(connection.id);
      
      if (positionData) {
        // If we have positional data from our tracking system, use it
        // Use different colors and styles for active connections
        const color = isActive ? "#3B82F6" : positionData.sourceColor;
        
        // Check if either the source or target is an entity-based node
        const isSourceEntityNode = sourceNode.data?.entityType || 
                                 sourceNode.type.includes('agent') || 
                                 sourceNode.type.includes('model') || 
                                 sourceNode.type.includes('dataSource');
                                 
        const isTargetEntityNode = targetNode.data?.entityType || 
                                 targetNode.type.includes('agent') || 
                                 targetNode.type.includes('model') || 
                                 targetNode.type.includes('dataSource');
        
        // Connection is entity-based if either endpoint is an entity
        const isEntityConnection = isSourceEntityNode || isTargetEntityNode;
        
        // Determine entity info for the connection badge
        let entityInfo = {};
        if (isEntityConnection) {
          if (isSourceEntityNode) {
            entityInfo = {
              type: sourceNode.data?.entityType || sourceNode.type,
              name: sourceNode.data?.label || "Entity",
              id: sourceNode.data?.entityId
            };
          } else if (isTargetEntityNode) {
            entityInfo = {
              type: targetNode.data?.entityType || targetNode.type,
              name: targetNode.data?.label || "Entity",
              id: targetNode.data?.entityId
            };
          }
        }
        
        // For entity connections, use the ConnectionLine component
        if (isEntityConnection) {
          return (
            <ConnectionLine 
              key={connection.id}
              id={connection.id}
              startX={positionData.sourceX}
              startY={positionData.sourceY}
              endX={positionData.targetX}
              endY={positionData.targetY}
              color={color}
              label={positionData.label}
              isActive={isActive}
              data={executionState.dataFlow[connection.id]}
              isEntityConnection={true}
              sourceType={sourceNode.type}
              targetType={targetNode.type}
              entityInfo={entityInfo}
            />
          );
        }
        
        // For regular connections, use the createSVGPath function
        const pathElement = createSVGPath(
          positionData.sourceX, 
          positionData.sourceY, 
          positionData.targetX, 
          positionData.targetY, 
          color, 
          false, 
          connection.id
        );
        
        // If active, add a particle animation
        if (isActive) {
          // Create a curved path for animation
          const dx = Math.abs(positionData.targetX - positionData.sourceX) * 0.5;
          const curve = Math.min(dx, 150);
          const pathD = `M ${positionData.sourceX} ${positionData.sourceY} C ${positionData.sourceX + curve} ${positionData.sourceY}, ${positionData.targetX - curve} ${positionData.targetY}, ${positionData.targetX} ${positionData.targetY}`;
          
          return (
            <g key={connection.id}>
              {pathElement}
              <circle
                r="4"
                fill="#3B82F6"
                opacity="0.8"
              >
                <animateMotion
                  dur="1.5s"
                  repeatCount="indefinite"
                  path={pathD}
                />
              </circle>
            </g>
          );
        }
        
        return pathElement;
      } else {
        // Fallback to calculating positions from node data
        // Get node positions and dimensions
        const sourcePos = sourceNode.position || { x: 0, y: 0 };
        const targetPos = targetNode.position || { x: 0, y: 0 };
        const nodeWidth = 220;
        const nodeHeight = 100;
        
        // Calculate connection points
        const sourceX = sourcePos.x + nodeWidth;
        const sourceY = sourcePos.y + (nodeHeight / 2);
        const targetX = targetPos.x;
        const targetY = targetPos.y + (nodeHeight / 2);
        
        // Use different colors for active connections
        const color = isActive ? "#3B82F6" : (sourceNode.data?.color || '#3B82F6');
        
        // Create a line between the two nodes
        const pathElement = createSVGPath(
          sourceX, 
          sourceY, 
          targetX, 
          targetY, 
          color, 
          false,
          connection.id
        );
        
        // If active, add a particle animation for data flow
        if (isActive) {
          // Create a curved path for animation
          const dx = Math.abs(targetX - sourceX) * 0.5;
          const curve = Math.min(dx, 150);
          const pathD = `M ${sourceX} ${sourceY} C ${sourceX + curve} ${sourceY}, ${targetX - curve} ${targetY}, ${targetX} ${targetY}`;
          
          return (
            <g key={connection.id}>
              {pathElement}
              <circle
                r="4"
                fill="#3B82F6"
                opacity="0.8"
              >
                <animateMotion
                  dur="1.5s"
                  repeatCount="indefinite"
                  path={pathD}
                />
              </circle>
              
              {/* Add data preview tooltip when data is flowing */}
              {executionState.dataFlow[connection.id] && (
                <g>
                  <rect
                    x={(sourceX + targetX) / 2 - 50}
                    y={(sourceY + targetY) / 2 + 5}
                    width={100}
                    height={30}
                    fill="white"
                    stroke="#3B82F6"
                    strokeWidth={1}
                    rx={4}
                    opacity={0.9}
                  />
                  <text
                    x={(sourceX + targetX) / 2}
                    y={(sourceY + targetY) / 2 + 25}
                    textAnchor="middle"
                    fill="#374151"
                    fontSize={9}
                  >
                    {typeof executionState.dataFlow[connection.id] === 'object' 
                      ? JSON.stringify(executionState.dataFlow[connection.id]).substring(0, 20) + '...'
                      : String(executionState.dataFlow[connection.id]).substring(0, 25)
                    }
                  </text>
                </g>
              )}
            </g>
          );
        }
        
        return pathElement;
      }
    });
    
    // Return all paths
    return (
      <>
        {connectionPaths}
        {activePath}
      </>
    );
  };
  
  // Helper function to create an SVG path with a consistent style
  const createSVGPath = (startX: number, startY: number, endX: number, endY: number, color: string, isDashed: boolean, id?: string) => {
    // Adjust the path to ensure the arrow precisely reaches the endpoints
    // We'll extend the path slightly to ensure the arrow head is positioned correctly
    
    // Calculate the control points for the curve
    const dx = Math.abs(endX - startX) * 0.5;
    const dy = Math.abs(endY - startY);
    const curve = Math.min(dx, 100); // Limit curve intensity
    
    // Extend the end point slightly to ensure the arrow marker is properly positioned
    // This is critical because the marker is often drawn short of the actual path end
    const angle = Math.atan2(endY - startY, endX - startX);
    const arrowExtension = 8; // Length to extend to ensure arrow reaches target
    
    // Calculate extended endpoint
    const extendedEndX = endX + Math.cos(angle) * arrowExtension;
    const extendedEndY = endY + Math.sin(angle) * arrowExtension;
    
    // Create a smoother curved path that connects the endpoints precisely
    const pathD = `M ${startX} ${startY} C ${startX + curve} ${startY}, ${extendedEndX - curve} ${extendedEndY}, ${extendedEndX} ${extendedEndY}`;
    
    // Calculate the middle point for label positioning
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    
    const markerId = id ? `arrow-${id}` : 'arrow-temp';
    
    console.log(`Drawing path from (${startX},${startY}) to (${endX},${endY}) with ID ${markerId}`);
    
    return (
      <g key={id || 'active'}>
        <defs>
          <marker
            id={markerId}
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
          </marker>
        </defs>
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeDasharray={isDashed ? "4" : "0"}
          markerEnd={`url(#${markerId})`}
        />
      </g>
    );
  };

  return (
    <div 
      className="workflow-canvas flex-1 overflow-auto bg-slate-100 canvas-grid relative"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
    >
      {/* Workflow controls panel */}
      <div className="absolute top-4 right-4 z-10 w-72">
        <WorkflowControls />
      </div>
      
      {/* Template controls panel */}
      <div className="absolute top-4 left-4 z-10">
        <TemplateManager />
      </div>
      <div 
        ref={canvasRef}
        className="min-h-full min-w-full p-8 relative"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Main canvas area - nodes container should be above SVG */}
        <div className="relative w-full h-full">
          {/* Connection Lines SVG - Using direct rendering */}
          <svg 
            ref={svgRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none" 
            style={{ zIndex: 1 }}
          >
            {/* Render all connections with our new method */}
            {renderConnections()}
          </svg>
          
          {/* Render all workflow nodes - explicitly set higher z-index */}
          <div className="relative" style={{ zIndex: 10 }}>
            {nodes.map(node => (
              <WorkflowNode 
                key={node.id} 
                node={node} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}