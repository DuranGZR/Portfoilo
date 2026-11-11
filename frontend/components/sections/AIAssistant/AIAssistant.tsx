"use client";

import { motion } from 'framer-motion';
import { Send, Loader2, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import SectionReveal from '@/components/animations/SectionReveal';
import ChatMessageContent from '@/components/ui/ChatMessageContent';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistant() {
  const t = useTranslations('aiAssistant');
  const locale = useLocale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  const features = [
    { title: t('features.realtime.title'), desc: t('features.realtime.desc') },
    { title: t('features.context.title'), desc: t('features.context.desc') },
    { title: t('features.learning.title'), desc: t('features.learning.desc') }
  ];

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText.trim(),
          session_id: sessionId
        }),
      });

      if (!response.ok) {
        throw new Error('Sunucu hatası');
      }

      const data = await response.json();

      if (data.session_id) {
        setSessionId(data.session_id);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(
        locale === 'tr'
          ? 'Bağlantı hatası: Backend servisine ulaşılamadı.'
          : 'Connection error: Could not reach backend service.'
      );
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus({ preventScroll: true });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleClear = () => {
    setMessages([]);
    setError(null);
    setSessionId(null);
    setInput('');
  };

  return (
    <section id="ai-assistant" className="relative md:min-h-screen flex flex-col justify-center py-20 sm:py-24 md:py-28 lg:py-32 px-4 md:px-6 bg-[#0d0d0d] portfolio-light:bg-paper content-visibility-auto">
      {/* Monokrom Degrade Arka Plan */}
      <div className="portfolio-section-backdrop absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a] pointer-events-none" />

      <div className="relative z-10 max-w-[1100px] w-full mx-auto md:my-auto">
        {/* Bölüm Başlığı (Editoryal, Sol Hizalı) */}
        <SectionReveal delay={0}>
          <div className="mb-6 sm:mb-10">
            <div className="font-mono text-[11px] sm:text-xs font-semibold tracking-[0.2em] text-[#819fa7] portfolio-light:text-ink-accent uppercase mb-1.5 sm:mb-2 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 portfolio-light:bg-emerald-600 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 portfolio-light:bg-emerald-600" />
              </span>
              {t('badge')}
            </div>
            <h2 className="text-2xl sm:text-5xl md:text-[54px] font-display font-extrabold text-[#f3f5f9] portfolio-light:text-ink tracking-tight leading-[1.1] mb-2 sm:mb-3">
              {t('title')}
            </h2>
            <p className="text-xs sm:text-[15px] leading-relaxed sm:leading-[1.8] text-white/60 portfolio-light:text-ink-muted max-w-[680px]">
              {t('subtitle')}
            </p>
          </div>
        </SectionReveal>

        {/* Ultra Sade AI Etkileşim Alanı (Kutusuz, Fazlalıksız) */}
        <SectionReveal delay={0.15}>
          <div className="max-w-[760px]">
            {/* Sohbet Geçmişi (Yalnızca mesaj varken görünür) */}
            {messages.length > 0 && (
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 portfolio-light:border-paper-line">
                  <span className="font-mono text-xs text-[#819fa7] portfolio-light:text-ink-accent uppercase tracking-wider">
                    {locale === 'tr' ? 'Sohbet Geçmişi' : 'Conversation'}
                  </span>
                  <button
                    onClick={handleClear}
                    className="flex items-center gap-1.5 text-xs font-mono text-white/40 portfolio-light:text-ink-muted hover:text-white portfolio-light:hover:text-ink transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{locale === 'tr' ? 'Temizle' : 'Clear'}</span>
                  </button>
                </div>

                <div ref={chatContainerRef} className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[85%] px-4 py-3 rounded-2xl text-[14.5px] leading-relaxed ${
                          message.role === 'user'
                            ? 'bg-white/10 portfolio-light:bg-paper-selected border border-white/15 portfolio-light:border-paper-line text-[#f3f5f9] portfolio-light:text-ink rounded-tr-sm'
                            : 'bg-white/[0.03] portfolio-light:bg-paper-raised border border-white/10 portfolio-light:border-paper-line text-white/90 portfolio-light:text-ink rounded-tl-sm'
                        }`}
                      >
                        <ChatMessageContent
                          className={message.role === 'assistant' ? 'chat-assistant-copy' : undefined}
                          content={message.content}
                          isUser={message.role === 'user'}
                        />
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2.5 px-4 py-3 rounded-2xl rounded-tl-sm bg-white/[0.03] portfolio-light:bg-paper-raised border border-white/10 portfolio-light:border-paper-line max-w-[200px]"
                    >
                      <Loader2 className="w-3.5 h-3.5 text-[#819fa7] portfolio-light:text-ink-accent animate-spin" />
                      <span className="text-xs font-mono text-white/50 portfolio-light:text-ink-muted tracking-wider">
                        {locale === 'tr' ? 'Düşünüyor...' : 'Thinking...'}
                      </span>
                    </motion.div>
                  )}

                  {error && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 portfolio-light:text-red-800 text-xs">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sade ve Şık Tek Satır Giriş Alanı */}
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative flex items-center rounded-2xl bg-white/[0.02] portfolio-light:bg-paper-raised border border-white/10 portfolio-light:border-paper-line hover:border-white/20 portfolio-light:hover:border-paper-line-strong focus-within:border-white/30 portfolio-light:focus-within:border-paper-line-strong focus-within:bg-white/[0.04] portfolio-light:focus-within:bg-paper-tint transition-all p-2 sm:p-2.5">
                <div className="pl-3 pr-2 text-[#819fa7] portfolio-light:text-ink-accent">
                  <Sparkles className="w-4 h-4" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    locale === 'tr'
                      ? 'Aklınızdaki soruyu yazın ve Enter\'a basın...'
                      : 'Ask anything and press Enter...'
                  }
                  disabled={isLoading}
                  style={{ outline: 'none', boxShadow: 'none' }}
                  className="flex-1 bg-transparent px-2 py-2 text-base sm:text-[15px] text-[#f3f5f9] portfolio-light:text-ink placeholder:text-white/30 portfolio-light:placeholder:text-ink-muted outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 ring-0 border-none shadow-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  aria-label={t('sendButton')}
                  className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-white portfolio-light:paper-action text-black portfolio-light:text-paper-raised font-semibold text-xs sm:text-sm hover:bg-white/90 portfolio-light:hover:brightness-110 active:scale-95 transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center gap-2 shrink-0 shadow-sm"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-black portfolio-light:text-paper-raised" />
                  ) : (
                    <>
                      <span className="hidden sm:inline">{locale === 'tr' ? 'Sor' : 'Ask'}</span>
                      <ArrowRight className="w-4 h-4 text-black portfolio-light:text-paper-raised" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </SectionReveal>

        {/* 3 Özellik - Yatay Düzen (Mobilde ve Masaüstünde 3 Sütun Yan Yana Sığacak Şekilde) */}
        <SectionReveal delay={0.25}>
          <div className="mt-8 sm:mt-16 pt-5 sm:pt-8 border-t border-white/10 portfolio-light:border-paper-line grid grid-cols-3 gap-2.5 sm:gap-8">
            {features.map((feature, idx) => (
              <div key={feature.title} className="flex flex-col min-w-0">
                <span className="font-mono text-[10px] sm:text-xs font-semibold text-[#819fa7] portfolio-light:text-ink-accent tracking-widest mb-1 sm:mb-2 select-none">
                  0{idx + 1}
                </span>
                <h4 className="text-[11.5px] sm:text-base font-display font-bold text-[#f3f5f9] portfolio-light:text-ink mb-1 sm:mb-1.5 leading-tight sm:leading-snug truncate sm:whitespace-normal">
                  {feature.title}
                </h4>
                <p className="text-[10.5px] sm:text-[13.5px] leading-snug sm:leading-relaxed text-white/50 portfolio-light:text-ink-muted line-clamp-3 sm:line-clamp-none">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
