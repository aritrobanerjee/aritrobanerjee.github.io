import React, { useEffect, useRef } from 'react';

interface Tile {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number; // corner radius
  flipProgress: number; // 0 (front: black) to 1 (back: dark gray)
  targetFlip: number;
  lastFlippedTime: number;
  flipAxis: 'x' | 'y';
}

export const CardDeckBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // High-density tactile mini-cards
    const TILE_SIZE = 26;
    const TILE_GAP = 4;
    const TOTAL_SIZE = TILE_SIZE + TILE_GAP;
    let tiles: Tile[] = [];

    // Track text container bounding box for continuous gradient attenuation
    let contentRect: DOMRect | null = null;

    const updateContentRect = () => {
      const mainEl = document.getElementById('portfolio-content');
      if (mainEl) {
        contentRect = mainEl.getBoundingClientRect();
      } else {
        contentRect = null;
      }
    };

    // Calculate signed distance from text bounding box (negative inside, positive outside)
    const getSignedDistanceToText = (x: number, y: number): number => {
      if (!contentRect) return 100;

      const dx = Math.max(contentRect.left - x, 0, x - contentRect.right);
      const dy = Math.max(contentRect.top - y, 0, y - contentRect.bottom);

      // Outside
      if (dx > 0 || dy > 0) {
        return Math.sqrt(dx * dx + dy * dy);
      }

      // Inside (find distance to closest edge, negative)
      const distToEdge = Math.min(
        x - contentRect.left,
        contentRect.right - x,
        y - contentRect.top,
        contentRect.bottom - y
      );
      return -distToEdge;
    };

    const initTiles = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      tiles = [];
      updateContentRect();

      const cols = Math.ceil(width / TOTAL_SIZE) + 1;
      const rows = Math.ceil(height / TOTAL_SIZE) + 1;
      const offsetX = (width - (cols * TOTAL_SIZE - TILE_GAP)) / 2;
      const offsetY = (height - (rows * TOTAL_SIZE - TILE_GAP)) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          tiles.push({
            x: offsetX + c * TOTAL_SIZE,
            y: offsetY + r * TOTAL_SIZE,
            w: TILE_SIZE,
            h: TILE_SIZE,
            r: 2.5,
            flipProgress: 0,
            targetFlip: 0,
            lastFlippedTime: 0,
            flipAxis: (r + c) % 2 === 0 ? 'y' : 'x',
          });
        }
      }
    };

    initTiles();

    // Mouse & Touch Tracking (Smooth continuous interaction everywhere)
    let mouseX = -1000;
    let mouseY = -1000;
    let isDragging = false;
    const INFLUENCE_RADIUS = 54;

    const triggerNearTiles = (x: number, y: number, radius: number) => {
      updateContentRect();
      const now = performance.now();

      for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        const centerX = tile.x + tile.w / 2;
        const centerY = tile.y + tile.h / 2;

        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radius) {
          tile.targetFlip = 1;
          tile.lastFlippedTime = now;
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      triggerNearTiles(mouseX, mouseY, isDragging ? INFLUENCE_RADIUS * 1.25 : INFLUENCE_RADIUS);
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      mouseX = e.clientX;
      mouseY = e.clientY;
      triggerNearTiles(mouseX, mouseY, INFLUENCE_RADIUS * 1.3);
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
      isDragging = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
        triggerNearTiles(mouseX, mouseY, INFLUENCE_RADIUS * 1.15);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      isDragging = true;
      if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
        triggerNearTiles(mouseX, mouseY, INFLUENCE_RADIUS * 1.25);
      }
    };

    const handleTouchEnd = () => {
      isDragging = false;
      mouseX = -1000;
      mouseY = -1000;
    };

    const handleScroll = () => {
      updateContentRect();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.body.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', initTiles);

    // Helper: draw rounded rect
    const drawRoundedRect = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      r: number
    ) => {
      c.beginPath();
      c.moveTo(x + r, y);
      c.lineTo(x + w - r, y);
      c.quadraticCurveTo(x + w, y, x + w, y + r);
      c.lineTo(x + w, y + h - r);
      c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      c.lineTo(x + r, y + h);
      c.quadraticCurveTo(x, y + h, x, y + h - r);
      c.lineTo(x, y + r);
      c.quadraticCurveTo(x, y, x + r, y);
      c.closePath();
    };

    // Render loop
    const STAY_TIME = 420; // ms to stay flipped before returning

    const render = () => {
      const now = performance.now();

      // Clear with background color
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        const centerX = tile.x + tile.w / 2;
        const centerY = tile.y + tile.h / 2;

        // Check if time to reset targetFlip
        if (tile.targetFlip === 1 && now - tile.lastFlippedTime > STAY_TIME) {
          const dist = Math.hypot(mouseX - centerX, mouseY - centerY);
          if (dist > INFLUENCE_RADIUS) {
            tile.targetFlip = 0;
          }
        }

        // Physics-based spring lerp towards targetFlip
        const diff = tile.targetFlip - tile.flipProgress;
        tile.flipProgress += diff * 0.16;

        if (Math.abs(diff) < 0.001) {
          tile.flipProgress = tile.targetFlip;
        }

        const progress = tile.flipProgress;

        // Render card
        ctx.save();
        ctx.translate(centerX, centerY);

        const angle = progress * Math.PI;
        const cosVal = Math.cos(angle);
        const isBack = cosVal < 0;

        if (tile.flipAxis === 'y') {
          ctx.scale(Math.abs(cosVal), 1);
        } else {
          ctx.scale(1, Math.abs(cosVal));
        }

        const halfW = tile.w / 2;
        const halfH = tile.h / 2;

        // Calculate smooth continuous attenuation factor based on distance to text
        // signedDist: < 0 inside text, > 0 outside text
        const signedDist = getSignedDistanceToText(centerX, centerY);
        // Smooth transition zone of 60px across the text edge
        const marginFactor = Math.min(1, Math.max(0, (signedDist + 20) / 60)); // 0 deep inside, 1 in margins

        if (isBack) {
          // Flipped State:
          // Deep inside text: ultra-subtle stealth tone (#111113 to #141416) so text contrast is 100% pristine
          // Outside text: refined graphite tone (#161619 to #1d1d21)
          const baseTone = 14 + marginFactor * 6; // 14 inside text, 20 in margins
          const dynamicTone = Math.floor(baseTone + Math.abs(cosVal) * (2 + marginFactor * 4));
          
          ctx.fillStyle = `rgb(${dynamicTone}, ${dynamicTone}, ${dynamicTone + 1})`;
          drawRoundedRect(ctx, -halfW, -halfH, tile.w, tile.h, tile.r);
          ctx.fill();

          // Subtle hairline border with smooth opacity transition
          const borderAlpha = (0.02 + marginFactor * 0.035) + Math.abs(cosVal) * 0.02;
          ctx.strokeStyle = `rgba(255, 255, 255, ${borderAlpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          // Normal Front State: Deep Black Card with faint border
          ctx.fillStyle = '#0d0d0f';
          drawRoundedRect(ctx, -halfW, -halfH, tile.w, tile.h, tile.r);
          ctx.fill();

          ctx.strokeStyle = '#141416';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', initTiles);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0a0a0a]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />
    </div>
  );
};
