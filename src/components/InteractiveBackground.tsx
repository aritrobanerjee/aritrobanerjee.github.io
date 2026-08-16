import React, { useEffect, useRef, useState } from 'react';

export const InteractiveBackground: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const targetPos = useRef({ x: -1000, y: -1000 });
  const currentPos = useRef({ x: -1000, y: -1000 });
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      if (!isHovered) setIsHovered(true);
    };

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);

    const handleMouseLeave = () => {
      setIsHovered(false);
      setIsDragging(false);
      targetPos.current = { x: -1000, y: -1000 };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        targetPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        setIsHovered(true);
      }
    };

    const handleTouchEnd = () => {
      setIsHovered(false);
      targetPos.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.body.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Smooth lerp animation loop for butter-smooth shimmer tracking
    const updatePosition = () => {
      // Lerp factor (0.15 gives natural inertia and responsiveness)
      const ease = 0.15;
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * ease;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * ease;

      setMousePosition({
        x: Math.round(currentPos.current.x * 10) / 10,
        y: Math.round(currentPos.current.y * 10) / 10,
      });

      animationFrameId.current = requestAnimationFrame(updatePosition);
    };

    animationFrameId.current = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isHovered]);

  const spotlightRadius = isDragging ? 520 : 420;
  const shimmerIntensity = isDragging ? 0.09 : 0.055;
  const coreIntensity = isDragging ? 0.12 : 0.07;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#0a0a0a]">
      {/* Dynamic Interactive Shimmer Spotlight */}
      <div
        className="absolute inset-0 transition-opacity duration-700 ease-out"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `
            radial-gradient(
              ${spotlightRadius * 0.4}px circle at ${mousePosition.x}px ${mousePosition.y}px,
              rgba(240, 240, 245, ${coreIntensity}),
              rgba(220, 220, 230, ${shimmerIntensity}) 35%,
              rgba(160, 160, 175, 0.02) 65%,
              transparent 80%
            ),
            radial-gradient(
              ${spotlightRadius * 1.2}px circle at ${mousePosition.x}px ${mousePosition.y}px,
              rgba(255, 255, 255, 0.025),
              transparent 70%
            )
          `,
        }}
      />

      {/* Tactile Micro-Texture Grain Overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-screen pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle Ambient Vignette to anchor document edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(5,5,5,0.7) 100%)',
        }}
      />
    </div>
  );
};
