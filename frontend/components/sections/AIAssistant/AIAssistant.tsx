"use client";

import { motion } from 'framer-motion';
import { Loader2, ArrowRight, RotateCcw } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import SectionReveal from '@/components/animations/SectionReveal';
import ChatMessageContent from '@/components/ui/ChatMessageContent';
import {useChat} from '@/components/ai/ChatProvider';
import ChatFeedback from '@/components/ai/ChatFeedback';

export default function AIAssistant() {
  const t = useTranslations('aiAssistant');
  const locale = useLocale();
  const {messages, isLoading, isResetting, send, clear} = useChat();
  const stickToBottom = useRef(true);
  const [input, setInput] = useState('');
  const [serviceStatus, setServiceStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    let disposed = false;
    let controller: AbortController | null = null;

    const checkService = async () => {
      if (document.visibilityState === 'hidden') return;
      controller?.abort();
      const current = new AbortController();
      controller = current;
      const timeout = setTimeout(() => current.abort(), 5000);
      try {
        const response = await fetch(`${API_URL}/health`, { signal: current.signal, cache: 'no-store' });
        const available = response.ok && (await response.json()).status === 'healthy';
        if (!disposed && controller === current) setServiceStatus(available ? 'available' : 'unavailable');
      } catch {
        if (!disposed && controller === current) setServiceStatus('unavailable');
      } finally {
        clearTimeout(timeout);
      }
    };

    void checkService();
    const interval = setInterval(checkService, 60000);
    document.addEventListener('visibilitychange', checkService);
    return () => {
      disposed = true;
      controller?.abort();
      clearInterval(interval);
      document.removeEventListener('visibilitychange', checkService);
    };
  }, [API_URL]);

  const features = [
    { title: t('features.realtime.title'), desc: t('features.realtime.desc') },
    { title: t('features.context.title'), desc: t('features.context.desc') },
    { title: t('features.learning.title'), desc: t('features.learning.desc') }
  ];

  useEffect(() => {
    if (chatContainerRef.current && stickToBottom.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
    }
  }, [messages, isLoading]);

  const sendMessage = (text: string) => {
    if (!text.trim() || isLoading || isResetting) return;
    stickToBottom.current = true;
    setInput('');
    void send(text).then(() => {
      if (document.activeElement === document.body || document.querySelector('#ai-assistant')?.contains(document.activeElement)) inputRef.current?.focus({preventScroll: true});
    });
  };
  const handleSubmit = (event: React.FormEvent) => {event.preventDefault(); sendMessage(input);};
  const handleClear = () => {setInput(''); void clear();};

  return (
    <section id="ai-assistant" className="relative md:min-h-screen flex flex-col justify-center py-20 sm:py-24 md:py-28 lg:py-32 px-4 md:px-6 bg-[#0d0d0d] portfolio-light:bg-paper content-visibility-auto">
      <div className="relative z-10 max-w-[1100px] w-full mx-auto md:my-auto">
        {/* Bölüm Başlığı (Editoryal, Sol Hizalı) */}
        <SectionReveal delay={0}>
          <div className="mb-6 sm:mb-10">
            <div className="font-mono text-xs sm:text-xs font-medium tracking-normal text-[#819fa7] portfolio-light:text-ink-accent normal-case mb-1.5 sm:mb-2 flex items-center gap-2">
              <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${
                serviceStatus === 'available'
                  ? 'bg-emerald-400 portfolio-light:bg-emerald-700'
                  : serviceStatus === 'unavailable'
                    ? 'bg-amber-400 portfolio-light:bg-amber-700'
                    : 'bg-white/40 portfolio-light:bg-ink-muted'
              }`} />
              <span role="status" data-service-status={serviceStatus}>{t('badge')} · {t(`serviceStatus.${serviceStatus}`)}</span>
            </div>
            <h2 className="text-2xl sm:text-5xl md:text-[54px] font-display font-semibold text-[#f3f5f9] portfolio-light:text-ink tracking-tight leading-[1.1] mb-2 sm:mb-3">
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
                  <span className="font-mono text-xs text-[#819fa7] portfolio-light:text-ink-accent normal-case tracking-normal">
                    {locale === 'tr' ? 'Sohbet Geçmişi' : 'Conversation'}
                  </span>
                  <button
                    onClick={handleClear}
                    disabled={isResetting}
                    className="flex items-center gap-1.5 text-xs font-mono text-white/40 portfolio-light:text-ink-muted hover:text-white portfolio-light:hover:text-ink transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{locale === 'tr' ? 'Temizle' : 'Clear'}</span>
                  </button>
                </div>

                <div ref={chatContainerRef} role="region" aria-label={locale === 'tr' ? 'Sohbet mesajları' : 'Conversation messages'} onScroll={(event) => {const el = event.currentTarget; stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 64;}} className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
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


                </div>
              </div>
            )}

            {/* Sade ve Şık Tek Satır Giriş Alanı */}
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative flex items-center rounded-2xl bg-white/[0.02] portfolio-light:bg-paper-raised border border-white/10 portfolio-light:border-paper-line hover:border-white/20 portfolio-light:hover:border-paper-line-strong focus-within:border-white/30 portfolio-light:focus-within:border-paper-line-strong focus-within:bg-white/[0.04] portfolio-light:focus-within:bg-paper-tint transition-all p-2 sm:p-2.5">
                <input
                  ref={inputRef}
                  type="text"
                  maxLength={2000}
                  enterKeyHint="send"
                  aria-label={locale === 'tr' ? 'Duran hakkında sorunuz' : 'Your question about Duran'}
                  aria-describedby="ai-input-help"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    locale === 'tr'
                      ? 'Aklınızdaki soruyu yazın ve Enter\'a basın...'
                      : 'Ask anything and press Enter...'
                  }
                  disabled={isLoading || isResetting}
                  style={{ outline: 'none', boxShadow: 'none' }}
                  className="flex-1 min-w-0 bg-transparent px-4 py-2 text-base sm:text-[15px] text-[#f3f5f9] portfolio-light:text-ink placeholder:text-white/30 portfolio-light:placeholder:text-ink-muted outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 ring-0 border-none shadow-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || isResetting || !input.trim()}
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
            <p id="ai-input-help" className="mt-2 text-xs text-white/50 portfolio-light:text-ink-muted">{input.length}/2000</p>
            <ChatFeedback />
            {messages.length === 0 && <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm text-[#819fa7] portfolio-light:text-ink-accent">
              {(locale === 'en' ? ['What are his current projects?', 'How does AskDocs work?', 'Where can I find his CV?'] : ['Güncel projeleri neler?', 'AskDocs nasıl çalışıyor?', 'CV bağlantısı nedir?']).map(question => <button type="button" key={question} disabled={isLoading || isResetting} onClick={() => sendMessage(question)} className="underline underline-offset-4">{question}</button>)}
            </div>}
          </div>
        </SectionReveal>

        {/* Features stack on mobile so titles and descriptions remain readable. */}
        <SectionReveal delay={0.25}>
          <div className="mt-8 sm:mt-16 pt-5 sm:pt-8 border-t border-white/10 portfolio-light:border-paper-line grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, idx) => (
              <div key={feature.title} className="flex flex-col min-w-0">
                <span className="font-mono text-xs font-medium text-[#819fa7] portfolio-light:text-ink-accent mb-1 sm:mb-2 select-none">
                  0{idx + 1}
                </span>
                <h4 className="text-sm sm:text-base font-display font-semibold text-[#f3f5f9] portfolio-light:text-ink mb-1 sm:mb-1.5 leading-snug whitespace-normal">
                  {feature.title}
                </h4>
                <p className="text-sm sm:text-[13.5px] leading-relaxed text-white/60 portfolio-light:text-ink-muted">
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
