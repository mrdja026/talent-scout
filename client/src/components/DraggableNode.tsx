import { useRef, useState, useEffect } from "react";
import { useWorkflow } from "@/contexts/WorkflowContext";
import { defaultNodeConfigs } from "@/lib/mockNodes";

export interface NodeType {
  type: string;
  label: string;
  icon: string;
  color: string;
  lightColor: string;
  darkColor?: string;
  entityType?: string;
  entityId?: number;
  entityData?: any;
}

interface DraggableNodeProps {
  node: NodeType;
}

export default function DraggableNode({ node }: DraggableNodeProps) {
  const { addNode } = useWorkflow();
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Handle the drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!nodeRef.current) return;
    
    // Get the offset of the pointer within the node
    const rect = nodeRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    setIsDragging(true);
    e.preventDefault();
  };
  
  // Handle the drag move
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    if (nodeRef.current) {
      // Create a "ghost" element to follow the cursor
      const ghost = nodeRef.current.cloneNode(true) as HTMLElement;
      ghost.style.position = 'fixed';
      ghost.style.left = `${e.clientX - dragOffset.x}px`;
      ghost.style.top = `${e.clientY - dragOffset.y}px`;
      ghost.style.opacity = '0.7';
      ghost.style.pointerEvents = 'none';
      ghost.style.zIndex = '9999';
      ghost.id = 'ghost-node';
      
      // Remove any existing ghost
      const existingGhost = document.getElementById('ghost-node');
      if (existingGhost) {
        existingGhost.remove();
      }
      
      // Add the ghost to the body
      document.body.appendChild(ghost);
    }
  };
  
  // Handle the drag end
  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Remove ghost element
    const ghost = document.getElementById('ghost-node');
    if (ghost) {
      ghost.remove();
    }
    
    // Find the workflow canvas
    const canvasElement = document.querySelector('.workflow-canvas');
    if (!canvasElement) return;
    
    // Get the canvas position and scroll
    const canvasRect = canvasElement.getBoundingClientRect();
    const canvasElement1 = canvasElement as HTMLElement;
    const canvasScrollLeft = canvasElement1.scrollLeft || 0;
    const canvasScrollTop = canvasElement1.scrollTop || 0;
    
    // Check if the drop is within the canvas
    if (
      e.clientX >= canvasRect.left &&
      e.clientX <= canvasRect.right &&
      e.clientY >= canvasRect.top &&
      e.clientY <= canvasRect.bottom
    ) {
      // Calculate position relative to the canvas, accounting for scroll
      const posX = e.clientX - canvasRect.left + canvasScrollLeft;
      const posY = e.clientY - canvasRect.top + canvasScrollTop;
      
      // Prepare the node data
      const nodeData: any = {
        label: node.label,
        icon: node.icon,
        color: node.color,
        lightColor: node.lightColor,
        darkColor: node.darkColor,
      };
      
      // Add entity information if available
      if (node.entityType && node.entityId) {
        nodeData.entityType = node.entityType;
        nodeData.entityId = node.entityId;
        
        // Store only minimal data to avoid React rendering issues
        // Full entity data will be fetched and displayed in the Properties panel
        if (node.entityData) {
          nodeData.entityReferenceId = String(node.entityId);
          nodeData.entityReferenceType = String(node.entityType);
        }
      }
      
      // For non-entity nodes, use the default configuration
      if (!node.entityType && defaultNodeConfigs[node.type]) {
        Object.assign(nodeData, defaultNodeConfigs[node.type]);
      }
      
      // Add the node to the workflow
      addNode({
        type: node.type,
        position: { x: posX, y: posY },
        data: nodeData,
        width: 256, // Default width
        height: 160, // Default height
      });
    }
  };
  
  // Set up event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      // Clean up any ghost element
      const ghost = document.getElementById('ghost-node');
      if (ghost) {
        ghost.remove();
      }
    };
  }, [isDragging, dragOffset]);
  
  // Determine if this is a real entity node vs a standard node
  const isEntityNode = node.entityType && node.entityId;
  
  return (
    <div
      ref={nodeRef}
      onMouseDown={handleMouseDown}
      className={`workflow-node bg-white border border-gray-300 hover:border-primary rounded-md p-3 mb-2 shadow-sm cursor-move`}
    >
      <div className="flex items-center">
        <div className={`w-6 h-6 bg-${node.color} rounded-md flex items-center justify-center`}>
          <span className={`material-icons text-white text-xs`}>
            {node.icon}
          </span>
        </div>
        <div className="ml-2 flex-1">
          <span className="text-sm font-medium">{node.label}</span>
          {isEntityNode && (
            <div className="text-xs text-gray-500 mt-0.5">
              {node.entityType === 'agent' && 'Agent'}
              {node.entityType === 'model' && `${node.entityData?.provider || 'LLM'}`}
              {node.entityType === 'connector' && (typeof node.entityData?.type === 'string' ? node.entityData.type : 'Connector')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
