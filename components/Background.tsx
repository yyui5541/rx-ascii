import React, { useEffect, useRef } from 'react';

export const PixelBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Animation Config
    const gridSize = 30;
    // Medical/Cyber palette: Faint slate blues and grays
    const colors = ['#e2e8f0', '#cbd5e1', '#94a3b8', '#bfdbfe']; 
    
    interface Cell {
      x: number;
      y: number;
      color: string;
      life: number;
      maxLife: number;
      opacity: number;
    }
    
    let cells: Cell[] = [];

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw Grid Dots (Subtle Graph Paper look)
      ctx.fillStyle = '#cbd5e1';
      for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
          ctx.fillRect(x, y, 1, 1);
        }
      }

      // Randomly spawn "glitch" pixels
      if (Math.random() > 0.85) { 
        const col = Math.floor(Math.random() * (width / gridSize));
        const row = Math.floor(Math.random() * (height / gridSize));
        cells.push({
          x: col * gridSize,
          y: row * gridSize,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 0,
          maxLife: Math.floor(Math.random() * 30) + 20, // 20-50 frames
          opacity: (Math.random() * 0.3) + 0.1 // Random max opacity
        });
      }

      // Update and Draw active cells
      cells.forEach((cell, index) => {
        cell.life++;
        
        // Sine wave fade in/out
        const alpha = Math.sin((cell.life / cell.maxLife) * Math.PI) * cell.opacity;
        
        ctx.fillStyle = cell.color;
        ctx.globalAlpha = Math.max(0, alpha);
        // Draw slightly smaller than grid for "chip" look
        ctx.fillRect(cell.x + 2, cell.y + 2, gridSize - 3, gridSize - 3);
        ctx.globalAlpha = 1.0;

        if (cell.life >= cell.maxLife) {
          cells[index] = null as any;
        }
      });

      cells = cells.filter(c => c !== null);

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};