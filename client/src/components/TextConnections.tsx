import React from 'react';

interface TextConnectionsProps {
  node: any;
}

// A simple component that renders connections as plain text
export default function TextConnections({ node }: TextConnectionsProps) {
  const inputConnections = node.data?.inputConnections || [];
  const outputConnections = node.data?.outputConnections || [];
  
  return (
    <div className="mt-3 p-2 bg-blue-50 rounded-md border border-blue-200 w-full overflow-hidden">
      <p className="text-xs font-medium text-blue-700 mb-1">Connections</p>
      
      {/* Input connections section */}
      {inputConnections.length > 0 && (
        <div className="mb-2">
          <p className="text-xs font-medium text-blue-600">Inputs:</p>
          <ul className="mt-1 list-disc pl-4">
            {inputConnections.map((_: any, idx: number) => (
              <li key={`in-${idx}`} className="text-xs truncate">
                Input Connection {idx + 1}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Output connections section */}
      {outputConnections.length > 0 && (
        <div>
          <p className="text-xs font-medium text-blue-600">Outputs:</p>
          <ul className="mt-1 list-disc pl-4">
            {outputConnections.map((_: any, idx: number) => (
              <li key={`out-${idx}`} className="text-xs truncate">
                Output Connection {idx + 1}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Show when no connections are available */}
      {inputConnections.length === 0 && outputConnections.length === 0 && (
        <p className="text-xs text-gray-500">Connected to workflow</p>
      )}
    </div>
  );
}