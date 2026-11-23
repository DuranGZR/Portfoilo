"use client";

import { useEffect, useRef } from 'react';
import { getLayoutRect, getPageScale } from '@/lib/page-scale';

const GLYPHS = '.:;+=x%#';
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };

interface ClothPoint {
  x: number; y: number; breadth: number; foldHeight: number;
  sinPhase: number; cosPhase: number; sinFold: number; cosFold: number;
  sinDrift: number; cosDrift: number; light: number; edge: number; glyph: number;
}

export default function AsciiCloth() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.closest('section');
    const context = canvas?.getContext('2d');
    if (!canvas || !hero || !context) return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 768px)');
    const pointer = { x: -1000, y: -1000, strength: 0, target: 0 };
    let width = 0, height = 0, ratio = 1, frame = 0, lastFrame = 0, lastDraw = 0, time = 0;
    let visible = false;
    let light = document.documentElement.dataset.heroTheme === 'light';
    let quiet = { x: 0, y: 0, rx: 1, ry: 1 };
    let atlas: HTMLCanvasElement;
    let points: ClothPoint[] = [];

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
        ink.fillStyle = light ? `rgba(40,64,72,${0.24 + shade * 0.09})` : `rgba(161,194,203,${0.14 + shade * 0.095})`;
        for (let glyph = 0; glyph < GLYPHS.length; glyph++) {
          ink.fillText(GLYPHS[glyph], glyph * 16 + 8, shade * 20 + 10);
        }
      }
    };

    const resize = () => {
      if (!desktop.matches) {
        points = [];
        canvas.width = canvas.height = 0;
        return;
      }
      width = hero.clientWidth;
      height = hero.clientHeight;
      ratio = Math.min(window.devicePixelRatio || 1, 2) * getPageScale();
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
        const origin = getLayoutRect(content).top - getLayoutRect(hero).top;
        quiet = { x: width / 2, y: origin + (top + bottom) / 2, rx: Math.min(width * 0.44, title.clientWidth / 2 + 90), ry: (bottom - top) / 2 + 72 };
      }
      makeAtlas();
      points = [];
      const columns = Math.min(144, Math.max(64, Math.round(width * getPageScale() / 16)));
      const rows = Math.min(25, Math.max(17, Math.round(height * getPageScale() / 44)));
      // The wave's fixed geometry and trigonometry only change on resize.
      for (let ribbon = 0; ribbon < 2; ribbon++) {
        const breadth = (ribbon === 0 ? 0.09 : 0.105) * height;
        for (let column = 0; column < columns; column++) {
          const u = column / (columns - 1);
          const x = ribbon === 0 ? (-0.12 + u * 0.82) * width : (-0.08 + u * 1.2) * width;
          const center = ribbon === 0
            ? 0.19 - 0.34 * u + 0.055 * Math.sin(u * 8)
            : 0.70 + 0.18 * Math.sin(u * Math.PI) - 0.46 * smooth((u - 0.59) / 0.48);
          for (let row = 0; row < rows; row++) {
            const v = row / (rows - 1) * 2 - 1;
            const phase = u * 13 + v * 3.5 + ribbon * 2;
            points.push({
              x, y: center * height + v * breadth, breadth, foldHeight: breadth * (0.58 + 0.25 * v),
              sinPhase: Math.sin(phase), cosPhase: Math.cos(phase),
              sinFold: Math.sin(u * 22 - v * 4), cosFold: Math.cos(u * 22 - v * 4),
              sinDrift: Math.sin(u * 9 + v * 2), cosDrift: Math.cos(u * 9 + v * 2),
              light: Math.sin(u * 7 - v * 3), edge: smooth((1 - Math.abs(v)) / 0.18),
              glyph: column * 7 + row * 11,
            });
          }
        }
      }
    };

    const draw = () => {
      if (!desktop.matches || document.hidden || document.documentElement.hasAttribute('data-theme-transitioning')) return;
      context.clearRect(0, 0, width, height);
      const motion = media.matches ? 0 : time;
      const radius = 190;
      const sinTime = Math.sin(motion * 0.32), cosTime = Math.cos(motion * 0.32);
      const sinFoldTime = Math.sin(motion * 0.2), cosFoldTime = Math.cos(motion * 0.2);
      const sinDriftTime = Math.sin(motion * 0.17), cosDriftTime = Math.cos(motion * 0.17);
      for (const point of points) {
        const sinPhase = point.sinPhase * cosTime + point.cosPhase * sinTime;
        const cosPhase = point.cosPhase * cosTime - point.sinPhase * sinTime;
        const fold = sinPhase * 0.68 + (point.sinFold * cosFoldTime - point.cosFold * sinFoldTime) * 0.22;
        let x = point.x + (point.sinDrift * cosDriftTime + point.cosDrift * sinDriftTime) * point.breadth * 0.35;
        let y = point.y + fold * point.foldHeight;
        if (pointer.strength > 0.001) {
          const distanceSquared = (x - pointer.x) ** 2 + (y - pointer.y) ** 2;
          // Beyond three radii the Gaussian influence is below 0.00013.
          if (distanceSquared < 9 * radius * radius) {
            const influence = Math.exp(-distanceSquared / (radius * radius)) * pointer.strength;
            x += (x - pointer.x) * influence * 0.14;
            y += (28 + Math.sin(Math.sqrt(distanceSquared) * 0.035 - motion * 2) * 14) * influence;
          }
        }
        if (x < -12 || x > width + 12 || y < -12 || y > height + 12) continue;
        const ellipseSquared = ((x - quiet.x) / quiet.rx) ** 2 + ((y - quiet.y) / quiet.ry) ** 2;
        if (ellipseSquared <= 0.81) continue;
        const ellipse = Math.sqrt(ellipseSquared);
        const clearText = smooth((ellipse - 0.9) / 0.27);
        const fade = smooth(x / 55) * smooth((width - x) / 55) * smooth((height - y) / 75);
        const opacity = clearText * point.edge * fade;
        if (opacity < 0.025) continue;
        const lightness = clamp(0.48 + cosPhase * 0.30 + point.light * 0.15);
        const shade = Math.min(7, Math.floor(lightness * 8));
        const glyph = (point.glyph + Math.floor(lightness * 5)) % GLYPHS.length;
        const size = 0.9 + sinPhase * 0.12;
        context.globalAlpha = opacity;
        context.drawImage(atlas, glyph * 16 * ratio, shade * 20 * ratio, 16 * ratio, 20 * ratio, x - 8 * size, y - 10 * size, 16 * size, 20 * size);
      }
      context.globalAlpha = 1;
    };

    const run = (now: number) => {
      frame = 0;
      if (!desktop.matches || !visible || document.hidden) return;
      const interval = 1000 / (pointer.target > 0 ? 60 : 30);
      if (now - lastFrame >= interval) {
        const elapsed = Math.min((now - lastDraw) / 1000, 0.06);
        lastDraw = now;
        lastFrame = now - (now - lastFrame) % interval;
        time += elapsed;
        // Keep pointer easing consistent at both refresh rates.
        pointer.strength += (pointer.target - pointer.strength) * (1 - Math.pow(0.88, elapsed * 30));
        draw();
      }
      if (!media.matches) frame = requestAnimationFrame(run);
    };
    const start = () => {
      if (desktop.matches && !media.matches && !frame && visible && !document.hidden && !document.documentElement.hasAttribute('data-theme-transitioning')) { lastFrame = lastDraw = performance.now(); frame = requestAnimationFrame(run); }
    };
    const stop = () => { cancelAnimationFrame(frame); frame = 0; };
    const move = (event: PointerEvent) => {
      if (media.matches) return;
      const rect = hero.getBoundingClientRect();
      const scale = getPageScale();
      pointer.x = (event.clientX - rect.left) / scale;
      pointer.y = (event.clientY - rect.top) / scale;
      pointer.target = 1;
    };
    const leave = () => { pointer.target = 0; };
    const refresh = () => { stop(); resize(); if (visible) draw(); start(); };
    const visibility = () => { if (document.hidden) stop(); else start(); };
    const themeObserver = new MutationObserver(() => {
      light = document.documentElement.dataset.heroTheme === 'light';
      if (document.documentElement.hasAttribute('data-theme-transitioning')) { stop(); return; }
      makeAtlas();
      if (visible) draw();
      start();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-hero-theme', 'data-theme-transitioning'] });
    const sizeObserver = new ResizeObserver(refresh);
    sizeObserver.observe(hero);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.1;
      if (visible) { draw(); start(); } else stop();
    }, { threshold: [0, 0.1] });
    intersection.observe(hero);
    hero.addEventListener('pointermove', move, { passive: true });
    hero.addEventListener('pointerdown', move, { passive: true });
    hero.addEventListener('pointerleave', leave);
    hero.addEventListener('pointerup', leave);
    hero.addEventListener('pointercancel', leave);
    document.addEventListener('visibilitychange', visibility);
    media.addEventListener('change', refresh);
    desktop.addEventListener('change', refresh);
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
      desktop.removeEventListener('change', refresh);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 hidden h-full w-full md:block" />;
}
