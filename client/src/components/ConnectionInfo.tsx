import React from "react";

interface Connection {
  sourceNode?: string;
  targetNode?: string;
  sourcePort?: string;
  targetPort?: string;
  [key: string]: any;
}

interface ConnectionInfoProps {
  connections: Connection[];
  type: "input" | "output";
}

// A component to safely display connection information
export default function ConnectionInfo({ connections, type }: ConnectionInfoProps) {
  if (!connections || !Array.isArray(connections) || connections.length === 0) {
    return null;
  }

  return (
    <div className="mb-2">
      <p className="text-xs font-medium text-blue-600">{type === 'input' ? 'Inputs:' : 'Outputs:'}</p>
      {connections.map((conn, idx) => {
        // Safely extract node names
        const sourceNodeName = typeof conn.sourceNode === 'string' ? conn.sourceNode : 'Connected node';
        const targetNodeName = typeof conn.targetNode === 'string' ? conn.targetNode : 'Connected node';
        
        // Safely extract port names
        const sourcePortName = typeof conn.sourcePort === 'string' ? conn.sourcePort : 'output';
        const targetPortName = typeof conn.targetPort === 'string' ? conn.targetPort : 'input';
        
        return (
          <div key={`${type}-${idx}`} className="text-xs mb-1">
            <p className="text-blue-600 flex items-center">
              {type === 'input' ? (
                <>
                  <span className="mr-1">←</span>
                  <span className="truncate">{sourceNodeName}</span>
                </>
              ) : (
                <>
                  <span className="truncate">{targetNodeName}</span>
                  <span className="ml-1">→</span>
                </>
              )}
            </p>
            <p className="text-gray-500 text-xs pl-3 truncate">
              {sourcePortName} → {targetPortName}
            </p>
          </div>
        );
      })}
    </div>
  );
}