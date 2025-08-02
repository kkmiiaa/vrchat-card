// hooks/useCanvas.ts
import { useRef, useEffect } from 'react';

export const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    // Canvas drawing logic here...
  }, []);

  return canvasRef;
};
