'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseDraggableOptions {
  initialPosition?: Position;
  bounds?: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
  disabled?: boolean;
  onDragEnd?: (position: Position) => void;
}

export function useDraggable({
  initialPosition,
  bounds,
  disabled = false,
  onDragEnd,
}: UseDraggableOptions = {}) {
  const [position, setPosition] = useState<Position>(
    initialPosition || { x: 0, y: 0 }
  );
  const [isDragging, setIsDragging] = useState(false);

  const dragStartPos = useRef({ x: 0, y: 0, elementX: 0, elementY: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  // Calculate default position (bottom-right, with padding)
  const calculateDefaultPosition = useCallback((): Position => {
    if (typeof window === 'undefined') return { x: 0, y: 0 };

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const chatWidth = 400;
    const chatHeight = 600;

    return {
      x: windowWidth - chatWidth - 24,   // 24px padding from right
      y: windowHeight - chatHeight - 96  // 96px from bottom (room for floating button)
    };
  }, []);

  // Initialize position on mount
  useEffect(() => {
    if (!initialPosition) {
      setPosition(calculateDefaultPosition());
    }
  }, [initialPosition, calculateDefaultPosition]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;

    // Only drag from elements with data-drag-handle attribute
    const target = e.target as HTMLElement;
    if (!target.closest('[data-drag-handle]')) return;

    e.preventDefault();
    setIsDragging(true);

    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      elementX: position.x,
      elementY: position.y
    };
  }, [disabled, position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;

    let newX = dragStartPos.current.elementX + deltaX;
    let newY = dragStartPos.current.elementY + deltaY;

    // Apply bounds constraints
    if (bounds) {
      newX = Math.max(bounds.left, Math.min(newX, bounds.right));
      newY = Math.max(bounds.top, Math.min(newY, bounds.bottom));
    }

    setPosition({ x: newX, y: newY });
  }, [isDragging, bounds]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      // Notify parent of final position
      if (onDragEnd) {
        onDragEnd(position);
      }
    }
  }, [isDragging, position, onDragEnd]);

  const resetPosition = useCallback(() => {
    setPosition(calculateDefaultPosition());
  }, [calculateDefaultPosition]);

  // Update position when initialPosition changes (from localStorage)
  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  // Attach global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle window resize - keep window in bounds
  useEffect(() => {
    const handleResize = () => {
      if (bounds && position) {
        const maxX = window.innerWidth - 400;
        const maxY = window.innerHeight - 600;

        if (position.x > maxX || position.y > maxY) {
          setPosition({
            x: Math.min(position.x, Math.max(0, maxX)),
            y: Math.min(position.y, Math.max(0, maxY))
          });
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position, bounds]);

  return {
    position,
    isDragging,
    elementRef,
    handleMouseDown,
    resetPosition,
    setPosition
  };
}
