"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Code2, FlaskConical, Rocket } from 'lucide-react';
import { useTranslations, useMessages, useLocale } from 'next-intl';
import SectionReveal from '@/components/animations/SectionReveal';

// Exact transform coordinates matching Richard Miculob's portfolio card stack
const CARD_POSITIONS = [
  { tx: 6, ty: -4, rot: -7, sc: 1, op: 1, z: 30 },
  { tx: 2, ty: 11, rot: 10, sc: 0.955, op: 0.7, z: 20 },
  { tx: 30, ty: 22, rot: -13, sc: 0.91, op: 0.55, z: 10 },
  { tx: 134, ty: -67, rot: 43, sc: 0.85, op: 0, z: 5 },
];

const FALLBACK_TRAITS = [
  "Problem Solver",
  "Detail-Oriented",
  "Reliable",
  "Continuous Learner",
  "User-Focused",
  "Analytical Thinker",
  "Open to Feedback"
];

export default function About() {
  const t = useTranslations('about');
  const locale = useLocale();
  const messages = useMessages() as any;
  const activeCvHref =
    locale === 'en' ? '/cv/Duran_Gezer_CV_EN.pdf' : '/cv/Duran_Gezer_CV_TR.pdf';

  // Localized traits array from i18n messages
  const traits: string[] = messages?.about?.traits?.items || FALLBACK_TRAITS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextCard = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % traits.length);
  }, [traits.length]);

  // Auto-rotate every 3 seconds
  useEffect(() => {
    timerRef.current = setInterval(nextCard, 3000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nextCard]);

  // Click to cycle immediately and reset auto-timer
  const handleStackClick = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(nextCard, 3000);
    }
    nextCard();
  };

  return (
    <section id="about" className="relative md:min-h-screen flex flex-col justify-center py-20 sm:py-24 md:py-28 lg:py-32 px-4 md:px-6 bg-[#0d0d0d] content-visibility-auto">
      {/* Eski orijinal temiz arka plan (Koyu degrade) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d] to-[#0a0a0a]" />

      <div className="relative z-10 max-w-[1100px] w-full mx-auto md:my-auto">
        {/* Section Label + Title (Dile göre dinamik: TR'de HAKKIMDA, EN'de ABOUT ME) */}
        <SectionReveal delay={0}>
          <div className="mb-8">
            <div className="font-mono text-xs font-semibold tracking-[0.2em] text-[#819fa7] uppercase mb-2">
              {t('badge')}
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-[54px] font-display font-extrabold text-[#f3f5f9] tracking-tight leading-[1.08]">
              {t('headline')}
            </h2>
          </div>
        </SectionReveal>

        {/* Profile Card Layout: Sol tarafta Profil Resmi, Sağ tarafta İsim + Sayaçlar + Bio */}
        <SectionReveal delay={0.12}>
          <div className="flex flex-col sm:flex-row items-start gap-6 md:gap-7">
          {/* Avatar (120x120px tam yuvarlak profil çerçevesi) */}
          <div className="shrink-0">
            <div className="w-[120px] h-[120px] rounded-full overflow-hidden border border-white/10 bg-[#161616] relative flex items-center justify-center">
              {!imgFailed ? (
                <img
                  src="/profilFoto.jpg"
                  alt={t('name')}
                  onError={() => setImgFailed(true)}
                  className="w-full h-full object-cover select-none pointer-events-none"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a2327] to-[#0f1416] text-[#819fa7] select-none">
                  <span className="font-display font-bold text-3xl tracking-wider text-gradient">
                    DG
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Info (İsim, Mavi Rozet, Sayaçlar ve Biyografi) */}
          <div className="flex-1 flex flex-col gap-2">
            {/* İsim + Mavi Onay Rozeti (Verified Badge) */}
            <div className="inline-flex items-center gap-2 text-xl font-bold text-[#f3f5f9] tracking-tight font-display">
              <span>{t('name')}</span>
              <svg className="w-5 h-5 text-[#3b82f6] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>

            {/* Quick Stats: PROJECTS | CERTIFICATES | GRADUATED */}
            <div className="flex flex-row items-center gap-8 mt-1">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[11px] font-semibold text-white/40 tracking-[0.15em] uppercase">
                  {t('stats.projectsLabel')}
                </span>
                <span className="text-base font-bold text-[#f3f5f9] leading-tight">
                  {t('stats.projectsValue')}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[11px] font-semibold text-white/40 tracking-[0.15em] uppercase">
                  {t('stats.certsLabel')}
                </span>
                <span className="text-base font-bold text-[#f3f5f9] leading-tight">
                  {t('stats.certsValue')}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[11px] font-semibold text-white/40 tracking-[0.15em] uppercase">
                  {t('stats.gradLabel')}
                </span>
                <span className="text-base font-bold text-[#f3f5f9] leading-tight">
                  {t('stats.gradValue')}
                </span>
              </div>
            </div>

            {/* Description Paragraph */}
            <div className="text-[15px] leading-[1.8] text-white/60 mt-3 space-y-4 max-w-[950px]">
              <p>
                {t('bio')}
              </p>
              <p>
                {t('resumeCta')}{' '}
                <a
                  href={activeCvHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-semibold underline underline-offset-4 hover:opacity-75 transition-opacity"
                >
                  {t('resumeLink')}
                </a>{' '}
                <span className="text-xs font-mono text-white/40">
                  (
                  <a
                    href="/cv/Duran_Gezer_CV_TR.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    TR
                  </a>
                  {' · '}
                  <a
                    href="/cv/Duran_Gezer_CV_EN.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    EN
                  </a>
                  )
                </span>
                .
              </p>
            </div>
          </div>
        </div>
        </SectionReveal>

        {/* Alt Satır: CURRENTLY (Sol) ve INTERACTIVE CARD STACK (Sağ) */}
        <SectionReveal delay={0.24}>
          <div className="mt-8 pt-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Sol Taraf: CURRENTLY Strip */}
          <div className="flex flex-col gap-3">
            <div className="font-mono text-[11px] font-medium tracking-[0.12em] text-white/40 uppercase">
              {t('currently.title')}
            </div>
            <div className="flex flex-wrap items-center gap-6 sm:gap-7">
              {/* Building */}
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1a1a1a] border border-white/10 text-[#f3f5f9] shrink-0">
                  <Code2 className="w-4 h-4 text-[#819fa7]" />
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#f3f5f9] leading-tight">
                    {t('currently.buildingLabel')}
                  </span>
                  <span className="text-xs text-white/40 leading-tight">
                    {t('currently.buildingDesc')}
                  </span>
                </div>
              </div>

              {/* Exploring */}
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1a1a1a] border border-white/10 text-[#f3f5f9] shrink-0">
                  <FlaskConical className="w-4 h-4 text-[#819fa7]" />
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#f3f5f9] leading-tight">
                    {t('currently.exploringLabel')}
                  </span>
                  <span className="text-xs text-white/40 leading-tight">
                    {t('currently.exploringDesc')}
                  </span>
                </div>
              </div>

              {/* Learning */}
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1a1a1a] border border-white/10 text-[#f3f5f9] shrink-0">
                  <Rocket className="w-4 h-4 text-[#819fa7]" />
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#f3f5f9] leading-tight">
                    {t('currently.learningLabel')}
                  </span>
                  <span className="text-xs text-white/40 leading-tight">
                    {t('currently.learningDesc')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Taraf: Richard Miculob Birebir 3D Card Stack (Dile göre ÖZELLİK / TRAIT) */}
          <div className="flex justify-end p-3 ml-auto">
            <div
              onClick={handleStackClick}
              className="relative w-[220px] h-[150px] cursor-pointer select-none"
              style={{ perspective: '800px' }}
              title="Kartı değiştirmek için tıkla"
            >
              {traits.map((trait, index) => {
                const pos = (index - currentIndex + traits.length) % traits.length;
                
                let styleObj: React.CSSProperties = {
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  willChange: 'transform, opacity',
                  transition: 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s ease, box-shadow 0.4s ease',
                  userSelect: 'none',
                };

                if (pos === 0) {
                  // Front Card (Tilted slightly left)
                  styleObj = {
                    ...styleObj,
                    background: '#141414',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
                    transform: `translate(${CARD_POSITIONS[0].tx}px, ${CARD_POSITIONS[0].ty}px) rotate(${CARD_POSITIONS[0].rot}deg) scale(${CARD_POSITIONS[0].sc})`,
                    opacity: CARD_POSITIONS[0].op,
                    zIndex: CARD_POSITIONS[0].z,
                  };
                } else if (pos === 1) {
                  // Second Card (Tilted right)
                  styleObj = {
                    ...styleObj,
                    background: '#131313',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 14px 30px -12px rgba(0, 0, 0, 0.5)',
                    transform: `translate(${CARD_POSITIONS[1].tx}px, ${CARD_POSITIONS[1].ty}px) rotate(${CARD_POSITIONS[1].rot}deg) scale(${CARD_POSITIONS[1].sc})`,
                    opacity: CARD_POSITIONS[1].op,
                    zIndex: CARD_POSITIONS[1].z,
                  };
                } else if (pos === 2) {
                  // Third Card (Tilted left)
                  styleObj = {
                    ...styleObj,
                    background: '#111111',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    boxShadow: '0 10px 25px -12px rgba(0, 0, 0, 0.4)',
                    transform: `translate(${CARD_POSITIONS[2].tx}px, ${CARD_POSITIONS[2].ty}px) rotate(${CARD_POSITIONS[2].rot}deg) scale(${CARD_POSITIONS[2].sc})`,
                    opacity: CARD_POSITIONS[2].op,
                    zIndex: CARD_POSITIONS[2].z,
                  };
                } else if (pos === traits.length - 1) {
                  // Exiting Card (Sliding out to the top-right)
                  styleObj = {
                    ...styleObj,
                    background: '#141414',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    transform: `translate(${CARD_POSITIONS[3].tx}px, ${CARD_POSITIONS[3].ty}px) rotate(${CARD_POSITIONS[3].rot}deg) scale(${CARD_POSITIONS[3].sc})`,
                    opacity: 0,
                    zIndex: 5,
                    pointerEvents: 'none',
                  };
                } else {
                  // Other hidden cards
                  styleObj = {
                    ...styleObj,
                    background: '#111111',
                    border: 'none',
                    transform: 'translate(40px, 30px) scale(0.8)',
                    opacity: 0,
                    zIndex: 1,
                    pointerEvents: 'none',
                  };
                }

                return (
                  <div
                    key={trait}
                    style={styleObj}
                    className="hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="font-mono text-[10px] font-semibold text-white/40 tracking-[0.2em] uppercase">
                      {t('traits.label')}
                    </div>
                    <div className="text-lg font-bold text-[#f3f5f9] tracking-tight">
                      {trait}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        </SectionReveal>
      </div>
    </section>
  );
}
