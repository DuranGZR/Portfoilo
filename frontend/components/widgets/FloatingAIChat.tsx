"use client";

import { useState, useRef, useEffect, useLayoutEffect, useCallback, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from 'framer-motion';
import {
  X,
  Send,
  Loader2,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useLocale } from 'next-intl';
import { getPageScale } from '@/lib/page-scale';
import { useChat } from '@/components/ai/ChatProvider';
import ChatFeedback from '@/components/ai/ChatFeedback';
import ChatMessageContent from '@/components/ui/ChatMessageContent';
import HeroWritingArm from '@/components/sections/Hero/HeroWritingArm';
import { HERO_INTRO_READY, isAtHeroStart, playHeroIntro } from '@/components/sections/Hero/heroIntro';
import VisorPodMascot, { type MascotMood } from '@/components/widgets/Mascot/VisorPodMascot';
import {
  playSyllableBlip,
  playWakeChime,
  playSendBlip,
} from '@/components/widgets/Mascot/botVoice';

type SectionKey =
  | 'hero'
  | 'about'
  | 'projects'
  | 'skills'
  | 'experience'
  | 'thinking'
  | 'ai-assistant';

type CornerKey = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

const SECTION_ORDER: SectionKey[] = [
  'hero',
  'about',
  'projects',
  'skills',
  'experience',
  'thinking',
  'ai-assistant',
];

const SECTION_CORNER_MAP: Record<SectionKey, CornerKey> = {
  hero: 'bottom-right',
  about: 'bottom-left',
  projects: 'top-right',
  skills: 'top-left',
  experience: 'bottom-right',
  thinking: 'bottom-left',
  'ai-assistant': 'top-right',
};

const SECTION_LINES: Record<'tr' | 'en', Record<SectionKey, string>> = {
  tr: {
    hero: "Hoş geldin! Ben Duran'ın asistanıyım 👋",
    about: "Duran'ı yakından tanımak istersen buradayım 😊",
    projects: 'Duran’ın projelerine buradan göz atabilirsin.',
    skills: 'Mutfaktaki teknolojilere göz atmayı unutma 🛠️',
    experience: 'Eğitim ve sertifikalara da bir bak derim 🎓',
    thinking: 'Problemlere nasıl yaklaştığı tam burada 🧠',
    'ai-assistant': 'Burası benim mekanım, hadi konuşalım! 😄',
  },
  en: {
    hero: "Welcome! I'm Duran's assistant 👋",
    about: "I'm right here if you want to know Duran better 😊",
    projects: "Take a look at Duran’s projects here.",
    skills: 'Take a peek at the tech stack here 🛠️',
    experience: 'Check out the uni courses & certs too 🎓',
    thinking: 'How he approaches problems is right here 🧠',
    'ai-assistant': 'Welcome to my turf—let’s chat! 😄',
  },
};

const UI_COPY = {
  tr: {
    welcomeSpeech:
      "Selam! Duran’ın projeleri, eğitimi, kullandığı teknolojiler veya CV’si hakkında sorabilirsin.",
    statusIdle: 'Yazışmaya hazır',
    statusReading: 'Yazıyorsunuz…',
    statusThinking: 'Düşünüyor...',
    statusSpeaking: 'Konuşuyor…',
    statusHappy: 'Selam! 👋',
    statusError: 'Yanıt alınamadı',
    inputPlaceholder: 'Duran hakkında bir soru…',
    send: 'Gönder',
    clearChat: 'Sohbeti sıfırla',
    muteToggle: 'Maskot sesini aç/kapat',
    closeChat: 'Sohbeti kapat',
    closeGreeting: 'Mesajı kapat',
    openChat: 'AI Asistan ile konuş',
  },
  en: {
    welcomeSpeech:
      "Hi! Ask about Duran’s projects, education, technologies or CV.",
    statusIdle: 'Ready to chat',
    statusReading: 'You’re typing…',
    statusThinking: 'Thinking...',
    statusSpeaking: 'Speaking…',
    statusHappy: 'Hello! 👋',
    statusError: 'No response',
    inputPlaceholder: 'Ask about Duran…',
    send: 'Send',
    clearChat: 'Reset chat',
    muteToggle: 'Toggle mascot sounds',
    closeChat: 'Close chat',
    closeGreeting: 'Dismiss message',
    openChat: 'Talk to AI Assistant',
  },
} as const;

const POD_WIDTH = 74;
const POD_HEIGHT = 67;
const subscribeToNothing = () => () => {};

function computeCornerCoords(
  corner: CornerKey,
  vw: number,
  vh: number
): { x: number; y: number } {
  const isMobile = window.innerWidth < 640;
  const marginX = isMobile ? 14 : 24;
  const marginBottom =
    corner === 'bottom-left'
      ? isMobile
        ? 48
        : 54
      : isMobile
        ? 16
        : 24;
  const marginTop = isMobile ? 74 : 84;

  const x = corner.endsWith('right') ? vw - POD_WIDTH - marginX : marginX;
  const y = corner.startsWith('bottom') ? vh - POD_HEIGHT - marginBottom : marginTop;
  return { x, y };
}

export default function FloatingAIChat() {
  const rawLocale = useLocale();
  const locale = rawLocale === 'en' ? 'en' : 'tr';
  const copy = UI_COPY[locale];
  const lines = SECTION_LINES[locale];
  const prefersReducedMotion = useReducedMotion();

  const [viewport, setViewport] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [hasEntered, setHasEntered] = useState(false);
  const [isWritingIntro, setIsWritingIntro] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionKey>('hero');
  const [activeCorner, setActiveCorner] = useState<CornerKey>('bottom-right');
  const [isFlying, setIsFlying] = useState(false);
  const [flightLean, setFlightLean] = useState(0);
  const [showBubble, setShowBubble] = useState(false);
  const [isPodOrBubbleHovered, setIsPodOrBubbleHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Conversation & live lip-sync states
  const {messages, isLoading, isResetting, error, send, clear} = useChat();
  const stickToBottom = useRef(true);
  const [input, setInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnergy, setSpeechEnergy] = useState(0);
  const [speechTick, setSpeechTick] = useState(0);
  const [speech, setSpeech] = useState<{id: string; cursor: number} | null>(null);
  const seenReplyRef = useRef<string | null>(null);
  const speechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestReply = messages.filter(message => message.role === 'assistant').at(-1);
  const speechTargetId = latestReply?.id || 'welcome';
  const speechTargetText = latestReply?.content || copy.welcomeSpeech;
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [typingProgress, setTypingProgress] = useState(0.5);
  const [transientMood, setTransientMood] = useState<'greeting' | 'happy' | 'error' | null>(null);
  const mounted = useSyncExternalStore(subscribeToNothing, () => true, () => false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const fixedFrameRef = useRef<HTMLDivElement>(null);
  const closedPodRef = useRef<HTMLDivElement>(null);
  const stageLiftRef = useRef<HTMLDivElement>(null);
  const isInputFocusedRef = useRef(false);
  const lockedScrollYRef = useRef<number | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transientMoodTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flightLandTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leanResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bubbleAutoHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeSectionRef = useRef<SectionKey>('hero');
  const activeCornerRef = useRef<CornerKey>('bottom-right');
  const isMutedRef = useRef(false);

  // Persist voice mute preference
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const muted = localStorage.getItem('dg_mascot_muted') === '1';
        setIsMuted(muted);
        isMutedRef.current = muted;
      } catch { /* Keep the default voice when storage is unavailable. */ }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      isMutedRef.current = next;
      try { localStorage.setItem('dg_mascot_muted', next ? '1' : '0'); } catch { /* Preference applies to this visit. */ }
      if (!next) {
        playWakeChime();
      }
      return next;
    });
  };

  const flashMood = useCallback((mood: 'greeting' | 'happy' | 'error', durationMs = 1100) => {
    if (transientMoodTimeoutRef.current) {
      clearTimeout(transientMoodTimeoutRef.current);
    }
    setTransientMood(mood);
    transientMoodTimeoutRef.current = setTimeout(() => {
      setTransientMood(null);
    }, durationMs);
  }, []);

  // Track exact inner viewport dimensions without thrashing during mobile keyboard open
  useEffect(() => {
    const updateViewport = () => {
      if (isInputFocusedRef.current && window.innerWidth < 640) {
        return;
      }
      const vv = window.visualViewport;
      const scale = getPageScale();
      const w =
        fixedFrameRef.current?.clientWidth ||
        document.documentElement.clientWidth / scale ||
        window.innerWidth / scale;
      const h = Math.round((vv ? vv.offsetTop + vv.height : window.innerHeight) / scale);
      setViewport((prev) =>
        prev.w === w && Math.abs(prev.h - h) < 2 ? prev : { w, h }
      );
    };

    updateViewport();
    window.addEventListener('resize', updateViewport, { passive: true });
    window.visualViewport?.addEventListener('resize', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.visualViewport?.removeEventListener('resize', updateViewport);
    };
  }, []);

  // Broadcast active corner so BackToTop never overlaps
  useEffect(() => {
    const occupiedCorner = isOpen
      ? activeCorner.endsWith('right')
        ? 'bottom-right'
        : 'bottom-left'
      : activeCorner;

    window.dispatchEvent(
      new CustomEvent('mascot-corner-change', {
        detail: { corner: occupiedCorner },
      })
    );
  }, [activeCorner, isOpen]);

  // The home page entrance writes the hero's two lines before docking.
  useEffect(() => {
    const enter = () => {
      setHasEntered(true);
      flashMood('greeting', 1800);
    };
    const enterTimer = setTimeout(enter, 2150);
    const startHeroIntro = () => {
      if (!document.getElementById('hero') || !isAtHeroStart()) return;
      clearTimeout(enterTimer);
      setIsWritingIntro(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      enter();
    };

    window.addEventListener(HERO_INTRO_READY, startHeroIntro);
    startHeroIntro();
    const firstBubbleTimer = setTimeout(() => {
      setShowBubble(true);
    }, 2600);

    return () => {
      window.removeEventListener(HERO_INTRO_READY, startHeroIntro);
      clearTimeout(enterTimer);
      clearTimeout(firstBubbleTimer);
    };
  }, [flashMood]);

  const isPodVisible = hasEntered && viewport.w > 0 && !isOpen;
  useLayoutEffect(() => {
    if (!isWritingIntro || !isPodVisible || !closedPodRef.current) return;
    return playHeroIntro(
      closedPodRef.current,
      () => flashMood('happy', 720),
      () => setIsWritingIntro(false),
      () => !isMutedRef.current
    );
  }, [flashMood, isWritingIntro, isPodVisible]);

  // Auto-hide tiny section bubble softly
  useEffect(() => {
    if (!showBubble || isPodOrBubbleHovered || isOpen) {
      if (bubbleAutoHideTimeoutRef.current) {
        clearTimeout(bubbleAutoHideTimeoutRef.current);
      }
      return;
    }

    const hideDelay = activeSection === 'hero' ? 7500 : 4800;
    bubbleAutoHideTimeoutRef.current = setTimeout(() => {
      setShowBubble(false);
    }, hideDelay);

    return () => {
      if (bubbleAutoHideTimeoutRef.current) {
        clearTimeout(bubbleAutoHideTimeoutRef.current);
      }
    };
  }, [showBubble, isPodOrBubbleHovered, isOpen, activeSection]);

  // Smooth scroll-spy across all 7 sections
  useEffect(() => {
    if (!hasEntered || isWritingIntro) return;

    let rafId: number | null = null;
    let settleTimer: ReturnType<typeof setTimeout> | null = null;
    let candidateSection: SectionKey = activeSectionRef.current;

    const detectSection = (): SectionKey => {
      if (window.scrollY < 220) return 'hero';

      const probeY = window.innerHeight * 0.45;
      for (const secId of SECTION_ORDER) {
        if (secId === 'hero') continue;
        const el = document.getElementById(secId);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= probeY && rect.bottom >= probeY) {
          return secId;
        }
      }
      return activeSectionRef.current;
    };

    const moveToSection = (nextSection: SectionKey) => {
      if (nextSection === activeSectionRef.current) return;

      const prevCorner = activeCornerRef.current;
      const nextCorner = SECTION_CORNER_MAP[nextSection];

      activeSectionRef.current = nextSection;
      activeCornerRef.current = nextCorner;

      const goingRight = nextCorner.endsWith('right') && prevCorner.endsWith('left');
      const goingLeft = nextCorner.endsWith('left') && prevCorner.endsWith('right');
      const lean = prefersReducedMotion ? 0 : goingRight ? 7 : goingLeft ? -7 : 0;

      setShowBubble(false);
      setIsFlying(true);
      setFlightLean(lean);
      setActiveSection(nextSection);
      setActiveCorner(nextCorner);

      if (leanResetTimeoutRef.current) clearTimeout(leanResetTimeoutRef.current);
      if (flightLandTimeoutRef.current) clearTimeout(flightLandTimeoutRef.current);

      leanResetTimeoutRef.current = setTimeout(() => {
        setFlightLean(0);
      }, 520);

      flightLandTimeoutRef.current = setTimeout(
        () => {
          setIsFlying(false);
          flashMood('greeting', 1200);
          setShowBubble(true);
        },
        prefersReducedMotion ? 80 : 880
      );
    };

    const handleScroll = () => {
      if (isOpen) return;
      if (rafId !== null) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        const detected = detectSection();
        if (detected !== candidateSection) {
          candidateSection = detected;
          if (settleTimer) clearTimeout(settleTimer);
          settleTimer = setTimeout(() => {
            moveToSection(detected);
          }, 190);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (settleTimer) clearTimeout(settleTimer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasEntered, isOpen, isWritingIntro, prefersReducedMotion, flashMood]);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (transientMoodTimeoutRef.current) clearTimeout(transientMoodTimeoutRef.current);
      if (flightLandTimeoutRef.current) clearTimeout(flightLandTimeoutRef.current);
      if (leanResetTimeoutRef.current) clearTimeout(leanResetTimeoutRef.current);
      if (bubbleAutoHideTimeoutRef.current) clearTimeout(bubbleAutoHideTimeoutRef.current);
    };
  }, []);

  const syncVisualViewport = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Keep background page strictly at its exact scroll position while mobile keyboard is active
    if (isInputFocusedRef.current && lockedScrollYRef.current !== null && window.innerWidth < 640) {
      if (Math.abs(window.scrollY - lockedScrollYRef.current) >= 1 || window.scrollX !== 0) {
        window.scrollTo({
          top: lockedScrollYRef.current,
          left: 0,
          behavior: 'instant' as ScrollBehavior,
        });
      }
    }

    const frameEl = fixedFrameRef.current;
    const stageEl = stageLiftRef.current;
    const vv = window.visualViewport;
    const scale = getPageScale();

    const frameW = frameEl?.clientWidth || document.documentElement.clientWidth || window.innerWidth;
    const frameH =
      frameEl?.getBoundingClientRect().height ||
      document.documentElement.clientHeight ||
      window.innerHeight;

    const isMobileTouch =
      frameW * scale < 640 || window.matchMedia('(pointer: coarse)').matches;

    if (!isMobileTouch) {
      if (stageEl) {
        stageEl.style.transform = 'translate3d(0, 0, 0)';
      }
      if (messagesContainerRef.current) {
        messagesContainerRef.current.style.maxHeight = '265px';
      }
      setIsKeyboardVisible(false);
      return;
    }

    const vvBottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
    const visibleH = vv ? vv.height : window.innerHeight;
    const occludedBottom = Math.max(0, Math.round(frameH - vvBottom));

    const keyboardActive =
      occludedBottom > 110 ||
      (isInputFocusedRef.current && visibleH < frameH - 95);

    const baseBottom = 16;
    const desiredGap = keyboardActive ? 10 : 14;
    const liftPx =
      occludedBottom > 0
        ? Math.max(0, occludedBottom + desiredGap - baseBottom)
        : 0;

    if (stageEl) {
      stageEl.style.transform =
        liftPx > 0 ? `translate3d(0, -${liftPx / scale}px, 0)` : 'translate3d(0, 0, 0)';
    }

    if (messagesContainerRef.current) {
      const maxH = Math.max(
        84,
        Math.min(230, Math.round(visibleH / scale - (keyboardActive ? 124 : 210)))
      );
      messagesContainerRef.current.style.maxHeight = `${maxH}px`;
      if (keyboardActive) {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }
    }

    setIsKeyboardVisible((prev) => (prev !== keyboardActive ? keyboardActive : prev));
  }, []);

  useEffect(() => {
    if (!isOpen) {
      isInputFocusedRef.current = false;
      lockedScrollYRef.current = null;
      document.documentElement.style.scrollBehavior = '';
      return;
    }

    let rafId: number | null = null;
    const handleViewportUpdate = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = null;
        syncVisualViewport();
      });
    };

    syncVisualViewport();

    const vv = window.visualViewport;
    vv?.addEventListener('resize', handleViewportUpdate);
    vv?.addEventListener('scroll', handleViewportUpdate);
    window.addEventListener('resize', handleViewportUpdate, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      vv?.removeEventListener('resize', handleViewportUpdate);
      vv?.removeEventListener('scroll', handleViewportUpdate);
      window.removeEventListener('resize', handleViewportUpdate);
    };
  }, [isOpen, syncVisualViewport]);

  // Freeze background page scroll/shift on mobile while virtual keyboard input is focused
  useEffect(() => {
    if (!isOpen || !isInputFocused) return;
    if (typeof window === 'undefined' || window.innerWidth >= 640) return;

    if (lockedScrollYRef.current === null) {
      lockedScrollYRef.current = window.scrollY;
    }
    const savedY = lockedScrollYRef.current;
    document.documentElement.style.scrollBehavior = 'auto';

    const lockWindowScroll = () => {
      if (lockedScrollYRef.current === null) return;
      if (Math.abs(window.scrollY - lockedScrollYRef.current) >= 1 || window.scrollX !== 0) {
        window.scrollTo({
          top: lockedScrollYRef.current,
          left: 0,
          behavior: 'instant' as ScrollBehavior,
        });
      }
      syncVisualViewport();
    };

    const handleDocumentTouchStart = (e: TouchEvent) => {
      const target = e.target as Node | null;
      if (target && stageLiftRef.current && !stageLiftRef.current.contains(target)) {
        inputRef.current?.blur();
      }
    };

    const handleStageTouchMove = (e: TouchEvent) => {
      const target = e.target as Node | null;
      const msgBox = messagesContainerRef.current;
      if (
        target &&
        msgBox &&
        msgBox.contains(target) &&
        msgBox.scrollHeight > msgBox.clientHeight
      ) {
        return;
      }
      e.preventDefault();
    };

    const stageEl = stageLiftRef.current;
    window.addEventListener('scroll', lockWindowScroll, { passive: true });
    document.addEventListener('touchstart', handleDocumentTouchStart, { passive: true });
    stageEl?.addEventListener('touchmove', handleStageTouchMove, { passive: false });

    return () => {
      window.removeEventListener('scroll', lockWindowScroll);
      document.removeEventListener('touchstart', handleDocumentTouchStart);
      stageEl?.removeEventListener('touchmove', handleStageTouchMove);
      if (Math.abs(window.scrollY - savedY) >= 1 || window.scrollX !== 0) {
        window.scrollTo({
          top: savedY,
          left: 0,
          behavior: 'instant' as ScrollBehavior,
        });
      }
      lockedScrollYRef.current = null;
      document.documentElement.style.scrollBehavior = '';
    };
  }, [isOpen, isInputFocused, syncVisualViewport]);

  // Keep conversation scrolled smoothly to latest bubble
  useEffect(() => {
    if (isOpen && messagesContainerRef.current && stickToBottom.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    }
  }, [messages, speech, isLoading, isOpen, isKeyboardVisible, prefersReducedMotion]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setIsInputFocused(false);
        setIsKeyboardVisible(false);
        requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('[data-portfolio-chat] button[aria-label="' + copy.openChat + '"]')?.focus());
      }
    };
    document.addEventListener('keydown', onKey);
    const timer = window.innerWidth >= 640 ? setTimeout(() => inputRef.current?.focus({preventScroll:true}), 200) : null;
    return () => {document.removeEventListener('keydown', onKey); if (timer) clearTimeout(timer);};
  }, [isOpen, copy.openChat]);

  // Animate only the mascot's presentation; shared history retains the complete answer.
  useEffect(() => {
    const fresh = seenReplyRef.current !== speechTargetId;
    if (isOpen || latestReply) seenReplyRef.current = speechTargetId;
    const frame = requestAnimationFrame(() => {
      setSpeech(null); setIsSpeaking(false); setSpeechEnergy(0);
      if (!fresh || !isOpen || prefersReducedMotion || isLoading) return;
      const step = Math.max(1, Math.min(3, Math.ceil(speechTargetText.length / 130)));
      let cursor = 0;
      const reveal = () => {
        const chunk = speechTargetText.slice(cursor, cursor + step);
        cursor = Math.min(cursor + step, speechTargetText.length);
        const last = chunk.at(-1) || '';
        const finished = cursor === speechTargetText.length;
        const vowel = chunk.match(/[aeıioöuüAEIİOÖUÜ]/)?.[0];
        setSpeech({id: speechTargetId, cursor});
        setIsSpeaking(!finished);
        setSpeechEnergy(finished ? 0 : vowel ? 0.8 : 0.3);
        setSpeechTick(value => value + 1);
        if (vowel && !isMutedRef.current) playSyllableBlip(vowel.charCodeAt(0), speechTargetText.includes('?'));
        if (finished) {speechTimerRef.current = null; return;}
        const delay = /[.!?\n]/.test(last) ? 210 : /[,;:]/.test(last) ? 125 : last === ' ' ? 28 : 24;
        speechTimerRef.current = setTimeout(reveal, delay);
      };
      reveal();
    });
    return () => {cancelAnimationFrame(frame); if (speechTimerRef.current) clearTimeout(speechTimerRef.current);};
  }, [speechTargetId, speechTargetText, isOpen, prefersReducedMotion, isLoading, latestReply]);

  const finishSpeech = () => {
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    speechTimerRef.current = null;
    setSpeech(null); setIsSpeaking(false); setSpeechEnergy(0);
  };

  const sendPrompt = useCallback((rawText: string) => {
    if (!rawText.trim() || isLoading || isResetting) return;
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    setSpeech(null); setIsSpeaking(false); setSpeechEnergy(0);
    stickToBottom.current = true;
    if (!isMutedRef.current) playSendBlip();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsUserTyping(false); setInput('');
    void send(rawText);
  }, [isLoading, isResetting, send]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);

    if (!val.trim()) {
      setIsUserTyping(false);
      setTypingProgress(0.5);
      return;
    }

    setIsUserTyping(true);
    const len = val.length;
    const progress = len <= 32 ? len / 32 : 0.72 + Math.sin(len * 0.45) * 0.22;
    setTypingProgress(progress);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsUserTyping(false);
    }, 1300);
  };

  const handleOpenChat = () => {
    setIsWritingIntro(false);
    setShowBubble(false);
    if (!isMutedRef.current) {
      playWakeChime();
    }
    setIsOpen(true);
  };

  const handleCloseChat = () => {
    finishSpeech();
    inputRef.current?.blur();
    setIsOpen(false);
    setIsInputFocused(false);
    setIsKeyboardVisible(false);
  };

  const handleDismissBubble = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowBubble(false);
  };

  const handleResetChat = () => {
    finishSpeech(); setInput(''); void clear();
  };

  const activeMood: MascotMood = error ? 'error' : isLoading ? 'thinking' : isSpeaking ? 'speaking' : isUserTyping ? 'user-typing' : transientMood || 'idle';
  const statusText = error ? copy.statusError : isLoading ? copy.statusThinking : isSpeaking ? copy.statusSpeaking : isUserTyping ? copy.statusReading : copy.statusIdle;

  const isRightSide = activeCorner.endsWith('right');
  const podFacing: 'left' | 'right' = isRightSide ? 'left' : 'right';
  const currentLine = lines[activeSection];
  const isBubbleVisible = !isWritingIntro && !isFlying && (showBubble || isPodOrBubbleHovered);
  const targetCoords =
    viewport.w > 0
      ? computeCornerCoords(activeCorner, viewport.w, viewport.h)
      : null;

  const isMobileViewport = viewport.w > 0 && window.innerWidth < 640;
  const messagesFade = messages.length > 2
    ? 'var(--hero-chat-message-mask, linear-gradient(to bottom, transparent 0%, black 16%, black 100%))'
    : undefined;

  // Show only recent exchanges in the frameless air stream so screen stays clean, while keeping scrollability
  const lastAssistantIdx = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return i;
    }
    return -1;
  })();

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      ref={fixedFrameRef}
      data-portfolio-chat
      className="fixed inset-0 z-[70] pointer-events-none overflow-hidden"
    >
      {/* 1. CLOSED ROAMING STATE: Silky 3D Corner-Gliding Mascot + Tiny 1-Line Bubble */}
      {isPodVisible && targetCoords && (
        <motion.div
          ref={closedPodRef}
          initial={isWritingIntro || prefersReducedMotion ? false : {
            x: targetCoords.x,
            y: targetCoords.y + 80,
            opacity: 0,
            scale: 0.86,
            rotate: 0,
          }}
          animate={{
            x: targetCoords.x,
            y: targetCoords.y,
            opacity: 1,
            scale: 1,
            rotate: flightLean,
          }}
          transition={{
            x: {
              type: 'spring',
              stiffness: 38,
              damping: 14.5,
              mass: 1.08,
              restDelta: 0.5,
            },
            y: {
              type: 'spring',
              stiffness: 38,
              damping: 14.5,
              mass: 1.08,
              restDelta: 0.5,
            },
            rotate: {
              type: 'spring',
              stiffness: 85,
              damping: 18,
            },
            opacity: { duration: 0.45, ease: 'easeOut' },
            scale: { duration: 0.45, ease: 'easeOut' },
          }}
          style={{
            width: POD_WIDTH,
            height: POD_HEIGHT,
            willChange: 'transform',
          }}
          onMouseEnter={() => setIsPodOrBubbleHovered(true)}
          onMouseLeave={() => setIsPodOrBubbleHovered(false)}
          className="absolute top-0 left-0 z-10 pointer-events-auto"
        >
          <AnimatePresence mode="wait">
            {isBubbleVisible && (
              <motion.div
                key={`${activeSection}-${activeCorner}`}
                initial={{
                  opacity: 0,
                  x: isRightSide ? 10 : -10,
                  scale: 0.92,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  x: isRightSide ? 8 : -8,
                  scale: 0.94,
                }}
                transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                onClick={handleOpenChat}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenChat();
                  }
                }}
                style={{
                  boxShadow:
                    'var(--hero-chat-shadow, 0 4px 12px rgba(0, 0, 0, 0.25))',
                }}
                className={`chat-greeting chat-accent-surface group/bubble absolute top-1/2 -translate-y-1/2 ${
                  isRightSide ? 'right-full mr-3' : 'left-full ml-3'
                } w-max max-w-[185px] sm:max-w-[215px] bg-gradient-to-br from-[#242f38]/95 to-[#171e25]/96 hover:from-[#2b3843]/98 hover:to-[#1b232c]/98 backdrop-blur-xl border border-[#9ec3d0]/42 hover:border-[#bee2ef]/65 rounded-xl px-3 py-2 transition-colors cursor-pointer`}
              >
                <span
                  aria-hidden="true"
                  className={`chat-tail absolute top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-[#1d262e] ${
                    isRightSide
                      ? '-right-[5px] border-t border-r border-[#9ec3d0]/42'
                      : '-left-[5px] border-b border-l border-[#9ec3d0]/42'
                  }`}
                />

                <button
                  type="button"
                  onClick={handleDismissBubble}
                  aria-label={copy.closeGreeting}
                  className="opacity-0 group-hover/bubble:opacity-100 absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#1a222a] border border-[#9ec3d0]/40 flex items-center justify-center text-[#b8dce8] hover:text-white transition-opacity"
                >
                  <X className="w-2.5 h-2.5" />
                </button>

                <p className="text-[11.5px] sm:text-[12px] font-medium text-[#f3f8fb] leading-[1.35]">
                  {currentLine}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="hero-mascot-stage relative">
            {isWritingIntro && <HeroWritingArm />}
            <VisorPodMascot
              size="lg"
              mood={activeMood}
              facing={isWritingIntro ? 'right' : podFacing}
              isFlying={isFlying || isWritingIntro}
              isIntroducing={isWritingIntro}
              enableCursorTracking={!isWritingIntro}
              showShadow={!isWritingIntro}
              onClick={handleOpenChat}
              ariaLabel={copy.openChat}
            />
          </div>
        </motion.div>
      )}

      {/* 2. OPEN CONVERSATION STATE: STİL 1 — FRAMELESS FLOATING COMPANION STAGE! */}
      <AnimatePresence>
        {isOpen && (
          <div
            ref={stageLiftRef}
            style={{
              bottom: isMobileViewport ? 16 : 24,
              transition: 'transform 0.14s cubic-bezier(0.22, 1, 0.36, 1)',
              willChange: 'transform',
            }}
            className={`absolute left-3 right-3 ${
              isRightSide
                ? 'sm:left-auto sm:right-6'
                : 'sm:left-6 sm:right-auto'
            } sm:w-[372px] z-20 pointer-events-none`}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className={`relative w-full flex flex-col ${
                isRightSide ? 'items-end' : 'items-start'
              } ${isKeyboardVisible ? 'gap-2' : 'gap-2.5'} pointer-events-none`}
            >
            {/* A. Floating Mini Status & Controls Pill */}
            <div
              className="chat-status chat-accent-surface pointer-events-auto inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#172028]/88 backdrop-blur-xl border border-[#9ec3d0]/32 shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  activeMood === 'error'
                    ? 'bg-amber-400'
                    : activeMood === 'speaking' ||
                        activeMood === 'thinking' ||
                        activeMood === 'user-typing'
                      ? 'bg-[#d6f3fc] portfolio-light:bg-ink-accent'
                      : 'bg-[#9ec3d0] portfolio-light:bg-ink-accent'
                }`}
              />
              <span className="chat-status-copy text-[11px] font-medium text-[#bed9e4] pr-1 select-none">
                {statusText}
              </span>

              <div className="h-3 w-px bg-[#9ec3d0]/20" />

              <button
                type="button"
                onClick={toggleMute}
                title={copy.muteToggle}
                aria-label={copy.muteToggle}
                className={`p-1 rounded-full transition-colors ${
                  isMuted
                    ? 'text-[#8ea8b4]/55 hover:text-[#f3f8fb]'
                    : 'text-[#d0eef8] hover:text-white bg-[#9ec3d0]/12'
                }`}
              >
                {isMuted ? (
                  <VolumeX className="w-3 h-3" />
                ) : (
                  <Volume2 className="w-3 h-3" />
                )}
              </button>

              <button
                type="button"
                onClick={handleResetChat}
                disabled={isResetting}
                title={copy.clearChat}
                aria-label={copy.clearChat}
                className="p-1 rounded-full text-[#9ebbc7]/70 hover:text-[#f3f8fb] transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={handleCloseChat}
                title={copy.closeChat}
                aria-label={copy.closeChat}
                className="p-1 rounded-full text-[#9ebbc7]/70 hover:text-[#f3f8fb] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* B. Open-Air Floating Speech Bubbles Stream (Top-Faded, Zero Scrollbar!) */}
            <div
              ref={messagesContainerRef}
              role="region"
              aria-label={locale === 'tr' ? 'Sohbet mesajları' : 'Conversation messages'}
              onScroll={(event) => {const el=event.currentTarget; stickToBottom.current = el.scrollHeight-el.scrollTop-el.clientHeight < 64;}}
              style={{
                maxHeight: isMobileViewport ? '200px' : '265px',
                maskImage: messagesFade,
                WebkitMaskImage: messagesFade,
              }}
              className="pointer-events-auto w-full min-h-0 overflow-y-auto overscroll-contain mascot-no-scrollbar flex flex-col gap-2.5 pt-2 pb-1.5 px-1"
            >
              {messages.length === 0 && <div className="chat-assistant-copy px-3"><ChatMessageContent content={speech?.id === 'welcome' ? copy.welcomeSpeech.slice(0, speech.cursor) : copy.welcomeSpeech} isStreaming={isSpeaking && speech?.id === 'welcome'} /></div>}
              {messages.map((message, idx) => {
                const isUser = message.role === 'user';
                const isLatestAssistant = !isUser && idx === lastAssistantIdx;

                return (
                  <motion.div
                    key={message.id}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex w-full shrink-0 ${
                      isUser
                        ? isRightSide
                          ? 'justify-start'
                          : 'justify-end'
                        : isRightSide
                          ? 'justify-end'
                          : 'justify-start'
                    }`}
                  >
                    <div
                      onClick={isSpeaking && speech?.id === message.id ? finishSpeech : undefined}
                      data-speaking={isSpeaking && speech?.id === message.id ? 'true' : undefined}
                      style={
                        isUser
                          ? {
                              boxShadow: 'var(--hero-chat-shadow, 0 10px 26px rgba(0, 0, 0, 0.55))',
                            }
                          : {
                              boxShadow:
                                'var(--hero-chat-shadow, 0 14px 36px rgba(0, 0, 0, 0.76), 0 0 24px rgba(138, 184, 198, 0.14), inset 0 1px 0 rgba(224, 244, 252, 0.22))',
                            }
                      }
                      className={`relative max-w-[88%] px-4 py-2.5 rounded-2xl text-[12.5px] sm:text-[13px] leading-[1.48] ${
                        isUser
                          ? 'chat-user-bubble bg-gradient-to-br from-[#9abcc8]/95 to-[#6b848d]/95 text-[#090c10] font-medium backdrop-blur-xl'
                          : 'chat-accent-surface bg-gradient-to-br from-[#232e38]/95 to-[#151c23]/97 text-[#f2f7fa] border border-[#9ec3d0]/40 backdrop-blur-2xl'
                      }`}
                    >
                      {/* Speech Pointer Tail Connecting Latest Bubble Directly To Mascot Below! */}
                      {isLatestAssistant && !isLoading && (
                        <span
                          aria-hidden="true"
                          className={`absolute -bottom-[5px] ${
                            isRightSide ? 'right-8' : 'left-8'
                          } chat-tail w-2.5 h-2.5 rotate-45 bg-[#161d24] border-b border-r border-[#9ec3d0]/40`}
                        />
                      )}

                      <ChatMessageContent
                        className={isUser ? undefined : 'chat-assistant-copy'}
                        content={speech?.id === message.id ? message.content.slice(0, speech.cursor) : message.content}
                        isStreaming={isSpeaking && speech?.id === message.id}
                        isUser={isUser}
                      />
                    </div>
                  </motion.div>
                );
              })}

              {/* Floating Thought Bubble While Waiting For AI */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex w-full ${
                    isRightSide ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    style={{
                      boxShadow:
                        'var(--hero-chat-shadow, 0 12px 28px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(220, 242, 250, 0.2))',
                    }}
                    className="chat-accent-surface relative bg-gradient-to-br from-[#232e38]/95 to-[#151c23]/97 border border-[#9ec3d0]/42 backdrop-blur-2xl px-4 py-3 rounded-2xl flex items-center gap-1.5"
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute -bottom-[5px] ${
                        isRightSide ? 'right-7' : 'left-7'
                      } chat-tail w-2.5 h-2.5 rotate-45 bg-[#161d24] border-b border-r border-[#9ec3d0]/42`}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-[#d4f2fc] rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-[#d4f2fc] rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-[#d4f2fc] rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </motion.div>
              )}
            </div>

            <div className="pointer-events-auto px-3">
              <p id="floating-chat-help" className="text-xs chat-assistant-copy">{input.length}/2000</p>
              {isSpeaking && <button type="button" onClick={finishSpeech} className="text-xs chat-assistant-copy underline underline-offset-2">{locale === 'tr' ? 'Tamamını göster' : 'Show full answer'}</button>}
              <ChatFeedback compact />
            </div>
            {/* C. Bottom Companion Stage: Full-Size Open-Air Visor Pod + Single-Piece Floating Input Capsule */}
            <div
              className={`pointer-events-auto w-full flex shrink-0 items-center gap-2.5 ${
                isRightSide ? 'flex-row' : 'flex-row-reverse'
              }`}
            >
              {/* Single-Piece Luminous Glass Input Capsule (Zero Double Focus Ring!) */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendPrompt(input);
                }}
                style={{
                  boxShadow:
                    'var(--hero-chat-shadow, 0 14px 36px rgba(0, 0, 0, 0.78), 0 0 22px rgba(129, 159, 167, 0.12), inset 0 1px 0 rgba(224, 244, 252, 0.2))',
                }}
                className="chat-accent-surface flex-1 min-w-0 flex items-center gap-1.5 bg-gradient-to-br from-[#202a33]/94 to-[#141a21]/97 backdrop-blur-2xl border border-[#9ec3d0]/42 focus-within:border-[#c6ebf7]/75 rounded-2xl pl-3.5 pr-1.5 py-1.5 transition-colors"
              >
                <input
                  ref={inputRef}
                  type="text"
                  maxLength={2000}
                  aria-describedby="floating-chat-help"
                  enterKeyHint="send"
                  value={input}
                  onChange={handleInputChange}
                  onTouchStart={() => {
                    if (typeof window !== 'undefined' && window.innerWidth < 640) {
                      lockedScrollYRef.current = window.scrollY;
                      document.documentElement.style.scrollBehavior = 'auto';
                    }
                  }}
                  onFocus={() => {
                    if (
                      typeof window !== 'undefined' &&
                      window.innerWidth < 640 &&
                      lockedScrollYRef.current === null
                    ) {
                      lockedScrollYRef.current = window.scrollY;
                      document.documentElement.style.scrollBehavior = 'auto';
                    }
                    isInputFocusedRef.current = true;
                    setIsInputFocused(true);
                    syncVisualViewport();
                    setTimeout(syncVisualViewport, 60);
                    setTimeout(syncVisualViewport, 160);
                    setTimeout(syncVisualViewport, 320);
                  }}
                  onBlur={() => {
                    setIsUserTyping(false);
                    isInputFocusedRef.current = false;
                    setIsInputFocused(false);
                    setTimeout(syncVisualViewport, 80);
                    setTimeout(syncVisualViewport, 240);
                  }}
                  placeholder={copy.inputPlaceholder}
                  aria-label={copy.inputPlaceholder}
                  disabled={isLoading || isResetting}
                  className="flex-1 min-w-0 bg-transparent border-none text-base sm:text-[13px] text-[#f5f9fc] placeholder-[#9ab3be]/55 disabled:opacity-50 py-1"
                />
                <button
                  type="submit"
                  onMouseDown={(e) => e.preventDefault()}
                  onPointerDown={(e) => e.preventDefault()}
                  disabled={!input.trim() || isLoading || isResetting}
                  aria-label={copy.send}
                  className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#a8cad6] to-[#6a838c] text-[#090c10] flex items-center justify-center hover:opacity-95 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0 shadow-xs"
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </form>

              {/* Full-Size Open-Air 3D Visor Pod Talking Directly To You! */}
              <div className="shrink-0">
                <VisorPodMascot
                  size={isKeyboardVisible ? 'md' : isMobileViewport ? 'lg' : 'xl'}
                  mood={activeMood}
                  facing={podFacing}
                  typingProgress={typingProgress}
                  speechEnergy={speechEnergy}
                  speechTick={speechTick}
                  enableCursorTracking
                  showShadow
                  onClick={() => {
                    if (!isMutedRef.current) playWakeChime();
                    flashMood('happy', 1000);
                  }}
                  ariaLabel={copy.openChat}
                />
              </div>
            </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}
