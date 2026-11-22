'use client';

import {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {useLocale} from 'next-intl';
import {ChatApiError, resetChatSession, sendChatMessage} from '@/lib/api';

export interface Message { id: string; role: 'user' | 'assistant'; content: string }
interface ChatState {
  messages: Message[]; isLoading: boolean; isResetting: boolean; error: string | null;
  send: (text: string, retry?: boolean) => Promise<void>; retry: () => void; stop: () => void;
  clear: () => Promise<void>; announcement: string; canRetry: boolean;
}
const ChatContext = createContext<ChatState | null>(null);

const errors = {
  tr: {
    usage_limit: 'İstek sınırına ulaşıldı. Biraz sonra tekrar deneyebilirsiniz.',
    daily_limit: 'Asistanın günlük kullanım sınırına ulaşıldı. Daha sonra tekrar deneyebilir veya e-posta ile ulaşabilirsiniz.',
    provider_rate_limited: 'AI servisinin kullanım sınırına ulaşıldı. Biraz sonra tekrar deneyin.',
    timeout: 'Yanıt beklenenden uzun sürdü. Tekrar deneyebilirsiniz.',
    session_expired: 'Sohbet oturumunun süresi doldu. Son sorunuzu yeniden göndererek başlayabilirsiniz.',
    conversation_busy: 'Bu sohbet için bir yanıt zaten hazırlanıyor.',
    invalid_message: 'Lütfen 1–2.000 karakter arasında bir soru yazın.',
    stopped: 'Yanıt isteği durduruldu.',
    reset_failed: 'Sohbeti sıfırlama işlemi tamamlanamadı. Lütfen tekrar deneyin.',
    service_unavailable: 'AI servisi şu anda yanıt veremiyor. Tekrar deneyebilir veya e-posta ile ulaşabilirsiniz.',
    network: 'Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.',
    answer_incomplete: 'Yanıt tamamlanamadı. Soruyu daraltarak tekrar deneyebilirsiniz.',
  },
  en: {
    usage_limit: 'Request limit reached. Please try again shortly.',
    daily_limit: 'The assistant has reached its daily limit. Please try later or get in touch by email.',
    provider_rate_limited: 'The AI service has reached its usage limit. Please try again shortly.',
    timeout: 'The response took too long. You can try again.',
    session_expired: 'Your conversation expired. Resend your last question to start again.',
    conversation_busy: 'A response is already being prepared for this conversation.',
    invalid_message: 'Please enter a question between 1 and 2,000 characters.',
    stopped: 'Response request stopped.',
    reset_failed: 'The conversation could not be fully reset. Please try again.',
    service_unavailable: 'The AI service cannot respond right now. Try again or get in touch by email.',
    network: 'Could not connect. Check your internet connection and try again.',
    answer_incomplete: 'The response could not be completed. Try a more specific question.',
  },
};

export function ChatProvider({children}: {children: React.ReactNode}) {
  const locale = useLocale() === 'en' ? 'en' : 'tr';
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [isResetting, setResetting] = useState(false);
  const [errorCode, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [retryAfter, setRetryAfter] = useState(0);
  const [lastQuestion, setLastQuestion] = useState('');
  const session = useRef<string | null>(null);
  const owner = useRef('');
  const controller = useRef<AbortController | null>(null);
  const revision = useRef(0);
  const resetting = useRef(false);
  const retryDeadline = useRef(0);
  const getOwner = () => {
    if (!owner.current) owner.current = Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('');
    return owner.current;
  };

  useEffect(() => () => { revision.current++; controller.current?.abort(); }, []);
  useEffect(() => {
    if (!retryAfter) return;
    const timer = setInterval(() => setRetryAfter(Math.max(0, Math.ceil((retryDeadline.current-Date.now())/1000))), 1000);
    return () => clearInterval(timer);
  }, [retryAfter]);

  const stop = useCallback(() => {
    revision.current++;
    controller.current?.abort();
    controller.current = null;
    setLoading(false);
    setError('stopped');
  }, []);

  const send = useCallback(async (text: string, retry = false) => {
    const question = text.trim();
    if (!question || controller.current || resetting.current || Date.now() < retryDeadline.current) return;
    if (question.length > 2000) { setError('invalid_message'); return; }
    const current = new AbortController();
    const version = ++revision.current;
    controller.current = current;
    setLoading(true); setError(null); setLastQuestion(question); setAnnouncement('');
    if (!retry) setMessages(previous => [...previous, {id: crypto.randomUUID(), role: 'user', content: question}].slice(-40) as Message[]);
    let timedOut = false;
    const timeout = setTimeout(() => {timedOut = true; current.abort();}, 25000);
    try {
      const result = await sendChatMessage({message: question, session_id: session.current || undefined, locale}, getOwner(), current.signal);
      if (version !== revision.current) return;
      session.current = result.session_id;
      setMessages(previous => [...previous, {id:crypto.randomUUID(), role:'assistant', content:result.response}].slice(-40) as Message[]);
      setAnnouncement(result.response);
      setLastQuestion('');
    } catch (error) {
      if (version !== revision.current) return;
      const code = timedOut ? 'timeout' : error instanceof ChatApiError ? error.code : 'network';
      if (code === 'session_expired') session.current = null;
      if (error instanceof ChatApiError && error.retryAfter) {
        retryDeadline.current = Date.now() + error.retryAfter*1000;
        setRetryAfter(error.retryAfter);
      }
      setError(code);
    } finally {
      clearTimeout(timeout);
      if (version === revision.current) { controller.current = null; setLoading(false); }
    }
  }, [locale]);

  const clear = useCallback(async () => {
    if (resetting.current) return;
    resetting.current = true; setResetting(true);
    revision.current++; controller.current?.abort(); controller.current = null;
    const previousSession = session.current;
    session.current = null;
    setMessages([]); setLoading(false); setError(null); setLastQuestion(''); setAnnouncement('');
    try { await resetChatSession(previousSession, getOwner()); }
    catch { setError('reset_failed'); }
    finally { resetting.current = false; setResetting(false); }
  }, []);

  const dictionary = errors[locale];
  const wait = retryAfter < 60 ? `${retryAfter}s` : retryAfter < 3600 ? `${Math.ceil(retryAfter/60)} ${locale === 'tr' ? 'dk' : 'min'}` : `${Math.ceil(retryAfter/3600)} ${locale === 'tr' ? 'saat' : 'h'}`;
  const error = errorCode ? (dictionary[errorCode as keyof typeof dictionary] || dictionary.service_unavailable) + (retryAfter ? ` (${wait})` : '') : null;
  return <ChatContext.Provider value={{messages, isLoading, isResetting, error, send, retry: () => {if (errorCode === 'reset_failed') void clear(); else void send(lastQuestion, true);}, stop, clear, announcement, canRetry:(!!lastQuestion || errorCode === 'reset_failed') && !isLoading && !isResetting && retryAfter === 0}}>
    {children}
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{isLoading ? (locale === 'en' ? 'Preparing a response.' : 'Yanıt hazırlanıyor.') : announcement}</div>
    <div className="sr-only" role="alert">{error}</div>
  </ChatContext.Provider>;
}

export function useChat() {
  const chat = useContext(ChatContext);
  if (!chat) throw new Error('ChatProvider is required');
  return chat;
}
