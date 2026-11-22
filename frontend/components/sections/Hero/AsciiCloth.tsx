"use client";

import { useEffect, useRef } from 'react';

const GLYPHS = '.:;+=x%#';
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };

export default function AsciiCloth() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.closest('section');
    const context = canvas?.getContext('2d');
    if (!canvas || !hero || !context) return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = { x: -1000, y: -1000, strength: 0, target: 0 };
    let width = 0, height = 0, ratio = 1, frame = 0, lastFrame = 0, time = 0;
    let visible = true;
    let light = document.documentElement.dataset.heroTheme === 'light';
    let quiet = { x: 0, y: 0, rx: 1, ry: 1 };
    let atlas: HTMLCanvasElement;

    const makeAtlas = () => {
      atlas = document.createElement('canvas');
      atlas.width = 16 * GLYPHS.length * ratio;
      atlas.height = 20 * 8 * ratio;
      const ink = atlas.getContext('2d');
      if (!ink) return;
      ink.scale(ratio, ratio);
      ink.font = '11px ui-monospace, SFMono-Regular, Consolas, monospace';
      ink.textAlign = 'center';
      ink.textBaseline = 'middle';
      for (let shade = 0; shade < 8; shade++) {
        ink.fillStyle = light ? `rgba(56,86,95,${0.17 + shade * 0.085})` : `rgba(161,194,203,${0.14 + shade * 0.095})`;
        for (let glyph = 0; glyph < GLYPHS.length; glyph++) {
          ink.fillText(GLYPHS[glyph], glyph * 16 + 8, shade * 20 + 10);
        }
      }
    };

    const resize = () => {
      width = hero.clientWidth;
      height = hero.clientHeight;
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const title = hero.querySelector('.hero-name');
      const socials = hero.querySelector('.hero-socials');
      if (title && socials) {
        // Layout coordinates stay stable while the mascot animates the text entrance.
        const top = (title as HTMLElement).offsetTop;
        const bottom = (socials as HTMLElement).offsetTop + socials.clientHeight;
        const content = (title as HTMLElement).offsetParent as HTMLElement;
        const origin = content.getBoundingClientRect().top - hero.getBoundingClientRect().top;
        quiet = { x: width / 2, y: origin + (top + bottom) / 2, rx: Math.min(width * 0.44, title.clientWidth / 2 + 90), ry: (bottom - top) / 2 + 72 };
      }
      makeAtlas();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      if (width < 768) return;
      const columns = 220;
      const rows = 33;
      const motion = media.matches ? 0 : time;
      const radius = 190;

      for (let ribbon = 0; ribbon < 2; ribbon++) {
        for (let column = 0; column < columns; column++) {
          const u = column / (columns - 1);
          const xBase = ribbon === 0 ? (-0.12 + u * 0.82) * width : (-0.08 + u * 1.2) * width;
          const center = ribbon === 0
            ? 0.19 - 0.34 * u + 0.055 * Math.sin(u * 8)
            : 0.70 + 0.18 * Math.sin(u * Math.PI) - 0.46 * smooth((u - 0.59) / 0.48);
          const breadth = (ribbon === 0 ? 0.09 : 0.105) * height;

          for (let row = 0; row < rows; row++) {
            const v = row / (rows - 1) * 2 - 1;
            const phase = u * 13 + v * 3.5 + motion * 0.32 + ribbon * 2;
            const fold = Math.sin(phase) * 0.68 + Math.sin(u * 22 - v * 4 - motion * 0.2) * 0.22;
            let x = xBase + Math.sin(u * 9 + v * 2 + motion * 0.17) * breadth * 0.35;
            let y = center * height + v * breadth + fold * breadth * (0.58 + 0.25 * v);
            const distance = Math.hypot(x - pointer.x, y - pointer.y);
            const influence = Math.exp(-distance * distance / (radius * radius)) * pointer.strength;
            x += (x - pointer.x) * influence * 0.14;
            y += (28 + Math.sin(distance * 0.035 - motion * 2) * 14) * influence;

            const ellipse = Math.hypot((x - quiet.x) / quiet.rx, (y - quiet.y) / quiet.ry);
            const clearText = smooth((ellipse - 0.9) / 0.27);
            const edge = smooth((1 - Math.abs(v)) / 0.18);
            const fade = smooth(x / 55) * smooth((width - x) / 55) * smooth((height - y) / 75);
            const opacity = clearText * edge * fade;
            if (opacity < 0.025 || x < -12 || x > width + 12 || y < -12 || y > height + 12) continue;

            const lightness = clamp(0.48 + Math.cos(phase) * 0.30 + Math.sin(u * 7 - v * 3) * 0.15);
            const shade = Math.min(7, Math.floor(lightness * 8));
            const glyph = (column * 7 + row * 11 + Math.floor(lightness * 5)) % GLYPHS.length;
            const size = 0.9 + Math.sin(phase) * 0.12;
            context.globalAlpha = opacity;
            context.drawImage(atlas, glyph * 16 * ratio, shade * 20 * ratio, 16 * ratio, 20 * ratio, x - 8 * size, y - 10 * size, 16 * size, 20 * size);
          }
        }
      }
      context.globalAlpha = 1;
    };

    const run = (now: number) => {
      frame = 0;
      if (width < 768 || !visible || document.hidden) return;
      if (now - lastFrame >= 1000 / 30) {
        const elapsed = Math.min((now - lastFrame) / 1000, 0.06);
        lastFrame = now;
        time += elapsed;
        pointer.strength += (pointer.target - pointer.strength) * 0.12;
        draw();
      }
      if (!media.matches) frame = requestAnimationFrame(run);
    };
    const start = () => {
      if (width >= 768 && !frame && visible && !document.hidden) { lastFrame = performance.now(); frame = requestAnimationFrame(run); }
    };
    const stop = () => { cancelAnimationFrame(frame); frame = 0; };
    const move = (event: PointerEvent) => {
      if (media.matches) return;
      const rect = hero.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.target = 1;
    };
    const leave = () => { pointer.target = 0; };
    const refresh = () => { resize(); draw(); start(); };
    const visibility = () => { if (document.hidden) stop(); else start(); };
    const themeObserver = new MutationObserver(() => {
      light = document.documentElement.dataset.heroTheme === 'light';
      makeAtlas();
      draw();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-hero-theme'] });
    const sizeObserver = new ResizeObserver(refresh);
    sizeObserver.observe(hero);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio > 0;
      if (visible) start(); else stop();
    }, { threshold: [0, 0.01] });
    intersection.observe(hero);
    hero.addEventListener('pointermove', move, { passive: true });
    hero.addEventListener('pointerdown', move, { passive: true });
    hero.addEventListener('pointerleave', leave);
    hero.addEventListener('pointerup', leave);
    hero.addEventListener('pointercancel', leave);
    document.addEventListener('visibilitychange', visibility);
    media.addEventListener('change', refresh);
    refresh();
    let disposed = false;
    void document.fonts.ready.then(() => { if (!disposed) refresh(); });

    return () => {
      disposed = true;
      stop();
      themeObserver.disconnect();
      sizeObserver.disconnect();
      intersection.disconnect();
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerdown', move);
      hero.removeEventListener('pointerleave', leave);
      hero.removeEventListener('pointerup', leave);
      hero.removeEventListener('pointercancel', leave);
      document.removeEventListener('visibilitychange', visibility);
      media.removeEventListener('change', refresh);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 hidden h-full w-full md:block" />;
}
