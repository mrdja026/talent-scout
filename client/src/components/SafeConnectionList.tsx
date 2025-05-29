import React from "react";

interface SafeConnectionListProps {
  connections: any[];
  type: "input" | "output";
}

/**
 * A simplified component that safely displays connection information
 * without trying to directly render object properties
 */
export default function SafeConnectionList({ connections, type }: SafeConnectionListProps) {
  if (!connections || !Array.isArray(connections) || connections.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-2">
      <p className="text-xs font-medium text-blue-600">
        {type === 'input' ? 'Inputs:' : 'Outputs:'}
      </p>
      <ul className="mt-1 space-y-1">
        {connections.map((conn, idx) => {
          // Get safe string values
          const sourceNodeLabel = typeof conn.sourceNode === 'string' 
            ? conn.sourceNode 
            : 'Connected node';
            
          const targetNodeLabel = typeof conn.targetNode === 'string' 
            ? conn.targetNode 
            : 'Connected node';
            
          const sourcePortLabel = typeof conn.sourcePort === 'string'
            ? conn.sourcePort
            : 'output';
            
          const targetPortLabel = typeof conn.targetPort === 'string'
            ? conn.targetPort
            : 'input';
          
          return (
            <li key={`${type}-${idx}`} className="text-xs bg-blue-50/50 p-1 rounded">
              {type === 'input' ? (
                <>
                  <div className="flex items-center">
                    <span className="mr-1 text-blue-500">←</span>
                    <span className="text-blue-600 truncate">{sourceNodeLabel}</span>
                  </div>
                  <div className="text-gray-500 pl-3 text-[10px] truncate">
                    {sourcePortLabel} → {targetPortLabel}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 truncate">{targetNodeLabel}</span>
                    <span className="ml-1 text-blue-500">→</span>
                  </div>
                  <div className="text-gray-500 pl-3 text-[10px] truncate">
                    {sourcePortLabel} → {targetPortLabel}
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}