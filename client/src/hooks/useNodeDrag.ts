import { useState, useEffect, RefObject } from "react";

/**
 * Custom hook for dragging nodes on the workflow canvas
 * Specifically designed for node movement with direct DOM manipulation
 */
export function useNodeDrag(
  elementRef: RefObject<HTMLElement>,
  options: {
    disabled?: boolean;
    onStart?: (e: MouseEvent) => void;
    onDrag?: (e: MouseEvent, position: { x: number; y: number }) => void;
    onEnd?: (e: MouseEvent, position: { x: number; y: number }) => void;
  } = {}
) {
  const [isDragging, setIsDragging] = useState(false);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      console.log("NODE DRAG DEBUG: Element ref is null");
      return;
    }

    // Debug element properties
    console.log("NODE DRAG DEBUG: Initial element setup", {
      element: element.className,
      position: element.style.position,
      hasMoveEvent: element.onclick !== null,
      zIndex: element.style.zIndex,
      nodeId: element.id || element.dataset.nodeId
    });
    
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    // Ensure element is absolutely positioned
    if (element.style.position !== 'absolute') {
      element.style.position = 'absolute';
      console.log("NODE DRAG DEBUG: Set element to absolute positioning");
    }
    
    // Function to get node's top/left position from style
    const getNodePosition = () => {
      const left = parseFloat(element.style.left || '0');
      const top = parseFloat(element.style.top || '0');
      return { left, top };
    };
    
    const handleMouseDown = (e: MouseEvent) => {
      console.log("NODE DRAG DEBUG: Mouse down event", {
        clientX: e.clientX,
        clientY: e.clientY,
        target: (e.target as HTMLElement).tagName,
        disabled: options.disabled
      });
      
      // Skip if disabled
      if (options.disabled) {
        console.log("NODE DRAG DEBUG: Dragging is disabled");
        return;
      }
      
      // Skip if clicking on buttons or input elements
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('button')
      ) {
        console.log("NODE DRAG DEBUG: Clicked on interactive element, not dragging");
        return;
      }
      
      // Get initial position
      const { left, top } = getNodePosition();
      initialLeft = left;
      initialTop = top;
      
      console.log("NODE DRAG DEBUG: Starting drag", { initialLeft, initialTop });
      
      // Record starting point
      startX = e.clientX;
      startY = e.clientY;
      
      setIsDragging(true);
      
      // Call the start callback
      options.onStart?.(e);
      
      // Add event listeners
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // Prevent default behavior to avoid text selection
      e.preventDefault();
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      // Calculate the position change
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      const newLeft = initialLeft + dx;
      const newTop = initialTop + dy;
      
      console.log("NODE DRAG DEBUG: Moving", { dx, dy, newLeft, newTop });
      
      // Update position directly
      element.style.left = `${newLeft}px`;
      element.style.top = `${newTop}px`;
      
      // Call the drag callback
      options.onDrag?.(e, { 
        x: e.clientX, 
        y: e.clientY 
      });
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;
      
      console.log("NODE DRAG DEBUG: End drag", {
        finalLeft: element.style.left,
        finalTop: element.style.top
      });
      
      setIsDragging(false);
      
      // Call the end callback
      options.onEnd?.(e, { 
        x: e.clientX, 
        y: e.clientY 
      });
      
      // Remove listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    console.log("NODE DRAG DEBUG: Adding mouse down listener");
    // Add the mouse down listener
    element.addEventListener('mousedown', handleMouseDown);
    
    // Cleanup
    return () => {
      console.log("NODE DRAG DEBUG: Cleaning up listeners");
      element.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [elementRef, isDragging, options]);
  
  return { isDragging };
}