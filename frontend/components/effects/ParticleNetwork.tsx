"use client";

import { useEffect, useRef, useCallback } from 'react';

// ─── Configuration (Halved particle count & tuned for locked 60/120 FPS) ───
const CONFIG = {
  particleCount: 90,
  particleCountMobile: 40,
  connectionDistance: 145,
  mouseInfluenceRadius: 230,
  mouseAttractionStrength: 0.055,
  particleSpeed: 0.28,
  lineWidth: 0.65,
  particleMinSize: 1.2,
  particleMaxSize: 2.7,
  // Colors matching the site theme
  colors: {
    particle: { r: 129, g: 159, b: 167 },       // #819fa7
    particleAlt: { r: 243, g: 245, b: 249 },     // #f3f5f9
    line: { r: 129, g: 159, b: 167 },            // #819fa7
    mouseLine: { r: 160, g: 200, b: 210 },       // brighter for mouse connections
    glow: { r: 129, g: 159, b: 167 },            // glow around cursor
  },
};

const LINE_BUCKETS = 4;
const SPRITE_SIZE = 36;
const CURSOR_GLOW_SIZE = 256;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  size: number;
  opacity: number;
  isAlt: boolean;
  // Slow sine drift for organic feel
  phaseX: number;
  phaseY: number;
  driftSpeed: number;
}

/**
 * Pre-renders a soft radial glow + crisp core onto a tiny offscreen canvas ONCE,
 * eliminating hundreds of per-frame createRadialGradient() + arc() calls.
 */
function createParticleSprite(r: number, g: number, b: number): HTMLCanvasElement {
  const off = document.createElement('canvas');
  off.width = SPRITE_SIZE;
  off.height = SPRITE_SIZE;
  const octx = off.getContext('2d');
  if (!octx) return off;

  const half = SPRITE_SIZE / 2;

  // Soft outer glow
  const grad = octx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.85)`);
  grad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, 0.22)`);
  grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

  octx.fillStyle = grad;
  octx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

  // Crisp bright core
  octx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;
  octx.beginPath();
  octx.arc(half, half, half * 0.32, 0, Math.PI * 2);
  octx.fill();

  return off;
}

function createCursorGlowSprite(r: number, g: number, b: number): HTMLCanvasElement {
  const off = document.createElement('canvas');
  off.width = CURSOR_GLOW_SIZE;
  off.height = CURSOR_GLOW_SIZE;
  const octx = off.getContext('2d');
  if (!octx) return off;

  const half = CURSOR_GLOW_SIZE / 2;
  const grad = octx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.1)`);
  grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

  octx.fillStyle = grad;
  octx.fillRect(0, 0, CURSOR_GLOW_SIZE, CURSOR_GLOW_SIZE);
  return off;
}

export default function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const isRunningRef = useRef(false);
  const isVisibleRef = useRef(true);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const dimensionsRef = useRef({ w: 0, h: 0 });

  // ─── Initialize particles ───────────────────────────────────
  const initParticles = useCallback((w: number, h: number) => {
    const isMobile = w < 768;
    const count = isMobile ? CONFIG.particleCountMobile : CONFIG.particleCount;
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = CONFIG.particleSpeed * (0.3 + Math.random() * 0.7);
      const bvx = Math.cos(angle) * speed;
      const bvy = Math.sin(angle) * speed;

      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: bvx,
        vy: bvy,
        baseVx: bvx,
        baseVy: bvy,
        size:
          CONFIG.particleMinSize +
          Math.random() * (CONFIG.particleMaxSize - CONFIG.particleMinSize),
        opacity: 0.32 + Math.random() * 0.48,
        isAlt: i % 5 === 0,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        driftSpeed: 0.002 + Math.random() * 0.004,
      });
    }

    particlesRef.current = particles;
  }, []);

  // ─── Setup & Optimized Render Loop ──────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    // Pre-bake sprites once at startup (zero per-frame gradient allocations)
    const primarySprite = createParticleSprite(
      CONFIG.colors.particle.r,
      CONFIG.colors.particle.g,
      CONFIG.colors.particle.b
    );
    const altSprite = createParticleSprite(
      CONFIG.colors.particleAlt.r,
      CONFIG.colors.particleAlt.g,
      CONFIG.colors.particleAlt.b
    );
    const cursorGlowSprite = createCursorGlowSprite(
      CONFIG.colors.glow.r,
      CONFIG.colors.glow.g,
      CONFIG.colors.glow.b
    );

    // Pre-allocate reusable bucket arrays to avoid GC churn
    const buckets: number[][] = Array.from({ length: LINE_BUCKETS }, () => []);
    const lineStrokeStyles = Array.from({ length: LINE_BUCKETS }, (_, bIdx) => {
      const alpha = (((bIdx + 0.65) / LINE_BUCKETS) * 0.34).toFixed(3);
      const { r, g, b } = CONFIG.colors.line;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    });
    const mouseStrokeStyles = Array.from({ length: LINE_BUCKETS }, (_, bIdx) => {
      const alpha = (((bIdx + 0.65) / LINE_BUCKETS) * 0.58).toFixed(3);
      const { r, g, b } = CONFIG.colors.mouseLine;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    });

    // Cap DPR at 1.25 so 2x/3x screens don't push 8M+ background pixels every frame
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      dimensionsRef.current = { w, h };

      if (particlesRef.current.length === 0) {
        initParticles(w, h);
      }
    };

    resize();

    const canvasRect = { left: 0, top: 0, width: 0, height: 0 };
    const updateRect = () => {
      const rect = canvas.getBoundingClientRect();
      canvasRect.left = rect.left;
      canvasRect.top = rect.top;
      canvasRect.width = rect.width;
      canvasRect.height = rect.height;
    };
    updateRect();

    const connDist = CONFIG.connectionDistance;
    const connDistSq = connDist * connDist;
    const mouseRadius = CONFIG.mouseInfluenceRadius;
    const mouseRadiusSq = mouseRadius * mouseRadius;

    const renderFrame = (time: number) => {
      if (!isVisibleRef.current || document.hidden) {
        isRunningRef.current = false;
        return;
      }

      const { w, h } = dimensionsRef.current;
      const particles = particlesRef.current;
      const len = particles.length;
      const mouse = mouseRef.current;
      const timeSec = time * 0.001;

      ctx.clearRect(0, 0, w, h);

      // 1. Update particle positions
      const pad = 20;
      for (let i = 0; i < len; i++) {
        const p = particles[i];
        const phase = timeSec * p.driftSpeed * 100;
        let vx = p.baseVx + Math.sin(phase + p.phaseX) * 0.15;
        let vy = p.baseVy + Math.cos(phase + p.phaseY) * 0.15;

        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          if (Math.abs(dx) < mouseRadius && Math.abs(dy) < mouseRadius) {
            const distSq = dx * dx + dy * dy;
            if (distSq < mouseRadiusSq) {
              const dist = Math.sqrt(distSq);
              const force = (1 - dist / mouseRadius) * CONFIG.mouseAttractionStrength;
              vx += dx * force;
              vy += dy * force;
            }
          }
        }

        p.vx = vx;
        p.vy = vy;
        p.x += vx;
        p.y += vy;

        if (p.x < -pad) p.x = w + pad;
        else if (p.x > w + pad) p.x = -pad;
        if (p.y < -pad) p.y = h + pad;
        else if (p.y > h + pad) p.y = -pad;
      }

      // 2. Batch-draw particle connections (4 stroke calls instead of hundreds)
      for (let b = 0; b < LINE_BUCKETS; b++) {
        buckets[b].length = 0;
      }

      for (let i = 0; i < len; i++) {
        const pi = particles[i];
        const pix = pi.x;
        const piy = pi.y;

        for (let j = i + 1; j < len; j++) {
          const pj = particles[j];
          const dx = pix - pj.x;
          if (dx > connDist || dx < -connDist) continue;
          const dy = piy - pj.y;
          if (dy > connDist || dy < -connDist) continue;

          const distSq = dx * dx + dy * dy;
          if (distSq < connDistSq) {
            const ratio = 1 - Math.sqrt(distSq) / connDist;
            const bIdx = Math.min(LINE_BUCKETS - 1, (ratio * LINE_BUCKETS) | 0);
            buckets[bIdx].push(pix, piy, pj.x, pj.y);
          }
        }
      }

      ctx.globalAlpha = 1;
      ctx.lineWidth = CONFIG.lineWidth;
      for (let b = 0; b < LINE_BUCKETS; b++) {
        const coords = buckets[b];
        if (coords.length === 0) continue;
        ctx.strokeStyle = lineStrokeStyles[b];
        ctx.beginPath();
        for (let k = 0; k < coords.length; k += 4) {
          ctx.moveTo(coords[k], coords[k + 1]);
          ctx.lineTo(coords[k + 2], coords[k + 3]);
        }
        ctx.stroke();
      }

      // 3. Batch-draw mouse connections + pre-baked cursor glow
      if (mouse.active) {
        const glowRadius = mouseRadius * 0.6;
        ctx.drawImage(
          cursorGlowSprite,
          mouse.x - glowRadius,
          mouse.y - glowRadius,
          glowRadius * 2,
          glowRadius * 2
        );

        for (let b = 0; b < LINE_BUCKETS; b++) {
          buckets[b].length = 0;
        }

        for (let i = 0; i < len; i++) {
          const p = particles[i];
          const dx = mouse.x - p.x;
          if (dx > mouseRadius || dx < -mouseRadius) continue;
          const dy = mouse.y - p.y;
          if (dy > mouseRadius || dy < -mouseRadius) continue;

          const distSq = dx * dx + dy * dy;
          if (distSq < mouseRadiusSq) {
            const ratio = 1 - Math.sqrt(distSq) / mouseRadius;
            const bIdx = Math.min(LINE_BUCKETS - 1, (ratio * LINE_BUCKETS) | 0);
            buckets[bIdx].push(mouse.x, mouse.y, p.x, p.y);
          }
        }

        ctx.lineWidth = 0.95;
        for (let b = 0; b < LINE_BUCKETS; b++) {
          const coords = buckets[b];
          if (coords.length === 0) continue;
          ctx.strokeStyle = mouseStrokeStyles[b];
          ctx.beginPath();
          for (let k = 0; k < coords.length; k += 4) {
            ctx.moveTo(coords[k], coords[k + 1]);
            ctx.lineTo(coords[k + 2], coords[k + 3]);
          }
          ctx.stroke();
        }
      }

      // 4. Draw particles via pre-rendered sprites (fast GPU texture blits)
      for (let i = 0; i < len; i++) {
        const p = particles[i];
        let alpha = p.opacity + Math.sin(timeSec + p.phaseX) * 0.14;

        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          if (Math.abs(dx) < mouseRadius && Math.abs(dy) < mouseRadius) {
            const distSq = dx * dx + dy * dy;
            if (distSq < mouseRadiusSq) {
              alpha += (1 - Math.sqrt(distSq) / mouseRadius) * 0.38;
            }
          }
        }

        ctx.globalAlpha = alpha > 1 ? 1 : alpha < 0.05 ? 0.05 : alpha;
        const drawSize = p.size * 6;
        const halfDraw = drawSize * 0.5;
        ctx.drawImage(
          p.isAlt ? altSprite : primarySprite,
          p.x - halfDraw,
          p.y - halfDraw,
          drawSize,
          drawSize
        );
      }

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(renderFrame);
    };

    const startLoop = () => {
      if (!isRunningRef.current && isVisibleRef.current && !document.hidden) {
        isRunningRef.current = true;
        animationRef.current = requestAnimationFrame(renderFrame);
      }
    };

    const stopLoop = () => {
      if (isRunningRef.current) {
        cancelAnimationFrame(animationRef.current);
        isRunningRef.current = false;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisibleRef.current) return;
      const x = e.clientX - canvasRect.left;
      const y = e.clientY - canvasRect.top;

      if (x >= 0 && x <= canvasRect.width && y >= 0 && y <= canvasRect.height) {
        mouseRef.current.x = x;
        mouseRef.current.y = y;
        mouseRef.current.active = true;
      } else {
        mouseRef.current.active = false;
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else {
        startLoop();
      }
    };

    const handleResize = () => {
      resize();
      updateRect();
    };

    // Completely halt rAF when Hero leaves the viewport (zero background CPU/GPU cost)
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          updateRect();
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', updateRect, { passive: true });

    startLoop();

    return () => {
      stopLoop();
      observer.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', updateRect);
    };
  }, [initParticles]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
