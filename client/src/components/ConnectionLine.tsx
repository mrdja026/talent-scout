import React, { useEffect, useRef } from "react";

interface ConnectionLineProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  id: string;
  label?: string;
  isDashed?: boolean;
  isActive?: boolean;
  data?: any;
  isEntityConnection?: boolean;
  sourceType?: string;
  targetType?: string;
  entityInfo?: {
    type?: string;
    name?: string;
    id?: number;
  };
}

/**
 * React component for rendering connection lines between nodes
 * This makes connection lines part of the React component tree
 * so they persist through renders
 */
export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  startX,
  startY,
  endX,
  endY,
  color,
  id,
  label,
  isDashed = false,
  isActive = false,
  data = null,
  isEntityConnection = false,
  sourceType = "",
  targetType = "",
  entityInfo = {}
}) => {
  // Use refs to track the elements we create
  const pathRef = useRef<SVGPathElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const rectRef = useRef<SVGRectElement>(null);
  const markerRef = useRef<SVGMarkerElement>(null);
  
  // Control points for curved path - using a custom curved path calculation
  const dx = Math.abs(endX - startX) * 0.5;
  const dy = Math.abs(endY - startY) * 0.5;
  const curve = Math.min(dx, 150); // Limit the curve intensity
  
  // Create a better curved path with improved control points
  const pathD = `M ${startX} ${startY} C ${startX + curve} ${startY}, ${endX - curve} ${endY}, ${endX} ${endY}`;
  
  // Calculate middle point for label positioning
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  
  // Calculate label dimensions
  const labelWidth = label ? label.length * 5.5 : 0;
  
  const markerId = `arrow-${id}`;
  
  // Log when this component renders
  useEffect(() => {
    console.log(`ConnectionLine rendered: ${id}`);
    
    return () => {
      console.log(`ConnectionLine unmounted: ${id}`);
    };
  }, [id]);
  
  return (
    <>
      <defs>
        <marker
          ref={markerRef}
          id={markerId}
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      </defs>
      
      {/* Label background */}
      {label && (
        <rect
          ref={rectRef}
          x={midX - labelWidth/2}
          y={midY - 22}
          width={labelWidth}
          height={16}
          fill="white"
          rx={3}
        />
      )}
      
      {/* Connection line */}
      <path
        ref={pathRef}
        d={pathD}
        fill="none"
        stroke={isActive ? "#3B82F6" : color}
        strokeWidth={isActive ? 3 : (isEntityConnection ? 2.5 : 2)}
        strokeDasharray={isDashed ? "4" : (isEntityConnection ? "6,2" : "0")}
        markerEnd={`url(#${markerId})`}
        className={isActive ? "animate-pulse" : ""}
      />
      
      {/* Entity connection indicator */}
      {isEntityConnection && !isActive && (
        <g>
          {/* Small icon/badge to indicate entity connection */}
          <circle 
            cx={midX} 
            cy={midY - 5} 
            r={8} 
            fill="#f0f9ff" 
            stroke={color} 
            strokeWidth={1.5} 
          />
          <text
            x={midX}
            y={midY - 2}
            textAnchor="middle"
            fill={color}
            fontSize={8}
            fontWeight="bold"
          >
            {entityInfo?.type?.charAt(0).toUpperCase() || "E"}
          </text>
        </g>
      )}
      
      {/* Data flow animation */}
      {isActive && (
        <circle
          r="4"
          fill="#3B82F6"
          opacity="0.8"
          className="data-flow-particle"
        >
          <animateMotion
            dur="1.5s"
            repeatCount="indefinite"
            path={pathD}
          />
        </circle>
      )}
      
      {/* Connection label */}
      {label && (
        <text
          ref={textRef}
          x={midX}
          y={midY - 10}
          textAnchor="middle"
          fill="#374151"
          fontSize={10}
          fontWeight="bold"
        >
          {label}
        </text>
      )}
      
      {/* Data value preview (when data is flowing) */}
      {isActive && data && (
        <>
          <rect
            x={midX - 50}
            y={midY + 5}
            width={100}
            height={30}
            fill="white"
            stroke="#3B82F6"
            strokeWidth={1}
            rx={4}
            opacity={0.9}
          />
          <text
            x={midX}
            y={midY + 25}
            textAnchor="middle"
            fill="#374151"
            fontSize={9}
          >
            {typeof data === 'object' 
              ? JSON.stringify(data).substring(0, 20) + '...'
              : String(data).substring(0, 25)
            }
          </text>
        </>
      )}
    </>
  );
};