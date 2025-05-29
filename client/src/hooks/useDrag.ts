import { useState, useEffect, RefObject } from "react";

interface DragOptions {
  onDragStart?: (event: MouseEvent) => void;
  onDragMove?: (event: MouseEvent, position: { x: number; y: number }) => void;
  onDragEnd?: (event: MouseEvent, position: { x: number; y: number }) => void;
  disabled?: boolean; // Add option to disable dragging
}

export function useDrag(
  elementRef: RefObject<HTMLElement>,
  options: DragOptions = {}
) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const handleMouseDown = (e: MouseEvent) => {
      // Skip if dragging is disabled or clicking on interactive elements
      if (options.disabled) {
        console.log("Drag disabled, ignoring mouse down");
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
        console.log("Clicked on interactive element, ignoring drag");
        return;
      }
      
      console.log("Starting drag operation");
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      
      // Call onDragStart callback if provided
      options.onDragStart?.(e);
      
      // Add event listeners for move and up events
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const x = e.clientX;
      const y = e.clientY;
      
      console.log("Dragging: ", { x, y });
      setPosition({ x, y });
      
      // Call onDragMove callback if provided
      options.onDragMove?.(e, { x, y });
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;
      
      console.log("End drag at position: ", { x: e.clientX, y: e.clientY });
      setIsDragging(false);
      
      // Call onDragEnd callback if provided
      options.onDragEnd?.(e, { x: e.clientX, y: e.clientY });
      
      // Remove event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    // Add event listener for mousedown
    element.addEventListener('mousedown', handleMouseDown);
    
    // Cleanup
    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [elementRef, isDragging, options, options.disabled, position]);
  
  return {
    isDragging,
    position,
  };
}
