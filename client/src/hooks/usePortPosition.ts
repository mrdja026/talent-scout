import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * A hook to track port positions for connections.
 * This helps maintain port positions even during rerenders.
 */
export const usePortPosition = () => {
  // Ref map to store port elements reference by their IDs
  const portRefs = useRef<Map<string, HTMLElement>>(new Map());
  
  // Use a ref to store port positions for better persistence across renders
  const portPositionsRef = useRef<Map<string, { x: number, y: number }>>(new Map());
  
  // State to store current port positions (for reactive updates)
  const [portPositions, setPortPositions] = useState<Map<string, { x: number, y: number }>>(new Map());
  
  // Track if we need to force a position update
  const needsUpdate = useRef<boolean>(false);
  
  // Update position for a specific port - using useCallback to prevent recreation
  const updatePortPosition = useCallback((id: string) => {
    const element = portRefs.current.get(id);
    if (!element) return;
    
    // Get scroll position for more accurate positioning
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    const rect = element.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2 + scrollLeft,
      y: rect.top + rect.height / 2 + scrollTop
    };
    
    // Store in both ref (for immediate access) and state (for reactive updates)
    portPositionsRef.current.set(id, position);
    setPortPositions(prev => {
      const newMap = new Map(prev);
      newMap.set(id, position);
      return newMap;
    });
    
    return position;
  }, []);
  
  // Update all port positions - also with useCallback
  const updateAllPositions = useCallback(() => {
    const positions: Record<string, { x: number, y: number }> = {};
    
    portRefs.current.forEach((element, id) => {
      const position = updatePortPosition(id);
      if (position) positions[id] = position;
    });
    
    needsUpdate.current = false;
    return positions;
  }, [updatePortPosition]);
  
  // Register a port element with its ID
  const registerPort = useCallback((id: string, element: HTMLElement | null) => {
    // If removing an element
    if (!element) {
      portRefs.current.delete(id);
      portPositionsRef.current.delete(id);
      setPortPositions(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
      return;
    }
    
    // If adding or updating an element
    portRefs.current.set(id, element);
    
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      // Get scroll position for more accurate positioning
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      const rect = element.getBoundingClientRect();
      const position = {
        x: rect.left + rect.width / 2 + scrollLeft,
        y: rect.top + rect.height / 2 + scrollTop
      };
      
      // Store in both ref and state
      portPositionsRef.current.set(id, position);
      setPortPositions(prev => {
        const newMap = new Map(prev);
        newMap.set(id, position);
        return newMap;
      });
      
      needsUpdate.current = true;
    });
  }, []);
  
  // Get position for a port by ID - check ref first for better performance
  const getPortPosition = useCallback((id: string) => {
    // First try to get from the ref (more up-to-date)
    const refPosition = portPositionsRef.current.get(id);
    if (refPosition) return refPosition;
    
    // Fall back to state if not in ref
    return portPositions.get(id);
  }, [portPositions]);
  
  // Regular position updates to ensure connections stay aligned
  useEffect(() => {
    // Initial update for all positions
    updateAllPositions();
    
    // Regular updates for better reliability
    const updateInterval = setInterval(() => {
      if (needsUpdate.current) {
        updateAllPositions();
      }
    }, 200);
    
    return () => clearInterval(updateInterval);
  }, [updateAllPositions]);
  
  // Effect to update positions on window resize or scroll
  useEffect(() => {
    const handleResize = () => {
      // Flag that we need an update
      needsUpdate.current = true;
      
      // Use requestAnimationFrame to throttle updates on resize
      requestAnimationFrame(() => {
        updateAllPositions();
      });
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [updateAllPositions]);
  
  return {
    registerPort,
    updatePortPosition,
    updateAllPositions,
    getPortPosition
  };
};