"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTranslations, useMessages, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ExternalLink,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import SectionReveal from '@/components/animations/SectionReveal';

interface ProjectItem {
  key: string;
  slug: string;
  defaultImage: string;
}

const PROJECT_LIST: ProjectItem[] = [
  { key: 'aliagaAI', slug: 'aliaga-ai', defaultImage: '/projects/aliagaai.png' },
  {
    key: 'aiDreamInterpreter',
    slug: 'ai-dream-interpreter',
    defaultImage: '/projects/dream-interpreter.png',
  },
  { key: 'kayipQR', slug: 'kayip-qr', defaultImage: '/projects/kayipqr.png' },
  { key: 'weDo', slug: 'wedo', defaultImage: '/projects/wedo-card.png' },
  {
    key: 'visualAI',
    slug: 'real-time-visual-understanding',
    defaultImage: '/projects/visual-ai.png',
  },
];

const TOTAL = PROJECT_LIST.length;

/**
 * Signed shortest circular distance in [-2, -1, 0, 1, 2] for 5 items.
 */
function getCircularOffset(index: number, activeIndex: number): number {
  let diff = index - activeIndex;
  const half = Math.floor(TOTAL / 2);
  if (diff > half) diff -= TOTAL;
  if (diff < -half) diff += TOTAL;
  return diff;
}

export default function Projects() {
  const t = useTranslations('projects');
  const messages = useMessages() as any;
  const locale = useLocale();
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const [currentIndex, setCurrentIndex] = useState(0); // Start on AliağaAI
  const [viewportW, setViewportW] = useState(1200);
  const [dragOffset, setDragOffset] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wheelLockRef = useRef(false);
  const pointerStateRef = useRef<{
    active: boolean;
    pointerId: number;
    startX: number;
    startY: number;
    startTime: number;
    axisLocked: 'x' | 'y' | null;
    didSwipe: boolean;
  }>({
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    startTime: 0,
    axisLocked: null,
    didSwipe: false,
  });

  // Track viewport width for responsive 3D coverflow spacing
  useEffect(() => {
    const updateWidth = () => {
      setViewportW(document.documentElement.clientWidth || window.innerWidth);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth, { passive: true });
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % TOTAL);
  }, []);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + TOTAL) % TOTAL);
  }, []);

  const goToIndex = useCallback((idx: number) => {
    setCurrentIndex(((idx % TOTAL) + TOTAL) % TOTAL);
  }, []);

  // Auto-rotate every 5.5s when not hovered / touched
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(goNext, 5500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, goNext, currentIndex]);

  // Bidirectional Pointer / Touch Swipe Handler (Smooth mobile left & right swipe)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    setIsPaused(true);
    pointerStateRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startTime: performance.now(),
      axisLocked: null,
      didSwipe: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = pointerStateRef.current;
    if (!st.active || e.pointerId !== st.pointerId) return;

    const dx = e.clientX - st.startX;
    const dy = e.clientY - st.startY;

    if (st.axisLocked === null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      st.axisLocked = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
      if (st.axisLocked === 'x') {
        st.didSwipe = true;
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // Ignore pointer capture errors
        }
      }
    }

    if (st.axisLocked === 'x') {
      // Smooth elastic resistance while dragging
      const clamped = Math.max(-130, Math.min(130, dx * 0.55));
      setDragOffset(clamped);
    }
  };

  const finishPointerGesture = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = pointerStateRef.current;
    if (!st.active || e.pointerId !== st.pointerId) return;

    const dx = e.clientX - st.startX;
    const elapsed = Math.max(1, performance.now() - st.startTime);
    const velocity = dx / elapsed; // px per ms

    if (st.axisLocked === 'x') {
      if (dx > 38 || velocity > 0.35) {
        // Swiped right -> go back to PREVIOUS (left) card
        goPrev();
      } else if (dx < -38 || velocity < -0.35) {
        // Swiped left -> advance to NEXT (right) card
        goNext();
      }
    }

    setDragOffset(0);
    st.active = false;
    st.axisLocked = null;

    if (e.pointerType !== 'mouse') {
      setIsPaused(false);
    }
  };

  // Horizontal trackpad two-finger swipe support
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 26) {
      return;
    }
    if (wheelLockRef.current) return;
    wheelLockRef.current = true;
    if (e.deltaX > 0) {
      goNext();
    } else {
      goPrev();
    }
    setTimeout(() => {
      wheelLockRef.current = false;
    }, 480);
  };

  // Keyboard arrow navigation when focused inside gallery
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
    }
  };

  const isMobile = viewportW < 640;
  const isTablet = viewportW >= 640 && viewportW < 1024;
  const step1X = isMobile ? 140 : isTablet ? 215 : 265;
  const step2X = isMobile ? 225 : isTablet ? 345 : 430;

  const activeProjectMeta = PROJECT_LIST[currentIndex];
  const items = messages?.projects?.items || {};
  const activeData = items[activeProjectMeta.key] || {};

  return (
    <section
      id="projects"
      className="relative md:min-h-screen flex flex-col justify-center py-20 sm:py-24 md:py-28 lg:py-32 px-4 md:px-8 bg-[#0d0d0d] content-visibility-auto overflow-hidden"
    >
      {/* Background dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a] pointer-events-none" />

      <div className="relative z-10 max-w-[1140px] w-full mx-auto md:my-auto flex flex-col justify-center">
        {/* Header Layout */}
        <SectionReveal delay={0}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 md:mb-10">
            <div>
              <div className="font-mono text-xs font-semibold tracking-[0.2em] text-[#819fa7] uppercase mb-2">
                {t('badge')}
              </div>
              <h2 className="text-3xl sm:text-5xl md:text-[54px] font-display font-extrabold text-[#f3f5f9] tracking-tight leading-[1.08]">
                {t('title')}
              </h2>
              <p className="text-sm sm:text-base text-white/50 max-w-xl mt-3 leading-relaxed">
                {t('subtitle')}
              </p>
            </div>

            <a
              href="https://github.com/DuranGZR?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 self-start sm:self-auto px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs tracking-wider uppercase hover:bg-white/90 hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-white/10 shrink-0"
            >
              {t('viewMore')}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </SectionReveal>

        {/* 3D Album Coverflow Carousel */}
        <SectionReveal delay={0.12}>
          <div
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            style={{ outline: 'none' }}
            className="relative w-full my-2 sm:my-6 flex flex-col items-center select-none"
          >
            {/* Interactive Swipe & Coverflow Stage */}
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={finishPointerGesture}
              onPointerCancel={finishPointerGesture}
              onWheel={handleWheel}
              style={{ perspective: 1200, touchAction: 'pan-y' }}
              className="relative w-full max-w-[1040px] h-[215px] sm:h-[295px] md:h-[355px] flex items-center justify-center cursor-grab active:cursor-grabbing"
            >
              {PROJECT_LIST.map((proj, idx) => {
                const projData = items[proj.key] || {};
                const imgSrc = projData.image || proj.defaultImage;
                const rel = getCircularOffset(idx, currentIndex);
                const isCenter = rel === 0;
                const absRel = Math.abs(rel);

                const baseX =
                  rel === 0
                    ? 0
                    : rel === 1
                      ? step1X
                      : rel === -1
                        ? -step1X
                        : rel === 2
                          ? step2X
                          : -step2X;

                const targetScale =
                  rel === 0 ? 1 : absRel === 1 ? 0.76 : 0.56;
                const targetOpacity =
                  rel === 0 ? 1 : absRel === 1 ? 0.82 : isMobile ? 0 : 0.28;
                const targetRotateY = prefersReducedMotion
                  ? 0
                  : rel === 0
                    ? 0
                    : rel > 0
                      ? -14
                      : 14;
                const zIndex = rel === 0 ? 30 : absRel === 1 ? 20 : 10;

                // Apply live finger/mouse drag follow smoothly
                const dragFactor = isCenter ? 1 : absRel === 1 ? 0.55 : 0.25;

                return (
                  <motion.div
                    key={proj.key}
                    initial={false}
                    animate={{
                      x: baseX + dragOffset * dragFactor,
                      scale: targetScale,
                      opacity: targetOpacity,
                      rotateY: targetRotateY,
                    }}
                    transition={
                      dragOffset !== 0
                        ? { type: 'tween', duration: 0.05, ease: 'linear' }
                        : {
                            type: 'spring',
                            stiffness: 225,
                            damping: 28,
                            mass: 0.88,
                          }
                    }
                    onClick={() => {
                      if (pointerStateRef.current.didSwipe) {
                        pointerStateRef.current.didSwipe = false;
                        return;
                      }
                      if (isCenter) {
                        router.push(`/${locale}/projects/${proj.slug}`);
                      } else {
                        goToIndex(idx);
                      }
                    }}
                    style={{
                      zIndex,
                      transformStyle: 'preserve-3d',
                      willChange: 'transform, opacity',
                      pointerEvents: isMobile && absRel > 1 ? 'none' : 'auto',
                    }}
                    className={`group/card absolute w-[276px] sm:w-[410px] md:w-[490px] aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer ${
                      isCenter
                        ? 'border border-white/25 shadow-[0_28px_65px_-15px_rgba(0,0,0,0.92),0_0_40px_rgba(129,159,167,0.2)]'
                        : 'border border-white/10 shadow-[0_16px_32px_-10px_rgba(0,0,0,0.65)]'
                    }`}
                  >
                    <img
                      src={imgSrc}
                      alt={projData.title || proj.key}
                      className="w-full h-full object-cover select-none pointer-events-none bg-[#121417] transition-transform duration-500 group-hover/card:scale-[1.02]"
                      draggable={false}
                    />
                    {!isCenter && (
                      <div className="absolute inset-0 bg-black/38 group-hover/card:bg-black/15 transition-colors duration-300" />
                    )}
                  </motion.div>
                );
              })}

              {/* Left / Previous Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                aria-label={locale === 'tr' ? 'Önceki proje' : 'Previous project'}
                style={{ outline: 'none' }}
                className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-40 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#151a20]/85 hover:bg-[#202831] backdrop-blur-xl border border-white/15 hover:border-[#819fa7]/60 text-white/80 hover:text-white flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.65)] active:scale-90 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Right / Next Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                aria-label={locale === 'tr' ? 'Sonraki proje' : 'Next project'}
                style={{ outline: 'none' }}
                className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-40 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#151a20]/85 hover:bg-[#202831] backdrop-blur-xl border border-white/15 hover:border-[#819fa7]/60 text-white/80 hover:text-white flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.65)] active:scale-90 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Interactive Pagination Dots */}
            <div className="flex items-center justify-center gap-2 mt-5">
              {PROJECT_LIST.map((proj, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={proj.key}
                    type="button"
                    onClick={() => goToIndex(idx)}
                    aria-label={`Project ${idx + 1}`}
                    style={{ outline: 'none' }}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'w-7 bg-[#819fa7]'
                        : 'w-1.5 bg-white/20 hover:bg-white/45'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Smoothly Animated Active Project Details Box */}
          <div className="max-w-[780px] mx-auto text-center px-4 mt-6 md:mt-8 min-h-[150px] flex flex-col items-center justify-start">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProjectMeta.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-3"
              >
                {activeData.category && (
                  <div className="inline-block font-mono text-[11px] font-semibold tracking-[0.16em] uppercase text-[#819fa7]/90">
                    {activeData.category}
                  </div>
                )}

                <h3 className="text-2xl sm:text-3xl md:text-[34px] font-display font-bold text-[#f3f5f9] tracking-tight">
                  {activeData.title || 'Project'}
                </h3>

                <p className="text-sm sm:text-[15px] leading-relaxed text-white/60 max-w-[660px] mx-auto">
                  {activeData.tagline || ''}
                </p>

                <div className="pt-2">
                  <Link
                    href={`/${locale}/projects/${activeProjectMeta.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-[#819fa7] border-b border-white hover:border-[#819fa7] pb-1 transition-all duration-200 group"
                  >
                    <span>{t('viewProject')}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
