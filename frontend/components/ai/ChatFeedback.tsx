'use client';

import {useLocale} from 'next-intl';
import {useChat} from './ChatProvider';

export default function ChatFeedback({compact = false}: {compact?: boolean}) {
  const en = useLocale() === 'en';
  const {error, isLoading, isResetting, stop, canRetry, retry} = useChat();
  return <div className={`mt-3 space-y-2 ${compact ? 'text-xs' : 'text-sm'} chat-assistant-copy`}>
    {error && <p className="text-red-300 portfolio-light:text-red-800">{error}</p>}
    <div className="flex flex-wrap items-center gap-4">
      {isLoading && <button type="button" onClick={stop} className="underline underline-offset-4">{en ? 'Stop response' : 'Yanıtı durdur'}</button>}
      {canRetry && <button type="button" onClick={retry} className="underline underline-offset-4">{en ? 'Try again' : 'Tekrar dene'}</button>}
      {error && <a href="mailto:contact@durangezer.com" className="underline underline-offset-4">{en ? 'Contact by email' : 'E-posta ile ulaş'}</a>}
      {isResetting && <span>{en ? 'Clearing conversation…' : 'Sohbet temizleniyor…'}</span>}
    </div>
  </div>;
}
