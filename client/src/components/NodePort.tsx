import { useState, useRef, useEffect } from "react";

interface NodePortProps {
  id: string;
  nodeId: string;
  type: "input" | "output";
  label: string;
  onPortMouseDown: (portId: string, nodeId: string, type: "input" | "output", label: string, position: {x: number, y: number}) => void;
  onPortMouseUp: (portId: string, nodeId: string, type: "input" | "output", label: string) => void;
  registerPort?: (id: string, element: HTMLElement | null) => void;
}

export default function NodePort({ 
  id, 
  nodeId, 
  type, 
  label, 
  onPortMouseDown, 
  onPortMouseUp, 
  registerPort 
}: NodePortProps) {
  const [isHovered, setIsHovered] = useState(false);
  const portRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Initial registration
    if (registerPort && portRef.current) {
      registerPort(id, portRef.current);
      console.log(`Port registered: ${id}`);
    }
    
    // Use a more reliable frequent update interval
    const updateTimer = setInterval(() => {
      if (registerPort && portRef.current) {
        registerPort(id, portRef.current);
      }
    }, 100); // More frequent updates for better responsiveness
    
    // Also register on mouse move events for better tracking during interactions
    const handleMouseMove = () => {
      if (registerPort && portRef.current) {
        registerPort(id, portRef.current);
      }
    };
    
    // This ensures we update port positions during UI interactions
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      // Clean up on unmount
      clearInterval(updateTimer);
      document.removeEventListener('mousemove', handleMouseMove);
      if (registerPort) {
        registerPort(id, null);
        console.log(`Port unregistered: ${id}`);
      }
    };
  }, [id, registerPort]);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (portRef.current) {
      const rect = portRef.current.getBoundingClientRect();
      const position = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      onPortMouseDown(id, nodeId, type, label, position);
    } else {
      // Fallback if portRef is not available
      onPortMouseDown(id, nodeId, type, label, {
        x: e.clientX,
        y: e.clientY
      });
    }
  };
  
  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPortMouseUp(id, nodeId, type, label);
  };
  
  // Input and output have different colors
  const portColor = type === "input" ? "#3B82F6" : "#10B981";
  
  return (
    <div 
      className="flex items-center group" 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {type === "input" && (
        <>
          <div
            ref={portRef}
            className={`h-3 w-3 rounded-full cursor-crosshair ${isHovered ? 'ring-2 ring-offset-1' : ''}`}
            style={{ 
              backgroundColor: portColor,
              borderWidth: "2px",
              borderColor: "white"
            }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            data-port-id={id}
            data-node-id={nodeId}
            data-port-type={type}
          />
          <span className={`ml-2 text-xs ${isHovered ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
        </>
      )}
      
      {type === "output" && (
        <>
          <span className={`mr-2 text-xs text-right ${isHovered ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
          <div
            ref={portRef}
            className={`h-3 w-3 rounded-full cursor-crosshair ${isHovered ? 'ring-2 ring-offset-1' : ''}`}
            style={{ 
              backgroundColor: portColor,
              borderWidth: "2px",
              borderColor: "white"
            }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            data-port-id={id}
            data-node-id={nodeId}
            data-port-type={type}
          />
        </>
      )}
    </div>
  );
}