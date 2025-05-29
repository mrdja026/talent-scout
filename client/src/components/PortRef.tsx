import React, { useRef, useEffect } from "react";

interface PortRefProps {
  id: string;
  registerPort: (id: string, element: HTMLElement | null) => void;
  children: React.ReactNode;
}

/**
 * A wrapper component that registers port elements with the port position system
 * Helps maintain port references for accurate connection drawing
 */
export const PortRef: React.FC<PortRefProps> = ({ id, registerPort, children }) => {
  const portRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (portRef.current) {
      registerPort(id, portRef.current);
    }
    
    return () => {
      // Clean up on unmount
      registerPort(id, null);
    };
  }, [id, registerPort]);
  
  return (
    <div ref={portRef} data-port-id={id}>
      {children}
    </div>
  );
};