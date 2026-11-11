"use client";

import { useEffect, useId, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion';

export const MASCOT_IDLE_EYES = [
  'M 33 55.5 C 34.8 45, 46.2 45, 48 55.5',
  'M 61 55.5 C 62.8 45, 74.2 45, 76 55.5',
] as const;

export type MascotMood =
  | 'idle'
  | 'greeting'
  | 'happy'
  | 'user-typing'
  | 'thinking'
  | 'speaking'
  | 'error';

interface VisorPodMascotProps {
  mood?: MascotMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** 'left' when sitting on right corners, 'right' when sitting on left corners */
  facing?: 'left' | 'right';
  /** Whether the pod is currently gliding between corners */
  isFlying?: boolean;
  isIntroducing?: boolean;
  /** Normalized 0..1 reading sweep progress while the user types */
  typingProgress?: number;
  /** Live syllable energy (0..1) driving the 5-bar LED voice equalizer & audio aura */
  speechEnergy?: number;
  /** Syllable tick counter driving subtle conversational head gestures */
  speechTick?: number;
  /** Track mouse cursor across viewport */
  enableCursorTracking?: boolean;
  /** Show floating hover shadow & ambient backlight halo */
  showShadow?: boolean;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

const SIZE_MAP = {
  sm: { width: 40, height: 36 },
  md: { width: 52, height: 47 },
  lg: { width: 74, height: 67 },
  xl: { width: 88, height: 80 },
} as const;

const EQUALIZER_BARS = [
  { cx: 44.5, weight: 0.48, phase: 0.7 },
  { cx: 49.5, weight: 0.82, phase: 1.3 },
  { cx: 54.5, weight: 1.0, phase: 0.0 },
  { cx: 59.5, weight: 0.78, phase: 1.9 },
  { cx: 64.5, weight: 0.45, phase: 0.4 },
] as const;

export default function VisorPodMascot({
  mood = 'idle',
  size = 'lg',
  facing = 'left',
  isFlying = false,
  isIntroducing = false,
  typingProgress = 0,
  speechEnergy = 0,
  speechTick = 0,
  enableCursorTracking = true,
  showShadow = true,
  onClick,
  className = '',
  ariaLabel = 'AI Assistant Mascot',
}: VisorPodMascotProps) {
  const uid = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const [isHovered, setIsHovered] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [proximityNear, setProximityNear] = useState(false);

  // Normalized look target (-1 to 1) driven at 60fps without React re-renders
  const rawLookX = useMotionValue(0);
  const rawLookY = useMotionValue(0);

  // 3D Face orientation across the rounded pod: 0 = facing left, 18 = facing right
  const rawFaceOffset = useMotionValue(facing === 'right' ? 18 : 0);

  const smoothLookX = useSpring(rawLookX, { stiffness: 170, damping: 22, mass: 0.55 });
  const smoothLookY = useSpring(rawLookY, { stiffness: 170, damping: 22, mass: 0.55 });
  const smoothFaceOffset = useSpring(rawFaceOffset, { stiffness: 62, damping: 16, mass: 0.9 });

  useEffect(() => {
    rawFaceOffset.set(facing === 'right' ? 18 : 0);
  }, [facing, rawFaceOffset]);

  // Multi-layer 3D perspective transforms
  const podRotateY = useTransform(
    [smoothLookX, smoothFaceOffset],
    ([lx, fo]: number[]) => {
      const baseAngle = (fo / 18) * 10 - 5;
      return baseAngle + lx * 9;
    }
  );
  const podRotateX = useTransform(smoothLookY, [-1, 1], [8, -8]);

  const visorShiftX = useTransform(
    [smoothLookX, smoothFaceOffset],
    ([lx, fo]: number[]) => {
      const cursorShift =
        fo < 9
          ? lx < 0
            ? lx * 2.2
            : lx * 6.2
          : lx > 0
            ? lx * 2.2
            : lx * 6.2;
      return fo + cursorShift;
    }
  );
  const visorShiftY = useTransform(smoothLookY, [-1, 1], [-2.2, 2.2]);
  const eyeShiftX = useTransform(smoothLookX, [-1, 1], [-7, 7]);
  const eyeShiftY = useTransform(smoothLookY, [-1, 1], [-5.8, 5.8]);
  const eyePerspectiveScaleX = useTransform(smoothLookX, [-1, 0, 1], [0.89, 1, 0.89]);

  // Cursor tracking & proximity detection
  useEffect(() => {
    if (!enableCursorTracking || prefersReducedMotion) {
      rawLookX.set(0);
      rawLookY.set(0);
      return;
    }

    if (mood === 'user-typing' || mood === 'thinking' || mood === 'error') {
      return;
    }

    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const el = containerRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const distance = Math.hypot(dx, dy);

        const maxRadius = 420;
        const factor = Math.min(distance / maxRadius, 1);
        const angle = Math.atan2(dy, dx);

        rawLookX.set(Math.cos(angle) * factor);
        rawLookY.set(Math.sin(angle) * factor);

        const isNear = distance < 165;
        setProximityNear((prev) => (prev !== isNear ? isNear : prev));
      });
    };

    const handleMouseLeave = () => {
      rawLookX.set(0);
      rawLookY.set(0);
      setProximityNear(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enableCursorTracking, mood, prefersReducedMotion, rawLookX, rawLookY]);

  // Mood-specific gaze overrides & natural speaking eye gestures
  useEffect(() => {
    if (isIntroducing) {
      rawLookX.set(0.4);
      rawLookY.set(0.65);
    } else if (mood === 'user-typing') {
      const sweep = (typingProgress - 0.5) * 1.45;
      rawLookX.set(Math.max(-0.8, Math.min(0.85, sweep)));
      rawLookY.set(0.68);
    } else if (mood === 'greeting') {
      rawLookX.set(facing === 'right' ? 0.16 : -0.16);
      rawLookY.set(-0.05);
    } else if (mood === 'speaking') {
      // Subtle expressive glance toward dialogue bubble while speaking
      const dir = facing === 'right' ? 0.18 : -0.18;
      const microGesture = Math.sin(speechTick * 0.35) * 0.08;
      rawLookX.set(dir + microGesture);
      rawLookY.set(-0.12 + Math.cos(speechTick * 0.25) * 0.06);
    } else if (mood === 'error') {
      rawLookX.set(0);
      rawLookY.set(0.25);
    }
  }, [isIntroducing, mood, typingProgress, facing, speechTick, rawLookX, rawLookY]);

  // Thinking gaze oscillation
  useEffect(() => {
    if (mood !== 'thinking' || prefersReducedMotion) return;

    let step = 0;
    rawLookY.set(-0.55);
    rawLookX.set(-0.45);

    const interval = setInterval(() => {
      step = (step + 1) % 3;
      if (step === 0) {
        rawLookX.set(-0.48);
        rawLookY.set(-0.55);
      } else if (step === 1) {
        rawLookX.set(0.52);
        rawLookY.set(-0.5);
      } else {
        rawLookX.set(0.04);
        rawLookY.set(-0.35);
      }
    }, 620);

    return () => clearInterval(interval);
  }, [mood, prefersReducedMotion, rawLookX, rawLookY]);

  // Natural organic blink engine
  useEffect(() => {
    if (prefersReducedMotion) return;

    let blinkTimeout: ReturnType<typeof setTimeout>;
    let resetTimeout: ReturnType<typeof setTimeout>;
    let doubleTimeout: ReturnType<typeof setTimeout>;
    let doubleResetTimeout: ReturnType<typeof setTimeout>;

    const scheduleNextBlink = () => {
      const delay = 2600 + Math.random() * 2900;
      blinkTimeout = setTimeout(() => {
        setIsBlinking(true);
        resetTimeout = setTimeout(() => {
          setIsBlinking(false);
          if (Math.random() < 0.22) {
            doubleTimeout = setTimeout(() => {
              setIsBlinking(true);
              doubleResetTimeout = setTimeout(() => {
                setIsBlinking(false);
                scheduleNextBlink();
              }, 105);
            }, 125);
          } else {
            scheduleNextBlink();
          }
        }, 120);
      }, delay);
    };

    if (!isIntroducing) scheduleNextBlink();

    return () => {
      clearTimeout(blinkTimeout);
      clearTimeout(resetTimeout);
      clearTimeout(doubleTimeout);
      clearTimeout(doubleResetTimeout);
    };
  }, [prefersReducedMotion, isIntroducing]);

  const dimensions = SIZE_MAP[size];
  const isActivelySpeaking = mood === 'speaking' && speechEnergy > 0.14;

  // Natural conversational head tilt & syllable bob while speaking!
  const speakingTilt =
    mood === 'speaking' && !prefersReducedMotion
      ? Math.sin(speechTick * 0.42) * 3.2 * Math.max(0.35, speechEnergy)
      : 0;
  const speakingBobY =
    mood === 'speaking' && !prefersReducedMotion ? -speechEnergy * 2.8 : 0;

  const postureScale =
    mood === 'speaking'
      ? 1 + speechEnergy * 0.028
      : isHovered || proximityNear
        ? 1.04
        : isFlying
          ? 1.03
          : 1;

  const postureRotate =
    mood === 'speaking'
      ? speakingTilt
      : mood === 'user-typing'
        ? facing === 'right'
          ? 3.5
          : -3.5
        : mood === 'greeting'
          ? facing === 'right'
            ? 3
            : -3
          : 0;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={{
        width: dimensions.width,
        height: dimensions.height,
        perspective: 520,
      }}
      className={`visor-pod relative select-none flex items-center justify-center ${
        onClick
          ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9ac4d2]/60 rounded-2xl'
          : ''
      } ${className}`}
    >
      {/* Continuous GPU Float Layer */}
      <div
        className="w-full h-full relative flex items-center justify-center"
        style={
          prefersReducedMotion || isIntroducing
            ? undefined
            : { animation: 'float 3.6s ease-in-out infinite' }
        }
      >
        {/* EXPANDING AUDIO SOUND-WAVE RINGS WHEN SPEAKING */}
        {isActivelySpeaking && !prefersReducedMotion && (
          <>
            <motion.div
              aria-hidden="true"
              initial={{ scale: 0.9, opacity: 0.55 }}
              animate={{ scale: 1.48, opacity: 0 }}
              transition={{ duration: 1.15, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border border-[#bce3f0]/45 pointer-events-none"
            />
            <motion.div
              aria-hidden="true"
              initial={{ scale: 0.9, opacity: 0.4 }}
              animate={{ scale: 1.65, opacity: 0 }}
              transition={{
                duration: 1.15,
                delay: 0.55,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              className="absolute inset-0 rounded-full border border-[#9ec3d0]/30 pointer-events-none"
            />
          </>
        )}

        {/* Voice-Reactive Radial Backlight Halo */}
        <motion.div
          aria-hidden="true"
          animate={{
            opacity:
              mood === 'speaking'
                ? 0.68 + speechEnergy * 0.3
                : isFlying
                  ? 0.9
                  : proximityNear || isHovered
                    ? 0.85
                    : 0.62,
            scale:
              mood === 'speaking'
                ? 1.08 + speechEnergy * 0.22
                : isFlying
                  ? 1.22
                  : proximityNear || isHovered
                    ? 1.15
                    : 1.05,
          }}
          transition={{ duration: 0.14, ease: 'easeOut' }}
          className="absolute -inset-4 rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(162, 210, 226, 0.4) 0%, rgba(129, 159, 167, 0.16) 45%, rgba(129, 159, 167, 0) 75%)',
            filter: 'blur(6px)',
          }}
        />

        {/* 3D Perspective Angled Visor Pod */}
        <motion.div
          style={{
            rotateX: podRotateX,
            rotateY: podRotateY,
            transformStyle: 'preserve-3d',
          }}
          animate={{
            scale: postureScale,
            rotateZ: postureRotate,
            y: speakingBobY,
          }}
          transition={{ type: 'spring', stiffness: 240, damping: 18 }}
          whileTap={onClick ? { scale: 0.93 } : undefined}
          className="w-full h-full relative z-10"
        >
          <svg
            viewBox="0 0 128 114"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="visor-pod-art w-full h-full overflow-visible drop-shadow-[0_10px_20px_rgba(0,0,0,0.75)]"
          >
            <defs>
              <radialGradient
                id={`${uid}-shell-main`}
                cx="50%"
                cy="14%"
                r="86%"
                fx="48%"
                fy="10%"
              >
                <stop offset="0%" stopColor="var(--mascot-shell-highlight, #586573)" />
                <stop offset="24%" stopColor="var(--mascot-shell-light, #3e4854)" />
                <stop offset="54%" stopColor="var(--mascot-shell-mid, #283038)" />
                <stop offset="82%" stopColor="var(--mascot-shell-shade, #191e24)" />
                <stop offset="100%" stopColor="var(--mascot-shell-edge, #101419)" />
              </radialGradient>

              <radialGradient id={`${uid}-cheek-right`} cx="85%" cy="38%" r="54%">
                <stop offset="0%" stopColor="#6f8391" stopOpacity="0.28" />
                <stop offset="55%" stopColor="#3b4652" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#161b21" stopOpacity="0" />
              </radialGradient>

              <radialGradient id={`${uid}-cheek-left`} cx="15%" cy="38%" r="54%">
                <stop offset="0%" stopColor="#6f8391" stopOpacity="0.28" />
                <stop offset="55%" stopColor="#3b4652" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#161b21" stopOpacity="0" />
              </radialGradient>

              <linearGradient id={`${uid}-chin-ao`} x1="50%" y1="60%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0" />
                <stop offset="100%" stopColor="#050709" stopOpacity="var(--mascot-chin-opacity, 0.55)" />
              </linearGradient>

              <linearGradient id={`${uid}-rim-light`} x1="25%" y1="0%" x2="75%" y2="100%">
                <stop offset="0%" stopColor="#d4ecf5" stopOpacity="0.55" />
                <stop offset="35%" stopColor="#9abac7" stopOpacity="0.32" />
                <stop offset="72%" stopColor="#6d8894" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#263038" stopOpacity="0.35" />
              </linearGradient>

              <radialGradient id={`${uid}-visor-glass`} cx="50%" cy="46%" r="65%">
                <stop offset="0%" stopColor="var(--mascot-visor-center, #172129)" />
                <stop offset="52%" stopColor="var(--mascot-visor-mid, #0a0e13)" />
                <stop offset="100%" stopColor="var(--mascot-visor-edge, #040608)" />
              </radialGradient>

              <linearGradient id={`${uid}-visor-top-arc`} x1="20%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stopColor="#e6f5fa" stopOpacity="0.38" />
                <stop offset="55%" stopColor="#b8dce8" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>

              <linearGradient id={`${uid}-visor-sheen`} x1="15%" y1="0%" x2="65%" y2="85%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
                <stop offset="55%" stopColor="#b8dce8" stopOpacity="0.03" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>

              <radialGradient id={`${uid}-eye-ambient`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#aae0f2" stopOpacity="0.42" />
                <stop offset="55%" stopColor="#819fa7" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#819fa7" stopOpacity="0" />
              </radialGradient>

              <filter
                id={`${uid}-eye-glow`}
                x="-70%"
                y="-70%"
                width="240%"
                height="240%"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur in="SourceGraphic" stdDeviation="4.0" result="wideGlow" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="tightGlow" />
                <feMerge>
                  <feMergeNode in="wideGlow" />
                  <feMergeNode in="tightGlow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <clipPath id={`${uid}-visor-clip`}>
                <path d="M 55 19.5 C 78.5 19.5, 90.5 30, 90.5 54 C 90.5 78, 78.5 88.5, 55 88.5 C 31.5 88.5, 19.5 78, 19.5 54 C 19.5 30, 31.5 19.5, 55 19.5 Z" />
              </clipPath>
            </defs>

            {/* 1. OUTER 3D SQUIRCLE CUSHION SHELL */}
            <path
              d="M 64 8 C 96 8, 116 20, 116 54 C 116 86, 96 100, 64 100 C 32 100, 12 86, 12 54 C 12 20, 32 8, 64 8 Z"
              fill={`url(#${uid}-shell-main)`}
            />
            <motion.path
              animate={{ opacity: facing === 'left' ? 1 : 0 }}
              transition={{ duration: 0.6 }}
              d="M 64 8 C 96 8, 116 20, 116 54 C 116 86, 96 100, 64 100 C 32 100, 12 86, 12 54 C 12 20, 32 8, 64 8 Z"
              fill={`url(#${uid}-cheek-right)`}
            />
            <motion.path
              animate={{ opacity: facing === 'right' ? 1 : 0 }}
              transition={{ duration: 0.6 }}
              d="M 64 8 C 96 8, 116 20, 116 54 C 116 86, 96 100, 64 100 C 32 100, 12 86, 12 54 C 12 20, 32 8, 64 8 Z"
              fill={`url(#${uid}-cheek-left)`}
            />
            <path
              d="M 64 8 C 96 8, 116 20, 116 54 C 116 86, 96 100, 64 100 C 32 100, 12 86, 12 54 C 12 20, 32 8, 64 8 Z"
              fill={`url(#${uid}-chin-ao)`}
            />
            <path
              d="M 64 8.75 C 95.4 8.75, 115.2 20.6, 115.2 54 C 115.2 85.4, 95.4 99.25, 64 99.25 C 32.6 99.25, 12.8 85.4, 12.8 54 C 12.8 20.6, 32.6 8.75, 64 8.75 Z"
              stroke={`url(#${uid}-rim-light)`}
              strokeWidth="1.5"
            />

            {/* 2. RECESSED TALL-SQUIRCLE VISOR */}
            <motion.g style={{ x: visorShiftX, y: visorShiftY }}>
              <path
                d="M 55 17.5 C 80 17.5, 92.5 28.5, 92.5 54 C 92.5 79.5, 80 90.5, 55 90.5 C 30 90.5, 17.5 79.5, 17.5 54 C 17.5 28.5, 30 17.5, 55 17.5 Z"
                fill="#030406"
                stroke="rgba(198, 226, 236, 0.16)"
                strokeWidth="1.1"
              />

              <path
                d="M 55 19.5 C 78.5 19.5, 90.5 30, 90.5 54 C 90.5 78, 78.5 88.5, 55 88.5 C 31.5 88.5, 19.5 78, 19.5 54 C 19.5 30, 31.5 19.5, 55 19.5 Z"
                fill={`url(#${uid}-visor-glass)`}
              />

              <g clipPath={`url(#${uid}-visor-clip)`}>
                <path
                  d="M 19.5 60 C 19.5 30, 31.5 19.5, 58 19.5 C 70 19.5, 79 22.5, 84 28 C 64 31, 46 44, 35 72 C 26 68, 20.5 64, 19.5 60 Z"
                  fill={`url(#${uid}-visor-sheen)`}
                />

                <motion.g
                  style={{
                    x: eyeShiftX,
                    y: eyeShiftY,
                    scaleX: eyePerspectiveScaleX,
                    transformOrigin: '54.5px 53px',
                  }}
                >
                  <ellipse
                    cx="40.5"
                    cy="50"
                    rx="16"
                    ry="14"
                    fill={`url(#${uid}-eye-ambient)`}
                  />
                  <ellipse
                    cx="68.5"
                    cy="50"
                    rx="16"
                    ry="14"
                    fill={`url(#${uid}-eye-ambient)`}
                  />

                  <motion.g
                    data-mascot-eyes
                    animate={{ scaleY: isBlinking && !isIntroducing ? 0.08 : 1 }}
                    transition={{ duration: 0.09, ease: 'easeInOut' }}
                    style={{ transformOrigin: '54.5px 50px' }}
                    filter={`url(#${uid}-eye-glow)`}
                  >
                    {mood === 'error' ? (
                      <>
                        <path
                          d="M 33.5 54 C 36.5 48.5, 43.5 47.5, 47.5 50.5"
                          stroke="#d4f2fc"
                          strokeWidth="6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 75.5 54 C 72.5 48.5, 65.5 47.5, 61.5 50.5"
                          stroke="#d4f2fc"
                          strokeWidth="6"
                          strokeLinecap="round"
                        />
                      </>
                    ) : mood === 'user-typing' || mood === 'thinking' ? (
                      <>
                        <rect
                          x="35"
                          y="43.5"
                          width="11.5"
                          height="14.5"
                          rx="5.75"
                          fill="#d6f3fc"
                        />
                        <rect
                          x="63"
                          y="43.5"
                          width="11.5"
                          height="14.5"
                          rx="5.75"
                          fill="#d6f3fc"
                        />
                        <circle cx="39" cy="47.5" r="1.5" fill="#ffffff" opacity="0.9" />
                        <circle cx="67" cy="47.5" r="1.5" fill="#ffffff" opacity="0.9" />
                      </>
                    ) : (
                      /* Happy Curved Glowing Arc Eyes (Slightly raised when speaking to give room for LED equalizer!) */
                      <>
                        <path
                          d={
                            mood === 'speaking'
                              ? 'M 33 52.5 C 34.8 42.5, 46.2 42.5, 48 52.5'
                              : MASCOT_IDLE_EYES[0]
                          }
                          stroke="#d6f3fc"
                          strokeWidth="6.8"
                          strokeLinecap="round"
                        />
                        <path
                          d={
                            mood === 'speaking'
                              ? 'M 61 52.5 C 62.8 42.5, 74.2 42.5, 76 52.5'
                              : MASCOT_IDLE_EYES[1]
                          }
                          stroke="#d6f3fc"
                          strokeWidth="6.8"
                          strokeLinecap="round"
                        />
                      </>
                    )}
                  </motion.g>

                  {/* SYLLABLE-SYNCED 5-BAR LED VOICE EQUALIZER WHEN SPEAKING */}
                  {mood === 'speaking' ? (
                    <g filter={`url(#${uid}-eye-glow)`}>
                      {EQUALIZER_BARS.map((bar) => {
                        const harmonic =
                          0.68 + 0.32 * Math.abs(Math.sin(speechTick * 0.9 + bar.phase));
                        const barHeight = Math.max(
                          2.2,
                          2.2 + speechEnergy * 11.5 * bar.weight * harmonic
                        );
                        return (
                          <rect
                            key={bar.cx}
                            x={bar.cx - 1.3}
                            y={68.5 - barHeight / 2}
                            width="2.6"
                            height={barHeight}
                            rx="1.3"
                            fill="#daf5ff"
                            style={{
                              transition: 'height 65ms ease-out, y 65ms ease-out',
                            }}
                          />
                        );
                      })}
                    </g>
                  ) : mood === 'thinking' ? (
                    <g transform="translate(54.5, 70)">
                      {[-7, 0, 7].map((dx, idx) => (
                        <motion.circle
                          key={dx}
                          cx={dx}
                          cy={0}
                          r="2.1"
                          fill="#d4f2fc"
                          animate={{
                            opacity: [0.3, 1, 0.3],
                            y: [0, -2.5, 0],
                          }}
                          transition={{
                            duration: 0.72,
                            repeat: Infinity,
                            delay: idx * 0.15,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                    </g>
                  ) : mood === 'user-typing' ? (
                    <path
                      d="M 49.5 69 Q 54.5 71 59.5 69"
                      stroke="#b8dce8"
                      strokeOpacity="0.6"
                      strokeWidth="2.1"
                      strokeLinecap="round"
                      fill="none"
                    />
                  ) : (
                    <path
                      d="M 47.5 69.5 Q 54.5 73.5 61.5 69.5"
                      stroke={
                        isHovered || proximityNear || mood === 'happy'
                          ? 'rgba(200, 236, 248, 0.42)'
                          : 'rgba(3, 5, 8, 0.92)'
                      }
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      fill="none"
                    />
                  )}
                </motion.g>

                <path
                  d="M 28 27.5 C 39 21, 71 21, 82 27.5 C 70 23.5, 40 23.5, 28 27.5 Z"
                  fill={`url(#${uid}-visor-top-arc)`}
                />
              </g>

              <path
                d="M 55 19.5 C 78.5 19.5, 90.5 30, 90.5 54 C 90.5 78, 78.5 88.5, 55 88.5 C 31.5 88.5, 19.5 78, 19.5 54 C 19.5 30, 31.5 19.5, 55 19.5 Z"
                stroke="rgba(220, 240, 248, 0.1)"
                strokeWidth="0.9"
              />
            </motion.g>
          </svg>
        </motion.div>
      </div>

      {/* 3. FLOATING HOVER FLOOR SHADOW */}
      {showShadow && (
        <div
          aria-hidden="true"
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-[64%] h-2 rounded-full pointer-events-none transition-opacity duration-500"
          style={{
            opacity: isFlying ? 0.25 : 0.75,
            background:
              'var(--mascot-floor-shadow, radial-gradient(ellipse at center, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.45) 55%, transparent 80%))',
            filter: 'blur(2px)',
          }}
        />
      )}
    </div>
  );
}
