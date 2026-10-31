"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
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
import { sendChatMessage } from '@/lib/api';
import VisorPodMascot, { type MascotMood } from '@/components/widgets/Mascot/VisorPodMascot';
import {
  playSyllableBlip,
  playWakeChime,
  playSendBlip,
} from '@/components/widgets/Mascot/botVoice';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

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
    projects: 'Projelerimi incelemeyi unutma! 🚀',
    skills: 'Mutfaktaki teknolojilere göz atmayı unutma 🛠️',
    experience: 'Eğitim ve sertifikalara da bir bak derim 🎓',
    thinking: 'Problemlere nasıl yaklaştığı tam burada 🧠',
    'ai-assistant': 'Burası benim mekanım, hadi konuşalım! 😄',
  },
  en: {
    hero: "Welcome! I'm Duran's assistant 👋",
    about: "I'm right here if you want to know Duran better 😊",
    projects: "Don't forget to check out my projects! 🚀",
    skills: 'Take a peek at the tech stack here 🛠️',
    experience: 'Check out the uni courses & certs too 🎓',
    thinking: 'How he approaches problems is right here 🧠',
    'ai-assistant': 'Welcome to my turf—let’s chat! 😄',
  },
};

const UI_COPY = {
  tr: {
    welcomeSpeech:
      "Selam! 👋 Ben Duran'ın AI asistanıyım. Geliştirdiği projeler, kullandığı teknolojiler veya deneyimi hakkında merak ettiğin her şeyi bana sorabilirsin!",
    statusIdle: 'Seni dinliyor',
    statusReading: 'Yazdıklarını okuyor...',
    statusThinking: 'Düşünüyor...',
    statusSpeaking: 'Konuşuyor...',
    statusHappy: 'Selam! 👋',
    statusError: 'Bağlantı sorunu',
    inputPlaceholder: 'Bana bir şey sor...',
    fallbackOfflineReply:
      'Şu anda arka plan AI servisine ulaşamıyorum, ama hemen özetleyeyim: Duran Gezer; AI Systems, Backend ve DevOps alanlarına odaklanan (RAG mimarileri, Python, FastAPI, Docker, Next.js) bir Bilgisayar Mühendisliği öğrencisidir.',
    clearChat: 'Sohbeti sıfırla',
    muteToggle: 'Konuşma sesini aç/kapat',
    closeChat: 'Sohbeti kapat',
    closeGreeting: 'Mesajı kapat',
    openChat: 'AI Asistan ile konuş',
  },
  en: {
    welcomeSpeech:
      "Hey there! 👋 I'm Duran's AI assistant. Ask me anything about his AI/ML projects, tech stack, or engineering journey!",
    statusIdle: 'Listening',
    statusReading: 'Reading what you type...',
    statusThinking: 'Thinking...',
    statusSpeaking: 'Speaking...',
    statusHappy: 'Hello! 👋',
    statusError: 'Connection issue',
    inputPlaceholder: 'Ask me anything...',
    fallbackOfflineReply:
      "I couldn't reach the live AI backend right now, but here's a quick summary: Duran Gezer is a Computer Engineering student focusing on AI Systems, Backend, and DevOps (RAG architectures, Python, FastAPI, Docker, Next.js).",
    clearChat: 'Reset chat',
    muteToggle: 'Toggle mascot voice',
    closeChat: 'Close chat',
    closeGreeting: 'Dismiss message',
    openChat: 'Talk to AI Assistant',
  },
} as const;

const VOWEL_REGEX = /[aeıioöuüAEIİOÖUÜ]/;
const POD_WIDTH = 74;
const POD_HEIGHT = 67;

function computeCornerCoords(
  corner: CornerKey,
  vw: number,
  vh: number
): { x: number; y: number } {
  const isMobile = vw < 640;
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
  const [activeSection, setActiveSection] = useState<SectionKey>('hero');
  const [activeCorner, setActiveCorner] = useState<CornerKey>('bottom-right');
  const [isFlying, setIsFlying] = useState(false);
  const [flightLean, setFlightLean] = useState(0);
  const [showBubble, setShowBubble] = useState(false);
  const [isPodOrBubbleHovered, setIsPodOrBubbleHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Conversation & live lip-sync states
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnergy, setSpeechEnergy] = useState(0);
  const [speechTick, setSpeechTick] = useState(0);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [typingProgress, setTypingProgress] = useState(0.5);
  const [transientMood, setTransientMood] = useState<'greeting' | 'happy' | 'error' | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [visualHeight, setVisualHeight] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const hasSpokenIntroRef = useRef(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeStreamFullTextRef = useRef<{ id: string; text: string } | null>(null);
  const transientMoodTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flightLandTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leanResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bubbleAutoHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeSectionRef = useRef<SectionKey>('hero');
  const activeCornerRef = useRef<CornerKey>('bottom-right');
  const isMutedRef = useRef(false);

  // Persist voice mute preference
  useEffect(() => {
    const saved = localStorage.getItem('dg_mascot_muted');
    if (saved === '1') {
      setIsMuted(true);
      isMutedRef.current = true;
    }
  }, []);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      isMutedRef.current = next;
      localStorage.setItem('dg_mascot_muted', next ? '1' : '0');
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

  // Track exact inner viewport dimensions
  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        w: document.documentElement.clientWidth || window.innerWidth,
        h: window.innerHeight,
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport, { passive: true });

    const ro = new ResizeObserver(updateViewport);
    ro.observe(document.documentElement);

    return () => {
      window.removeEventListener('resize', updateViewport);
      ro.disconnect();
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

  // Initial entrance at bottom-right
  useEffect(() => {
    const enterTimer = setTimeout(() => {
      setHasEntered(true);
      flashMood('greeting', 1800);
    }, 2150);

    const firstBubbleTimer = setTimeout(() => {
      setShowBubble(true);
    }, 2600);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(firstBubbleTimer);
    };
  }, [flashMood]);

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
    if (!hasEntered) return;

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
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (settleTimer) clearTimeout(settleTimer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasEntered, isOpen, prefersReducedMotion, flashMood]);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (streamTimerRef.current) clearTimeout(streamTimerRef.current);
      if (transientMoodTimeoutRef.current) clearTimeout(transientMoodTimeoutRef.current);
      if (flightLandTimeoutRef.current) clearTimeout(flightLandTimeoutRef.current);
      if (leanResetTimeoutRef.current) clearTimeout(leanResetTimeoutRef.current);
      if (bubbleAutoHideTimeoutRef.current) clearTimeout(bubbleAutoHideTimeoutRef.current);
    };
  }, []);

  // Natural human-cadence speech streamer with punctuation breathing, syllable lip-sync & voice blips!
  const streamAssistantReply = useCallback(
    (fullText: string) => {
      if (streamTimerRef.current) {
        clearTimeout(streamTimerRef.current);
      }

      const msgId = `ai-${Date.now()}`;
      const isQuestionSentence = fullText.includes('?');
      activeStreamFullTextRef.current = { id: msgId, text: fullText };
      setIsSpeaking(true);
      setSpeechEnergy(0.6);

      setMessages((prev) => [
        ...prev,
        {
          id: msgId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          isStreaming: true,
        },
      ]);

      const baseStep = Math.max(1, Math.min(3, Math.ceil(fullText.length / 130)));
      let cursor = 0;

      const stepSpeech = () => {
        cursor = Math.min(cursor + baseStep, fullText.length);
        const currentSlice = fullText.slice(0, cursor);
        const lastChar = currentSlice[currentSlice.length - 1] || '';
        const finished = cursor >= fullText.length;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId
              ? { ...m, content: currentSlice, isStreaming: !finished }
              : m
          )
        );

        if (finished) {
          streamTimerRef.current = null;
          activeStreamFullTextRef.current = null;
          setIsSpeaking(false);
          setSpeechEnergy(0);
          flashMood('happy', 900);
          return;
        }

        // Compute syllable energy & natural breathing pause on punctuation
        let nextDelay = 24;
        if (lastChar === '.' || lastChar === '!' || lastChar === '?' || lastChar === '\n') {
          nextDelay = 210;
          setSpeechEnergy(0.08);
        } else if (lastChar === ',' || lastChar === ';' || lastChar === ':') {
          nextDelay = 125;
          setSpeechEnergy(0.12);
        } else if (lastChar === ' ') {
          nextDelay = 28;
          setSpeechEnergy(0.28);
        } else {
          const isVowel = VOWEL_REGEX.test(lastChar);
          const energy = isVowel
            ? 0.78 + ((lastChar.charCodeAt(0) % 22) / 100)
            : 0.46 + ((lastChar.charCodeAt(0) % 24) / 100);
          setSpeechEnergy(Math.min(1, energy));
          setSpeechTick((t) => t + 1);

          if (!isMutedRef.current && isVowel) {
            playSyllableBlip(lastChar.charCodeAt(0), isQuestionSentence);
          }
        }

        streamTimerRef.current = setTimeout(stepSpeech, nextDelay);
      };

      streamTimerRef.current = setTimeout(stepSpeech, 60);
    },
    [flashMood]
  );

  // Instant-complete current streaming speech if user clicks the streaming bubble
  const completeActiveStreamImmediately = useCallback(() => {
    const active = activeStreamFullTextRef.current;
    if (!active) return;
    if (streamTimerRef.current) {
      clearTimeout(streamTimerRef.current);
      streamTimerRef.current = null;
    }
    setMessages((prev) =>
      prev.map((m) =>
        m.id === active.id
          ? { ...m, content: active.text, isStreaming: false }
          : m
      )
    );
    activeStreamFullTextRef.current = null;
    setIsSpeaking(false);
    setSpeechEnergy(0);
  }, []);

  const activeMood: MascotMood = (() => {
    if (transientMood === 'error') return 'error';
    if (isLoading) return 'thinking';
    if (isSpeaking) return 'speaking';
    if (isUserTyping && input.trim().length > 0) return 'user-typing';
    if (transientMood) return transientMood;
    if (!isOpen && isPodOrBubbleHovered) return 'happy';
    return 'idle';
  })();

  const statusText = (() => {
    switch (activeMood) {
      case 'error':
        return copy.statusError;
      case 'thinking':
        return copy.statusThinking;
      case 'speaking':
        return copy.statusSpeaking;
      case 'user-typing':
        return copy.statusReading;
      case 'happy':
      case 'greeting':
        return copy.statusHappy;
      default:
        return copy.statusIdle;
    }
  })();

  // Track mobile virtual keyboard via VisualViewport so input always glides above keyboard
  const syncVisualViewport = useCallback(() => {
    if (typeof window === 'undefined') return;
    const vv = window.visualViewport;
    const layoutH = window.innerHeight;
    if (vv) {
      const nextOffset = Math.max(0, Math.round(layoutH - (vv.offsetTop + vv.height)));
      setKeyboardOffset((prev) => (Math.abs(prev - nextOffset) >= 1 ? nextOffset : prev));
      setVisualHeight(Math.round(vv.height));
    } else {
      setKeyboardOffset(0);
      setVisualHeight(layoutH);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setKeyboardOffset(0);
      setIsInputFocused(false);
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

  // Keep conversation scrolled smoothly to latest bubble (including when mobile keyboard opens)
  useEffect(() => {
    if (isOpen && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading, isOpen, keyboardOffset]);

  // Focus input on desktop & speak live welcome greeting on first open!
  useEffect(() => {
    if (!isOpen) return;

    const isMobileTouch =
      typeof window !== 'undefined' &&
      (window.innerWidth < 640 || window.matchMedia('(pointer: coarse)').matches);

    const focusTimer = !isMobileTouch
      ? setTimeout(() => {
          inputRef.current?.focus({ preventScroll: true });
        }, 200)
      : null;

    if (!hasSpokenIntroRef.current) {
      hasSpokenIntroRef.current = true;
      const introTimer = setTimeout(() => {
        streamAssistantReply(copy.welcomeSpeech);
      }, 180);
      return () => {
        if (focusTimer) clearTimeout(focusTimer);
        clearTimeout(introTimer);
      };
    }

    return () => {
      if (focusTimer) clearTimeout(focusTimer);
    };
  }, [isOpen, copy.welcomeSpeech, streamAssistantReply]);

  const sendPrompt = useCallback(
    async (rawText: string) => {
      const trimmed = rawText.trim();
      if (!trimmed || isLoading) return;

      if (isSpeaking) {
        completeActiveStreamImmediately();
      }

      if (!isMutedRef.current) {
        playSendBlip();
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setIsUserTyping(false);

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      try {
        const response = await sendChatMessage({
          message: trimmed,
          session_id: sessionId || undefined,
        });

        if (response.session_id) {
          setSessionId(response.session_id);
        }

        setIsLoading(false);
        streamAssistantReply(response.response);
      } catch {
        setIsLoading(false);
        flashMood('error', 1500);
        setTimeout(() => {
          streamAssistantReply(copy.fallbackOfflineReply);
        }, 380);
      }
    },
    [
      isLoading,
      isSpeaking,
      completeActiveStreamImmediately,
      sessionId,
      streamAssistantReply,
      flashMood,
      copy.fallbackOfflineReply,
    ]
  );

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
    setShowBubble(false);
    if (!isMutedRef.current) {
      playWakeChime();
    }
    setIsOpen(true);
  };

  const handleCloseChat = () => {
    if (isSpeaking) {
      completeActiveStreamImmediately();
    }
    setIsOpen(false);
  };

  const handleDismissBubble = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowBubble(false);
  };

  const handleResetChat = () => {
    if (streamTimerRef.current) {
      clearTimeout(streamTimerRef.current);
      streamTimerRef.current = null;
    }
    activeStreamFullTextRef.current = null;
    setIsSpeaking(false);
    setSpeechEnergy(0);
    setIsLoading(false);
    setSessionId(null);
    setInput('');
    setMessages([]);
    setTimeout(() => {
      streamAssistantReply(copy.welcomeSpeech);
    }, 120);
  };

  const isRightSide = activeCorner.endsWith('right');
  const podFacing: 'left' | 'right' = isRightSide ? 'left' : 'right';
  const currentLine = lines[activeSection];
  const isBubbleVisible = !isFlying && (showBubble || isPodOrBubbleHovered);
  const targetCoords =
    viewport.w > 0
      ? computeCornerCoords(activeCorner, viewport.w, viewport.h)
      : null;

  const isMobileViewport = viewport.w > 0 && viewport.w < 640;
  const effectiveVisualH = visualHeight || viewport.h || 700;
  const isKeyboardVisible =
    isMobileViewport &&
    (keyboardOffset > 70 || (isInputFocused && effectiveVisualH < 520));
  const openStageBottomPx =
    (isMobileViewport ? (isKeyboardVisible ? 10 : 16) : 24) + keyboardOffset;
  const dynamicMessagesMaxH = isMobileViewport
    ? Math.max(96, Math.min(240, effectiveVisualH - (isKeyboardVisible ? 132 : 210)))
    : 265;

  // Show only recent exchanges in the frameless air stream so screen stays clean, while keeping scrollability
  const lastAssistantIdx = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return i;
    }
    return -1;
  })();

  return (
    <>
      {/* 1. CLOSED ROAMING STATE: Silky 3D Corner-Gliding Mascot + Tiny 1-Line Bubble */}
      {hasEntered && targetCoords && !isOpen && (
        <motion.div
          initial={{
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
          className="fixed top-0 left-0 z-50 pointer-events-auto"
        >
          <div
            aria-hidden="true"
            className="absolute -inset-6 rounded-full pointer-events-none -z-10"
            style={{
              background:
                'radial-gradient(circle, rgba(142, 184, 198, 0.24) 0%, rgba(129, 159, 167, 0.08) 50%, transparent 76%)',
              filter: 'blur(9px)',
            }}
          />

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
                    '0 10px 28px rgba(0, 0, 0, 0.72), 0 0 20px rgba(129, 159, 167, 0.14), inset 0 1px 0 rgba(220, 242, 250, 0.22)',
                }}
                className={`group/bubble absolute top-1/2 -translate-y-1/2 ${
                  isRightSide ? 'right-full mr-3' : 'left-full ml-3'
                } w-max max-w-[185px] sm:max-w-[215px] bg-gradient-to-br from-[#242f38]/95 to-[#171e25]/96 hover:from-[#2b3843]/98 hover:to-[#1b232c]/98 backdrop-blur-xl border border-[#9ec3d0]/42 hover:border-[#bee2ef]/65 rounded-xl px-3 py-2 transition-colors cursor-pointer`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-[#1d262e] ${
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

          <VisorPodMascot
            size="lg"
            mood={activeMood}
            facing={podFacing}
            isFlying={isFlying}
            enableCursorTracking
            showShadow
            onClick={handleOpenChat}
            ariaLabel={copy.openChat}
          />
        </motion.div>
      )}

      {/* 2. OPEN CONVERSATION STATE: STİL 1 — FRAMELESS FLOATING COMPANION STAGE! */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{
              bottom: `${openStageBottomPx}px`,
              transition: 'bottom 0.18s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
            className={`fixed ${
              isRightSide ? 'right-3.5 sm:right-6 items-end' : 'left-3.5 sm:left-6 items-start'
            } z-[70] w-[calc(100vw-1.75rem)] sm:w-[372px] flex flex-col ${
              isKeyboardVisible ? 'gap-2' : 'gap-2.5'
            } pointer-events-none`}
          >
            {/* Soft Open-Air Atmospheric Stage Glow */}
            <div
              aria-hidden="true"
              className={`absolute -bottom-8 ${
                isRightSide ? '-right-8' : '-left-8'
              } w-72 h-72 rounded-full pointer-events-none -z-10`}
              style={{
                background:
                  'radial-gradient(circle, rgba(142, 188, 204, 0.22) 0%, rgba(129, 159, 167, 0.06) 52%, transparent 75%)',
                filter: 'blur(16px)',
              }}
            />

            {/* A. Floating Mini Status & Controls Pill */}
            <div
              className={`pointer-events-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#172028]/88 backdrop-blur-xl border border-[#9ec3d0]/32 shadow-[0_8px_24px_rgba(0,0,0,0.6)]`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  activeMood === 'error'
                    ? 'bg-amber-400'
                    : activeMood === 'speaking' ||
                        activeMood === 'thinking' ||
                        activeMood === 'user-typing'
                      ? 'bg-[#d6f3fc] animate-ping'
                      : 'bg-[#9ec3d0]'
                }`}
              />
              <span className="text-[11px] font-medium text-[#bed9e4] pr-1 select-none">
                {statusText}
              </span>

              <div className="h-3 w-px bg-[#9ec3d0]/20" />

              <button
                type="button"
                onClick={toggleMute}
                title={copy.muteToggle}
                aria-label={copy.muteToggle}
                style={{ outline: 'none' }}
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
                title={copy.clearChat}
                aria-label={copy.clearChat}
                style={{ outline: 'none' }}
                className="p-1 rounded-full text-[#9ebbc7]/70 hover:text-[#f3f8fb] transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={handleCloseChat}
                title={copy.closeChat}
                aria-label={copy.closeChat}
                style={{ outline: 'none' }}
                className="p-1 rounded-full text-[#9ebbc7]/70 hover:text-[#f3f8fb] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* B. Open-Air Floating Speech Bubbles Stream (Top-Faded, Zero Scrollbar!) */}
            <div
              ref={messagesContainerRef}
              style={{
                maxHeight: `${dynamicMessagesMaxH}px`,
                maskImage:
                  messages.length > 2
                    ? 'linear-gradient(to bottom, transparent 0%, black 16%, black 100%)'
                    : undefined,
                WebkitMaskImage:
                  messages.length > 2
                    ? 'linear-gradient(to bottom, transparent 0%, black 16%, black 100%)'
                    : undefined,
              }}
              className="pointer-events-auto w-full overflow-y-auto overscroll-contain mascot-no-scrollbar flex flex-col gap-2.5 pt-2 pb-1.5 px-1"
            >
              {messages.map((message, idx) => {
                const isUser = message.role === 'user';
                const isLatestAssistant = !isUser && idx === lastAssistantIdx;

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex w-full ${
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
                      onClick={
                        message.isStreaming ? completeActiveStreamImmediately : undefined
                      }
                      style={
                        isUser
                          ? {
                              boxShadow: '0 10px 26px rgba(0, 0, 0, 0.55)',
                            }
                          : {
                              boxShadow:
                                '0 14px 36px rgba(0, 0, 0, 0.76), 0 0 24px rgba(138, 184, 198, 0.14), inset 0 1px 0 rgba(224, 244, 252, 0.22)',
                            }
                      }
                      className={`relative max-w-[88%] px-4 py-2.5 rounded-2xl text-[12.5px] sm:text-[13px] leading-[1.48] ${
                        isUser
                          ? 'bg-gradient-to-br from-[#9abcc8]/95 to-[#6b848d]/95 text-[#090c10] font-medium backdrop-blur-xl'
                          : `bg-gradient-to-br from-[#232e38]/95 to-[#151c23]/97 text-[#f2f7fa] border ${
                              message.isStreaming
                                ? 'border-[#bae2f0]/60 cursor-pointer'
                                : 'border-[#9ec3d0]/40'
                            } backdrop-blur-2xl`
                      }`}
                    >
                      {/* Speech Pointer Tail Connecting Latest Bubble Directly To Mascot Below! */}
                      {isLatestAssistant && !isLoading && (
                        <span
                          aria-hidden="true"
                          className={`absolute -bottom-[5px] ${
                            isRightSide ? 'right-8' : 'left-8'
                          } w-2.5 h-2.5 rotate-45 bg-[#161d24] border-b border-r ${
                            message.isStreaming
                              ? 'border-[#bae2f0]/60'
                              : 'border-[#9ec3d0]/40'
                          }`}
                        />
                      )}

                      <p className="whitespace-pre-wrap">
                        {message.content}
                        {message.isStreaming && (
                          <span className="inline-block w-1.5 h-3.5 ml-1 align-middle bg-[#d6f3fc] animate-pulse rounded-xs" />
                        )}
                      </p>
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
                        '0 12px 28px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(220, 242, 250, 0.2)',
                    }}
                    className="relative bg-gradient-to-br from-[#232e38]/95 to-[#151c23]/97 border border-[#9ec3d0]/42 backdrop-blur-2xl px-4 py-3 rounded-2xl flex items-center gap-1.5"
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute -bottom-[5px] ${
                        isRightSide ? 'right-7' : 'left-7'
                      } w-2.5 h-2.5 rotate-45 bg-[#161d24] border-b border-r border-[#9ec3d0]/42`}
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

            {/* C. Bottom Companion Stage: Full-Size Open-Air Visor Pod + Single-Piece Floating Input Capsule */}
            <div
              className={`pointer-events-auto w-full flex items-center gap-2.5 ${
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
                    '0 14px 36px rgba(0, 0, 0, 0.78), 0 0 22px rgba(129, 159, 167, 0.12), inset 0 1px 0 rgba(224, 244, 252, 0.2)',
                }}
                className="flex-1 min-w-0 flex items-center gap-1.5 bg-gradient-to-br from-[#202a33]/94 to-[#141a21]/97 backdrop-blur-2xl border border-[#9ec3d0]/42 focus-within:border-[#c6ebf7]/75 rounded-2xl pl-3.5 pr-1.5 py-1.5 transition-colors"
              >
                <input
                  ref={inputRef}
                  type="text"
                  enterKeyHint="send"
                  value={input}
                  onChange={handleInputChange}
                  onFocus={() => {
                    setIsInputFocused(true);
                    syncVisualViewport();
                    setTimeout(syncVisualViewport, 110);
                    setTimeout(syncVisualViewport, 280);
                  }}
                  onBlur={() => {
                    setIsUserTyping(false);
                    setIsInputFocused(false);
                    setTimeout(syncVisualViewport, 120);
                  }}
                  placeholder={copy.inputPlaceholder}
                  disabled={isLoading}
                  style={{ outline: 'none', boxShadow: 'none' }}
                  className="flex-1 min-w-0 bg-transparent border-none text-base sm:text-[13px] text-[#f5f9fc] placeholder-[#9ab3be]/55 outline-none focus:outline-none focus:ring-0 disabled:opacity-50 py-1"
                />
                <button
                  type="submit"
                  onMouseDown={(e) => e.preventDefault()}
                  disabled={!input.trim() || isLoading}
                  aria-label="Send"
                  style={{ outline: 'none' }}
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
                  size={isKeyboardVisible ? 'md' : 'xl'}
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
        )}
      </AnimatePresence>
    </>
  );
}
