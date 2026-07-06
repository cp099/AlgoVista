import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulseSpeed: number;
  pulsePhase: number;
}

export const InteractiveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    const particleCount = 42;
    const connectionDist = 135;
    const mouseForceDist = 180;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 1.8 + 1.8, // 1.8px to 3.6px
      pulseSpeed: Math.random() * 0.02 + 0.005,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    // Window-level mouse listeners
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // 1. Draw Mouse Interactive Spotlight Glow
      if (mx > -500 && my > -500) {
        const glowRadius = 350;
        const radialGlow = ctx.createRadialGradient(mx, my, 0, mx, my, glowRadius);
        // Richer primary blue/indigo light wash
        radialGlow.addColorStop(0, 'rgba(99, 102, 241, 0.18)');
        radialGlow.addColorStop(0.5, 'rgba(99, 102, 241, 0.05)');
        radialGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = radialGlow;
        ctx.beginPath();
        ctx.arc(mx, my, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Draw Clean Figma-style dot grid background (Rich contrast blue-indigo dots)
      const dotSpacing = 36;
      ctx.fillStyle = 'rgba(99, 102, 241, 0.32)'; // Highly visible indigo dots
      for (let x = dotSpacing; x < w; x += dotSpacing) {
        for (let y = dotSpacing; y < h; y += dotSpacing) {
          // Draw tiny 1.2px dots
          ctx.fillRect(x, y, 1.2, 1.2);
        }
      }

      // 3. Update & Draw Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulsePhase += p.pulseSpeed;

        // Bounce boundaries
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));

        // Mouse attraction/repulsion force
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist < mouseForceDist) {
          const force = (mouseForceDist - dist) / mouseForceDist;
          // Pull nodes gently towards mouse
          p.vx += (dx / dist) * force * 0.022;
          p.vy += (dy / dist) * force * 0.022;
        }

        // Apply friction to clamp speed
        const speed = Math.hypot(p.vx, p.vy);
        const maxSpeed = 0.9;
        if (speed > maxSpeed) {
          p.vx = (p.vx / speed) * maxSpeed;
          p.vy = (p.vy / speed) * maxSpeed;
        }

        // Draw Particle Circle with richer pulsing opacity
        const opacity = 0.45 + Math.sin(p.pulsePhase) * 0.12;
        ctx.fillStyle = `rgba(99, 102, 241, ${opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Draw Connecting Constellation Links
      ctx.lineWidth = 1;
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.38; // Increased connection link opacity to 38%
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10 opacity-95"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -10 }}
    />
  );
};
export default InteractiveBackground;
