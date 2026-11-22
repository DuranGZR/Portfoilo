"use client";

import { useState } from 'react';
import { Code2, FlaskConical, Rocket } from 'lucide-react';
import { useTranslations, useMessages, useLocale } from 'next-intl';
import SectionReveal from '@/components/animations/SectionReveal';

const CARD_POSITIONS = [
  { tx: 0, ty: 0, rot: -2, sc: 1, op: 1, z: 30 },
  { tx: 5, ty: 7, rot: 3, sc: 0.97, op: 0.7, z: 20 },
  { tx: 10, ty: 14, rot: -4, sc: 0.94, op: 0.5, z: 10 },
  { tx: 15, ty: 21, rot: 0, sc: 0.9, op: 0, z: 5 },
];

export default function About() {
  const t = useTranslations('about');
  const locale = useLocale();
  const messages = useMessages() as any;
  const activeCvHref =
    locale === 'en' ? '/cv/Duran_Gezer_CV_EN.pdf' : '/cv/Duran_Gezer_CV_TR.pdf';

  // Localized traits array from i18n messages
  const traits: string[] = messages?.about?.traits?.items || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);
  const handleStackClick = () => {
    setCurrentIndex((index) => (index + 1) % traits.length);
  };

  return (
    <section id="about" className="relative md:min-h-screen flex flex-col justify-center py-20 sm:py-24 md:py-28 lg:py-32 px-4 md:px-6 bg-[#0d0d0d] portfolio-light:bg-paper content-visibility-auto">
      <div className="relative z-10 max-w-[1100px] w-full mx-auto md:my-auto">
        {/* Section Label + Title (Dile göre dinamik: TR'de HAKKIMDA, EN'de ABOUT ME) */}
        <SectionReveal delay={0}>
          <div className="mb-8">
            <div className="font-mono text-xs font-medium tracking-normal text-[#819fa7] portfolio-light:text-ink-accent normal-case mb-2">
              {t('badge')}
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-[54px] font-display font-semibold text-[#f3f5f9] portfolio-light:text-ink tracking-tight leading-[1.08]">
              {t('headline')}
            </h2>
          </div>
        </SectionReveal>

        {/* Profile Card Layout: Sol tarafta Profil Resmi, Sağ tarafta İsim + Sayaçlar + Bio */}
        <SectionReveal delay={0.12}>
          <div className="flex flex-col sm:flex-row items-start gap-6 md:gap-7">
          {/* Avatar (140x140px tam yuvarlak profil çerçevesi) */}
          <div className="shrink-0">
            <div className="w-[140px] h-[140px] rounded-full overflow-hidden border border-white/10 portfolio-light:border-paper-line bg-[#161616] portfolio-light:bg-paper-tint relative flex items-center justify-center">
              {!imgFailed ? (
                <img
                  src="/profilFoto.jpg"
                  alt={t('name')}
                  onError={() => setImgFailed(true)}
                  className="w-full h-full object-cover select-none pointer-events-none"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a2327] portfolio-light:from-paper-tint to-[#0f1416] portfolio-light:to-paper-raised text-[#819fa7] portfolio-light:text-ink-accent select-none">
                  <span className="font-display font-bold text-3xl tracking-wider text-gradient">
                    DG
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Info (İsim, Sayaçlar ve Biyografi) */}
          <div className="flex-1 flex flex-col gap-2">
            {/* İsim */}
            <div className="inline-flex items-center gap-2 text-xl font-bold text-[#f3f5f9] portfolio-light:text-ink tracking-tight font-display">
              <span>{t('name')}</span>
            </div>

            {/* Quick Stats: PROJECTS | CERTIFICATES | GRADUATED */}
            <div className="flex flex-row items-center gap-8 mt-1">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-xs font-medium text-white/40 portfolio-light:text-ink-muted tracking-normal normal-case">
                  {t('stats.projectsLabel')}
                </span>
                <span className="text-base font-bold text-[#f3f5f9] portfolio-light:text-ink leading-tight">
                  {t('stats.projectsValue')}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-xs font-medium text-white/40 portfolio-light:text-ink-muted tracking-normal normal-case">
                  {t('stats.certsLabel')}
                </span>
                <span className="text-base font-bold text-[#f3f5f9] portfolio-light:text-ink leading-tight">
                  {t('stats.certsValue')}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-xs font-medium text-white/40 portfolio-light:text-ink-muted tracking-normal normal-case">
                  {t('stats.gradLabel')}
                </span>
                <span className="text-base font-bold text-[#f3f5f9] portfolio-light:text-ink leading-tight">
                  {t('stats.gradValue')}
                </span>
              </div>
            </div>

            {/* Description Paragraph */}
            <div className="text-[15px] leading-[1.8] text-white/60 portfolio-light:text-ink-muted mt-3 space-y-4 max-w-[950px]">
              <p>
                {t('bio')}
              </p>
              <p>
                {t('resumeCta')}{' '}
                <a
                  href={activeCvHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white portfolio-light:text-ink font-semibold underline underline-offset-4 hover:opacity-75 transition-opacity"
                >
                  {t('resumeLink')}
                </a>{' '}
                <span className="text-xs font-mono text-white/40 portfolio-light:text-ink-muted">
                  (
                  <a
                    href="/cv/Duran_Gezer_CV_TR.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white portfolio-light:hover:text-ink transition-colors"
                  >
                    TR
                  </a>
                  {' · '}
                  <a
                    href="/cv/Duran_Gezer_CV_EN.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white portfolio-light:hover:text-ink transition-colors"
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
            <div className="font-mono text-xs font-medium tracking-normal text-white/40 portfolio-light:text-ink-muted normal-case">
              {t('currently.title')}
            </div>
            <div className="flex flex-wrap items-center gap-6 sm:gap-7">
              {/* Building */}
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1a1a1a] portfolio-light:bg-paper-raised border border-white/10 portfolio-light:border-paper-line text-[#f3f5f9] portfolio-light:text-ink shrink-0">
                  <Code2 className="w-4 h-4 text-[#819fa7] portfolio-light:text-ink-accent" />
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#f3f5f9] portfolio-light:text-ink leading-tight">
                    {t('currently.buildingLabel')}
                  </span>
                  <span className="text-xs text-white/40 portfolio-light:text-ink-muted leading-tight">
                    {t('currently.buildingDesc')}
                  </span>
                </div>
              </div>

              {/* Exploring */}
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1a1a1a] portfolio-light:bg-paper-raised border border-white/10 portfolio-light:border-paper-line text-[#f3f5f9] portfolio-light:text-ink shrink-0">
                  <FlaskConical className="w-4 h-4 text-[#819fa7] portfolio-light:text-ink-accent" />
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#f3f5f9] portfolio-light:text-ink leading-tight">
                    {t('currently.exploringLabel')}
                  </span>
                  <span className="text-xs text-white/40 portfolio-light:text-ink-muted leading-tight">
                    {t('currently.exploringDesc')}
                  </span>
                </div>
              </div>

              {/* Learning */}
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1a1a1a] portfolio-light:bg-paper-raised border border-white/10 portfolio-light:border-paper-line text-[#f3f5f9] portfolio-light:text-ink shrink-0">
                  <Rocket className="w-4 h-4 text-[#819fa7] portfolio-light:text-ink-accent" />
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#f3f5f9] portfolio-light:text-ink leading-tight">
                    {t('currently.learningLabel')}
                  </span>
                  <span className="text-xs text-white/40 portfolio-light:text-ink-muted leading-tight">
                    {t('currently.learningDesc')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Project decisions; visitors control when the card changes. */}
          <div className="flex justify-end p-3 ml-auto">
            <button
              type="button"
              disabled={traits.length < 2}
              onClick={handleStackClick}
              className="relative w-[240px] h-[170px] text-left cursor-pointer select-none rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#819fa7]"
              style={{ perspective: '800px' }}
              aria-label={`${traits[currentIndex]}. ${t('traits.next')}`}
              title={t('traits.next')}
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
                  transition: 'transform 0.25s ease, opacity 0.25s ease',
                  userSelect: 'none',
                };

                if (pos === 0) {
                  // Front Card (Tilted slightly left)
                  styleObj = {
                    ...styleObj,
                    background: 'var(--about-card-raised, #141414)',
                    border: '1px solid var(--about-card-line, rgba(255, 255, 255, 0.12))',
                    boxShadow: 'var(--about-card-shadow, 0 20px 40px -15px rgba(0, 0, 0, 0.7))',
                    transform: `translate(${CARD_POSITIONS[0].tx}px, ${CARD_POSITIONS[0].ty}px) rotate(${CARD_POSITIONS[0].rot}deg) scale(${CARD_POSITIONS[0].sc})`,
                    opacity: CARD_POSITIONS[0].op,
                    zIndex: CARD_POSITIONS[0].z,
                  };
                } else if (pos === 1) {
                  // Second Card (Tilted right)
                  styleObj = {
                    ...styleObj,
                    background: 'var(--about-card-tint, #131313)',
                    border: '1px solid var(--about-card-line, rgba(255, 255, 255, 0.08))',
                    boxShadow: 'var(--about-card-shadow, 0 14px 30px -12px rgba(0, 0, 0, 0.5))',
                    transform: `translate(${CARD_POSITIONS[1].tx}px, ${CARD_POSITIONS[1].ty}px) rotate(${CARD_POSITIONS[1].rot}deg) scale(${CARD_POSITIONS[1].sc})`,
                    opacity: CARD_POSITIONS[1].op,
                    zIndex: CARD_POSITIONS[1].z,
                  };
                } else if (pos === 2) {
                  // Third Card (Tilted left)
                  styleObj = {
                    ...styleObj,
                    background: 'var(--about-card-selected, #111111)',
                    border: '1px solid var(--about-card-line, rgba(255, 255, 255, 0.05))',
                    boxShadow: 'var(--about-card-shadow, 0 10px 25px -12px rgba(0, 0, 0, 0.4))',
                    transform: `translate(${CARD_POSITIONS[2].tx}px, ${CARD_POSITIONS[2].ty}px) rotate(${CARD_POSITIONS[2].rot}deg) scale(${CARD_POSITIONS[2].sc})`,
                    opacity: CARD_POSITIONS[2].op,
                    zIndex: CARD_POSITIONS[2].z,
                  };
                } else if (pos === traits.length - 1) {
                  // Exiting Card (Sliding out to the top-right)
                  styleObj = {
                    ...styleObj,
                    background: 'var(--about-card-raised, #141414)',
                    border: '1px solid var(--about-card-line, rgba(255, 255, 255, 0.05))',
                    transform: `translate(${CARD_POSITIONS[3].tx}px, ${CARD_POSITIONS[3].ty}px) rotate(${CARD_POSITIONS[3].rot}deg) scale(${CARD_POSITIONS[3].sc})`,
                    opacity: 0,
                    zIndex: 5,
                    pointerEvents: 'none',
                  };
                } else {
                  // Other hidden cards
                  styleObj = {
                    ...styleObj,
                    background: 'var(--about-card-selected, #111111)',
                    border: 'none',
                    transform: 'translate(40px, 30px) scale(0.8)',
                    opacity: 0,
                    zIndex: 1,
                    pointerEvents: 'none',
                  };
                }

                return (
                  <span key={trait} style={styleObj} aria-hidden={pos !== 0} className="motion-reduce:!transition-none">
                    <span className="font-mono text-xs font-medium text-white/40 portfolio-light:text-ink-muted">
                      {t('traits.label')} · {index + 1}/{traits.length}
                    </span>
                    <span className="text-base font-semibold leading-relaxed text-[#f3f5f9] portfolio-light:text-ink">
                      {trait}
                    </span>
                  </span>
                );
              })}
            </button>
          </div>
        </div>
        </SectionReveal>
      </div>
    </section>
  );
}
